import { Controller, Get, Post, Param, Body, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { HumanMessage } from '@langchain/core/messages';
import { AgentService } from '../agent/agent.service';
import { ConversationStreamManager } from './conversation-stream.manager';
import { SecretsService } from '../secrets/secrets.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { randomUUID } from 'crypto';

@UseGuards(ClerkAuthGuard)
@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);
  constructor(
    private readonly agentService: AgentService,
    private readonly streamManager: ConversationStreamManager,
    private readonly secrets: SecretsService,
  ) {}

  @Post(':threadId/stream')
  async handleStream(
    @Param('threadId') threadId: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    this.logger.log(`Received stream request for thread ${threadId}`, 'ChatController');
    const { messages } = body;
    const userId = (req as any).auth?.userId || 'anonymous';
    
    await this.agentService.ensureReady();
    
    // Vercel AI SDK Data Stream Protocol Headers (SSE format)
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('x-vercel-ai-ui-message-stream', 'v1'); // Required for Vercel AI SDK
    if ((res as any).flushHeaders) (res as any).flushHeaders();

    // Helper to write SSE data
    const writeSSE = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // 1. Lock - connect client to manager
    this.streamManager.addClient(threadId, res);
    const session = this.streamManager.getOrCreateSession(threadId);

    // 2. Dump Buffer
    this.streamManager.dumpBuffer(threadId, res);

    if (session.isActive) {
      // Reconnect to an already-active generation
      if (!messages?.length) {
         // Keep open indefinitely to catch tokens from the active stream
         return;
      }
    }

    if (!messages || messages.length === 0) {
      res.end();
      return;
    }

    // ── Resolve per-user model credentials from database ──
    this.logger.log(`Resolving model credentials for user ${userId}`, 'ChatController');
    const modelSecret: any = await this.secrets.resolveModelForUser(userId);
    
    if (!modelSecret) {
      this.logger.warn(`No model secret found for user ${userId}`, 'ChatController');
      writeSSE({ type: 'error', errorText: 'No model configured. Please add an API key in Settings.' });
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }
    
    if (!modelSecret.apiKey) {
      this.logger.warn(`Model secret found but no API key for user ${userId}. Keys in object: ${Object.keys(modelSecret).join(', ')}`, 'ChatController');
      writeSSE({ type: 'error', errorText: 'No API key found in model configuration. Please check your Settings.' });
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const apiKey: string = modelSecret.apiKey;
    const modelName: string = modelSecret.model || 'gpt-4o-mini';
    const baseUrl: string | undefined = modelSecret.baseUrl;
    
    // Resolve Serper API key
    const serperApiKey = await this.secrets.resolveSerperKeyForUser(userId);
    
    console.log('=== About to create graph ===');
    console.log('apiKey from modelSecret:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
    console.log('modelName:', modelName);
    console.log('baseUrl:', baseUrl);
    console.log('serperApiKey:', serperApiKey ? 'PRESENT' : 'MISSING');
    
    this.logger.log(`Using model: ${modelName}, baseUrl: ${baseUrl || 'default'}, apiKeyLength: ${apiKey?.length || 0}, hasSerper: ${!!serperApiKey} for thread ${threadId}`, 'ChatController');

    // Validate API key format
    if (!apiKey || apiKey.trim().length < 10) {
      this.logger.error(`Invalid API key format for user ${userId}`, 'ChatController');
      writeSSE({ type: 'error', errorText: 'Invalid API key format. Please check your Settings.' });
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const graph = this.agentService.getCompiledGraph({ apiKey, modelName, baseUrl, serperApiKey });

    try {
      // Use the last user message to prompt LangGraph
      const latestMessage = messages[messages.length - 1];
      let extraction = latestMessage.content;
      if (!extraction && latestMessage.parts) {
        extraction = latestMessage.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('');
      }
      const text = extraction || '';

      this.logger.log(`Parsed user text: "${text}" for thread ${threadId}`, 'ChatController');
      
      // Send message start event
      const messageId = randomUUID();
      writeSSE({ type: 'start', messageId });
      
      // Start text block
      const textId = randomUUID();
      writeSSE({ type: 'text-start', id: textId });
      
      const payload = { messages: [new HumanMessage(text)] };
      
      // Ensure all config values are present
      if (!apiKey) {
        this.logger.error('API key is missing before creating config');
        writeSSE({ type: 'error', errorText: 'API key is missing' });
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
      
      const config = { 
        configurable: { 
          thread_id: threadId,
          apiKey: apiKey,
          modelName: modelName,
          baseUrl: baseUrl,
          serperApiKey: serperApiKey,
        } 
      };
      
      this.logger.log(`Config being passed to stream: thread_id=${threadId}, apiKey=${apiKey?.substring(0, 10)}..., modelName=${modelName}, baseUrl=${baseUrl}`, 'ChatController');
      
      this.logger.log(`Creating stream generator for thread ${threadId}`, 'ChatController');
      
      // Use LangGraph's stream with multiple modes: updates, custom, messages
      const streamModes = ['updates', 'messages'] as ('updates' | 'messages')[];
      const generator = await graph.stream(payload, { 
        ...config,
        streamMode: streamModes,
      });
      
      this.streamManager.setGenerator(threadId, generator as any);

      // 4. Read Live Stream with multiple modes
      this.logger.log(`Starting stream iteration for thread ${threadId}`, 'ChatController');
      let eventCount = 0;
      let tokenCount = 0;
      
      for await (const [mode, chunk] of generator as any) {
        eventCount++;
        
        // Log every 10th event for debugging
        if (eventCount % 10 === 0) {
          this.logger.debug(`Event ${eventCount}: mode=${mode} for thread ${threadId}`);
        }
        
        if (mode === 'messages') {
          // LLM token streaming - chunk is [message_chunk, metadata]
          const [messageChunk, metadata] = chunk as any;
          if (messageChunk?.content && typeof messageChunk.content === 'string') {
            tokenCount++;
            // Send text delta in Vercel AI SDK format
            writeSSE({ type: 'text-delta', id: textId, delta: messageChunk.content });
          }
        } else if (mode === 'updates') {
          // Node state updates - chunk is { nodeName: stateUpdate }
          const nodeName = Object.keys(chunk)[0];
          const stateUpdate = chunk[nodeName];
          
          this.logger.log(`Node ${nodeName} completed for thread ${threadId}`, 'ChatController');
          
          // Stream agent state updates as custom data
          // This includes plan updates, evidence, etc.
          if (stateUpdate.plan) {
            writeSSE({ 
              type: 'data-plan',
              data: stateUpdate.plan 
            });
          }
          
          if (stateUpdate.evidence && stateUpdate.evidence.length > 0) {
            writeSSE({ 
              type: 'data-evidence',
              data: { count: stateUpdate.evidence.length }
            });
          }
          
          if (stateUpdate.error) {
            writeSSE({ 
              type: 'error',
              errorText: stateUpdate.error.message || 'An error occurred'
            });
          }
          
          // Send node progress update
          writeSSE({
            type: 'data-node-progress',
            data: { node: nodeName, status: 'completed' }
          });
        }
      }

      this.logger.log(`streamEvents finished for thread ${threadId}. Total events: ${eventCount}, tokens: ${tokenCount}`, 'ChatController');
      
      // End text block
      writeSSE({ type: 'text-end', id: textId });
      
      // Send stream termination (this is all we need)
      res.write('data: [DONE]\n\n');
      
      // Small delay to ensure all data is flushed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.streamManager.destroySession(threadId);

    } catch (e) {
      this.logger.error(`Stream error for thread ${threadId}: ${e.message}`, e.stack);
      writeSSE({ type: 'error', errorText: e.message });
      res.write('data: [DONE]\n\n');
      
      // Small delay before destroying to ensure error is sent
      await new Promise(resolve => setTimeout(resolve, 50));
      this.streamManager.destroySession(threadId);
    }
  }

  @Get(':threadId/history')
  async getHistory(@Param('threadId') threadId: string) {
    this.logger.log(`Fetching history for thread ${threadId}`, 'ChatController');
    try {
      await this.agentService.ensureReady();
      const config = { configurable: { thread_id: threadId } };
      const ckpt: any = await this.agentService.checkpointer.get(config);
      if (!ckpt || !ckpt.channel_values) {
        return { messages: [], plan: null, plans: [], evidence: [] };
      }
      
      // Convert LangChain messages to plain format for frontend
      const rawMessages = ckpt.channel_values.messages || [];
      const messages = rawMessages.map((msg: any, index: number) => {
        // Handle LangChain serialized format
        if (msg.lc && msg.kwargs) {
          return {
            id: msg.kwargs.id || `msg-${index}`,
            role: msg.id?.[2] === 'HumanMessage' ? 'user' : 'assistant',
            content: msg.kwargs.content || '',
            type: msg.id?.[2] || 'unknown'
          };
        }
        // Handle plain message objects
        return {
          id: msg.id || `msg-${index}`,
          role: msg._getType?.() === 'human' || msg.constructor?.name === 'HumanMessage' ? 'user' : 'assistant',
          content: msg.content || '',
          type: msg._getType?.() || msg.constructor?.name || 'unknown'
        };
      });
      
      return {
        messages,
        plan: ckpt.channel_values.plan || null,
        plans: ckpt.channel_values.plans || [],
        evidence: ckpt.channel_values.evidence || [],
      };
    } catch (err) {
      this.logger.error(`Error fetching history for thread ${threadId}: ${err.message}`, 'ChatController');
      return { messages: [], plan: null, plans: [], evidence: [], error: err.message };
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';

export interface StreamSession {
  tokenBuffer: Array<{ type: string; data: any }>;
  clients: Set<Response>;
  isActive: boolean;
  generator?: AsyncGenerator<any, any, unknown>;
}

@Injectable()
export class ConversationStreamManager {
  private readonly logger = new Logger(ConversationStreamManager.name);
  private sessions = new Map<string, StreamSession>();

  getOrCreateSession(threadId: string): StreamSession {
    if (!this.sessions.has(threadId)) {
      this.sessions.set(threadId, {
        tokenBuffer: [],
        clients: new Set(),
        isActive: false,
      });
      this.logger.log(`Created new stream session for ${threadId}`);
    }
    return this.sessions.get(threadId);
  }

  addClient(threadId: string, client: Response) {
    const session = this.getOrCreateSession(threadId);
    session.clients.add(client);
    this.logger.log(`Client attached to stream ${threadId}. Total clients: ${session.clients.size}`);
    
    // Handle disconnect cleanly
    client.on('close', () => {
      this.logger.log(`Client disconnected from stream ${threadId}`);
      session.clients.delete(client);
    });
  }

  pushToken(threadId: string, token: string) {
    const session = this.sessions.get(threadId);
    if (!session) return;
    
    const event = { type: 'text-delta', data: token };
    
    if (session.clients.size > 0) {
      // Vercel AI SDK SSE format: data: {...}\n\n
      const payload = `data: ${JSON.stringify(event)}\n\n`;
      session.clients.forEach(c => c.write(payload));
    } else {
      // Buffer if nobody is listening
      session.tokenBuffer.push(event);
    }
  }

  pushData(threadId: string, data: any) {
    const session = this.sessions.get(threadId);
    if (!session) return;
    
    const event = { type: 'data', data };
    
    // Vercel AI SDK SSE format
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    if (session.clients.size > 0) {
      session.clients.forEach(c => c.write(payload));
    } else {
      session.tokenBuffer.push(event);
    }
  }

  dumpBuffer(threadId: string, client: Response) {
    const session = this.sessions.get(threadId);
    if (!session || session.tokenBuffer.length === 0) return;
    
    this.logger.log(`Dumping ${session.tokenBuffer.length} buffered events for ${threadId} (Catch-up phase)`);
    for (const event of session.tokenBuffer) {
      client.write(`data: ${JSON.stringify(event)}\n\n`);
    }
    // Clear buffer once flushed to the new client
    session.tokenBuffer = [];
  }

  setGenerator(threadId: string, generator: AsyncGenerator<any, any, unknown>) {
    const session = this.getOrCreateSession(threadId);
    session.generator = generator;
    session.isActive = true;
  }

  destroySession(threadId: string) {
    this.logger.log(`Destroying active stream session ${threadId}`);
    const session = this.sessions.get(threadId);
    if (session) {
      // Signal stream completion
      session.clients.forEach(c => c.end());
      this.sessions.delete(threadId);
    }
  }
}

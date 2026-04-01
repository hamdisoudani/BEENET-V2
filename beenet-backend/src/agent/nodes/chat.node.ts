import { Logger } from '@nestjs/common';
import { RunnableConfig } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage } from '@langchain/core/messages';
import { AgentStateType } from '../agent.state';

const logger = new Logger('ChatNode');

function buildChatSystemPromptDirect(language: string, nowIso: string, tzName: string, plannerReason?: string): string {
  return `You are a helpful AI assistant.

Current time: ${nowIso} (${tzName})
Language: ${language}

${plannerReason ? `Note: ${plannerReason}` : ''}

Provide clear, accurate, and helpful responses based on your training data.`;
}

function buildChatSystemPromptSearch(
  language: string,
  nowIso: string,
  tzName: string,
  evidence: any[],
): string {
  // Build citations index
  const urlToIdx: Record<string, number> = {};
  let idx = 1;
  for (const ev of evidence) {
    if (ev.url && !urlToIdx[ev.url]) {
      urlToIdx[ev.url] = idx++;
    }
  }

  const citationsIndex = Object.entries(urlToIdx)
    .sort((a, b) => a[1] - b[1])
    .map(([url, i]) => `[${i}] ${url}`)
    .join('\n');

  // Build evidence sections
  const grouped: Record<string, string[]> = {};
  const order: string[] = [];

  for (const ev of evidence) {
    if (!ev.url || !ev.markdown) continue;
    if (!grouped[ev.url]) {
      grouped[ev.url] = [];
      order.push(ev.url);
    }
    grouped[ev.url].push(ev.markdown);
  }

  const evidenceSections = order.map(url => {
    const marker = urlToIdx[url];
    const header = `Source [${marker}] — ${url}`;
    const body = grouped[url].join('\n\n');
    return `${header}\n${body}`;
  }).join('\n\n---\n\n');

  return `You are a helpful AI assistant with access to web search results.

Current time: ${nowIso} (${tzName})
Language: ${language}

IMPORTANT: You have access to evidence from web sources. Use this information to provide accurate, up-to-date answers.

${citationsIndex ? `Citations index:\n${citationsIndex}\n\n` : ''}

EVIDENCE FROM WEB SOURCES:
${evidenceSections}

---

When answering:
1. Use the evidence provided above to give accurate, current information
2. Cite sources using [1], [2], etc. format when referencing specific information
3. If the evidence doesn't fully answer the question, say so
4. Synthesize information from multiple sources when appropriate
5. Be clear about what information comes from which source`;
}

export async function chatNode(
  state: AgentStateType,
  config: RunnableConfig
): Promise<Partial<AgentStateType> & { goto?: string }> {
  try {
    logger.log('=== CHAT NODE CALLED ===');
    logger.log(`Evidence count: ${state.evidence?.length || 0}`);
    logger.log(`Plan mode: ${state.plan?.mode}`);
    logger.log(`Plan steps: ${state.plan?.steps?.length || 0}`);
    
    const modelConfig = (config as any)?.configurable;
    if (!modelConfig?.apiKey) {
      logger.error('No API key provided to chat node');
      return {
        error: { type: 'model_init_error', message: 'Failed to initialize the selected model.' },
        goto: '__end__',
      };
    }

    // Create model with streaming enabled
    const chatModelConfig: any = {
      modelName: modelConfig.modelName || 'gpt-4o-mini',
      temperature: 0.7,
      streaming: true,
    };

    if (modelConfig.baseUrl) {
      chatModelConfig.configuration = {
        baseURL: modelConfig.baseUrl,
        apiKey: modelConfig.apiKey,
      };
    } else {
      chatModelConfig.openAIApiKey = modelConfig.apiKey;
    }

    const model = new ChatOpenAI(chatModelConfig);

    // Build system prompt based on mode
    const now = new Date();
    const nowIso = now.toISOString();
    const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = 'english';

    let systemPrompt: string;

    if (state.plan?.mode === 'search' && state.evidence && state.evidence.length > 0) {
      systemPrompt = buildChatSystemPromptSearch(language, nowIso, tzName, state.evidence);
      logger.log(`Chat: using search mode with ${state.evidence.length} evidence items`);
    } else {
      systemPrompt = buildChatSystemPromptDirect(language, nowIso, tzName, state.plan?.reason);
      logger.log('Chat: using direct mode');
    }

    // Get recent messages
    const recentMessages = state.messages.slice(-8);
    const messages = [new SystemMessage(systemPrompt), ...recentMessages];

    logger.log(`Chat: invoking model with ${messages.length} messages`);
    const response = await model.invoke(messages, config);

    logger.log('Chat: model responded successfully');

    return {
      messages: [response],
      goto: '__end__',
    };
  } catch (error) {
    logger.error(`Chat error: ${error.message}`);
    return {
      error: { type: 'model_error', message: 'The selected model failed to respond.' },
      goto: '__end__',
    };
  }
}

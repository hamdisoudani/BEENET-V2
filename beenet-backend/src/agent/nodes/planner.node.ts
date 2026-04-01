import { Logger } from '@nestjs/common';
import { AIMessage, SystemMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { AgentStateType, PlanStep, ResearchPlan } from '../agent.state';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const logger = new Logger('PlannerNode');

// Planner tool for setting research plan
const setResearchPlanTool = tool(
  async ({ mode, steps, reason, structured_steps }) => {
    return { mode, steps, reason, structured_steps };
  },
  {
    name: 'set_research_plan',
    description: 'Set the research plan mode and steps',
    schema: z.object({
      mode: z.enum(['direct', 'search']).describe('Whether to answer directly or search the web'),
      steps: z.array(z.string()).optional().describe('List of step titles (legacy)'),
      reason: z.string().optional().describe('Rationale for the chosen mode'),
      structured_steps: z.array(z.object({
        title: z.string().describe('Step title'),
        queries: z.array(z.string()).describe('Search queries for this step'),
        controls: z.object({
          time_range: z.enum(['any', 'day', 'week', 'month', 'year']).optional(),
          country: z.string().length(2).optional(),
          autocorrect: z.boolean().optional(),
          max_results: z.number().min(1).max(50).optional(),
        }).optional(),
      })).optional().describe('Structured steps with queries and controls'),
    }),
  }
);

function buildPlannerSystemPrompt(nowIso: string, tzName: string, currentYear: number): string {
  return `You are a STRICT router that returns only a SINGLE tool call to set_research_plan.
Never answer the user. Never produce prose or JSON outside the tool call.
Never disclaim about lacking web access; execution is downstream, not your job.

Current time: ${nowIso}
Timezone: ${tzName}

Agent workflow:
- Your job is CLASSIFICATION only. You decide the plan; you do NOT execute it.
- Choosing mode='search' DOES NOT mean you will search; a downstream agent will.
- If uncertain about recency, prefer mode='search'.

Deciding mode:
- Use mode='search' for real-time/current/dated/source-backed info (today, now, news, releases, prices, events, weather).
- Use mode='direct' for timeless knowledge, tutorials, opinions.

When mode='search':
- Return only structured_steps (1–6). Each step has: { title, queries[1..3], controls? }.
- Title: specific subgoal (not a query).
- Queries: high-signal dorks (1–3), usually include the current year (${currentYear}) when recency matters.
- Controls (optional) to target Serper: { time_range, country, autocorrect, max_results }.

Controls (explain like I'm 5):
- time_range: choose one of [any, day, week, month, year]. Use for news or fresh info.
  Example uses: 'today', 'this week', 'latest', 'new', 'recent changes' → set appropriately.
- country: two letters like 'us', 'gb', 'de' (where the user cares about location).
- autocorrect: true by default. Set false only if exact spellings are important.
- max_results: 1–50 (default 10). Keep small and efficient (5–10) unless needed.

Search best practices:
- Be laser-focused on the user intent and entities.
- Prefer official docs and authoritative sources (use site: when helpful).
- Avoid non-text sources (exclude YouTube, PDFs, images).
- Use operators when helpful: site:, inurl:, intitle:, filetype:html.

What to return (MANDATORY):
- Exactly one call to set_research_plan with args: { mode: 'direct'|'search', reason?: string, structured_steps?: [{title, queries[], controls?}] }.
- If mode='direct': omit structured_steps; provide a short reason (<=160 chars).
- If mode='search': provide structured_steps with specific titles, 1–3 strong queries, and controls only when useful.

Examples:
User: 'What are today's tech layoffs?'
Good: mode='search', structured_steps=[{
  'title': 'Find today tech layoffs',
  'queries': ['tech layoffs ${currentYear} today site:techcrunch.com', 'tech layoffs today ${currentYear} site:bloomberg.com'],
  'controls': { 'time_range': 'day', 'country': 'us', 'max_results': 10 }
}]

User: 'What's the weather in Tunisia, Gafsa?'
Good: mode='search', structured_steps=[{
  'title': 'Current weather in Gafsa, Tunisia',
  'queries': ['Gafsa Tunisia weather today', 'current weather Gafsa Tunisia ${currentYear}'],
  'controls': { 'time_range': 'day', 'country': 'tn', 'max_results': 5 }
}]

Return only the tool call. No extra text.`;
}

export async function plannerNode(
  state: AgentStateType,
  config: RunnableConfig
): Promise<Partial<AgentStateType> & { goto?: string }> {
  try {
    const modelConfig = (config as any)?.configurable;
    
    // Log config without circular references
    logger.log(`Planner node received config with keys: ${Object.keys(modelConfig || {}).join(', ')}`);
    
    if (!modelConfig?.apiKey) {
      logger.error('No API key provided to planner');
      return {
        error: { type: 'planner_model_init_error', message: 'Failed to initialize planner model.' },
        goto: '__end__',
      };
    }

    // Create model with same config as main agent
    const chatModelConfig: any = {
      modelName: modelConfig.modelName || 'gpt-4o-mini',
      temperature: 0.7,
      streaming: false, // Planner doesn't need streaming
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

    // Build system prompt
    const now = new Date();
    const nowIso = now.toISOString();
    const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currentYear = now.getFullYear();

    const systemPrompt = buildPlannerSystemPrompt(nowIso, tzName, currentYear);

    // Get recent messages (last 30)
    const recentMessages = state.messages.slice(-30);
    const messages = [new SystemMessage(systemPrompt), ...recentMessages];

    // Bind tool and invoke
    const modelWithTool = model.bindTools([setResearchPlanTool], {
      tool_choice: 'set_research_plan',
    });

    logger.log(`Planner invoking model with ${messages.length} messages`);
    const response = await modelWithTool.invoke(messages, config);

    // Extract tool call
    let mode: 'direct' | 'search' = 'direct';
    let reason: string | undefined;
    let structuredSteps: any[] | undefined;

    if (response instanceof AIMessage && response.tool_calls && response.tool_calls.length > 0) {
      const toolCall = response.tool_calls[0];
      const args = toolCall.args;

      mode = (args.mode || 'direct') as 'direct' | 'search';
      reason = args.reason;
      structuredSteps = args.structured_steps;

      logger.log(`Planner parsed: mode=${mode}, structured_steps=${!!structuredSteps}, reason=${reason}`);
    } else {
      logger.error('Planner did not return tool call - attempting self-heal');
      
      // Self-healing: Try to extract intent from response content
      const content = response.content?.toString().toLowerCase() || '';
      
      // Check if response mentions search-related keywords
      const searchKeywords = ['search', 'current', 'latest', 'recent', 'today', 'now', 'weather', 'news', 'price', 'who is', 'what is'];
      const needsSearch = searchKeywords.some(keyword => content.includes(keyword));
      
      // Also check the user's question
      const lastUserMsg = [...recentMessages].reverse().find(m => m._getType() === 'human');
      const userQuery = lastUserMsg?.content?.toString().toLowerCase() || '';
      const userNeedsSearch = searchKeywords.some(keyword => userQuery.includes(keyword));
      
      if (needsSearch || userNeedsSearch) {
        logger.log('Self-heal: Detected search intent, creating search plan');
        mode = 'search';
        reason = 'Detected need for current information (self-healed from failed tool call)';
        
        // Extract query from user message
        const queryText = lastUserMsg?.content?.toString() || 'Search the web';
        
        structuredSteps = [{
          title: queryText.slice(0, 100),
          queries: [queryText.slice(0, 100)],
        }];
      } else {
        logger.warn('Self-heal: No search intent detected, defaulting to direct mode');
        mode = 'direct';
        reason = 'Tool calling not supported by model, answering directly with available knowledge';
      }
    }

    // Build plan steps
    const planSteps: PlanStep[] = [];

    if (mode === 'search' && structuredSteps && structuredSteps.length > 0) {
      for (const item of structuredSteps.slice(0, 6)) {
        const step: PlanStep = {
          id: randomUUID(),
          title: item.title,
          queries: item.queries.slice(0, 3),
          results: [],
          status: 'pending',
        };

        if (item.controls) {
          step.controls = item.controls;
        }

        planSteps.push(step);
      }
    } else if (mode === 'search' && planSteps.length === 0) {
      // Fallback: create one step from last user message
      const lastUserMsg = [...recentMessages].reverse().find(m => m._getType() === 'human');
      const fallbackTitle = lastUserMsg?.content?.toString().slice(0, 120) || 'Search the web';
      planSteps.push({
        id: randomUUID(),
        title: fallbackTitle,
        queries: [fallbackTitle],
        results: [],
        status: 'pending',
      });
    }

    const plan: ResearchPlan = {
      mode,
      steps: planSteps,
      reason,
    };

    logger.log(`Planner decided mode=${mode}; routing accordingly`);

    // Route based on mode
    if (mode === 'search') {
      return {
        plan,
        plans: [plan],
        goto: 'search_collect',
      };
    }

    return {
      plan,
      plans: [plan],
      goto: 'chat_node',
    };
  } catch (error) {
    logger.error(`Planner error: ${error.message}`);
    return {
      error: { type: 'planner_error', message: 'Planner failed to run.' },
      goto: '__end__',
    };
  }
}

import { Logger } from '@nestjs/common';
import { RunnableConfig } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { AgentStateType, SearchResult } from '../agent.state';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const logger = new Logger('SearchPickNode');

// URL picker tool
const pickUrlsTool = tool(
  async ({ step_id, urls }) => {
    return { step_id, urls };
  },
  {
    name: 'pick_urls',
    description: 'Select URLs to crawl for this research step',
    schema: z.object({
      step_id: z.string().describe('The step ID'),
      urls: z.array(z.string()).describe('Selected URLs to crawl'),
    }),
  }
);

export async function searchPickNode(
  state: AgentStateType,
  config: RunnableConfig
): Promise<Partial<AgentStateType> & { goto?: string }> {
  try {
    const plan = state.plan;
    if (!plan || plan.mode !== 'search') {
      logger.log('SearchPick: no search plan; nothing to do');
      return {};
    }

    // Find step in 'searching' status
    const steps = [...plan.steps];
    let stepIdx = steps.findIndex(s => s.status === 'searching');

    if (stepIdx === -1) {
      logger.log('SearchPick: no step in searching state');
      return {};
    }

    const step = steps[stepIdx];
    const candidates = state.search_candidates[step.id] || [];

    if (candidates.length === 0) {
      logger.warn(`SearchPick: no candidates for step ${step.id}`);
      step.status = 'completed';
      step.error = { type: 'picker_no_candidates', message: 'No search results to pick from.' };
      steps[stepIdx] = step;
      return {
        plan: { ...plan, steps },
        current_step_id: null,
      };
    }

    // Create model for picking
    const modelConfig = (config as any)?.configurable;
    if (!modelConfig?.apiKey) {
      logger.error('No API key for picker');
      step.status = 'completed';
      step.error = { type: 'picker_error', message: 'Failed to initialize picker model.' };
      steps[stepIdx] = step;
      return {
        plan: { ...plan, steps },
        error: { type: 'picker_error', message: 'Failed to initialize picker model.' },
        goto: '__end__',
      };
    }

    const chatModelConfig: any = {
      modelName: modelConfig.modelName || 'gpt-4o-mini',
      temperature: 0.7,
      streaming: false,
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

    // Build picker prompt
    const suggestedMin = 1;
    const suggestedMax = 3;

    const sysText = `You are a human-like web researcher evaluating Google search results.
Your job is to pick the most relevant URLs to crawl for the current step goal.

GUIDANCE:
- Suggested range: ${suggestedMin}-${suggestedMax} URLs (but use your judgment)
- If you see more than ${suggestedMax} relevant sites, focus on the HIGHEST QUALITY ones
- You must select at least 1 URL to proceed
- Quality over quantity - better to pick fewer excellent sources than many mediocre ones

MULTIPLE SOURCES STRATEGY:
- For critical information (news, stock prices, exchange rates, breaking events), consider selecting 2-3 sources to cross-verify
- Single sources can fail: websites go down, contain outdated data, or have errors
- For simple factual queries, 1-2 authoritative sources may suffice

Evaluate each URL like a human browsing Google:
- Title: Does it directly match what you're looking for?
- Snippet: Does the preview contain specific relevant information?
- Position: Higher positions (1-3) are usually more authoritative
- Domain: Prefer official sources, documentation, news sites; avoid forums, social media, PDFs

You MUST respond ONLY by calling the pick_urls tool with your selected URLs.`;

    const stepInfo = `Step Goal: ${step.title}\nQueries Used: ${step.queries.join(', ')}\n\n`;

    let candidatesText = 'Search Results to Evaluate:\n';
    for (let i = 0; i < Math.min(candidates.length, 15); i++) {
      const c = candidates[i];
      candidatesText += `${i + 1}. [${c.position || '?'}] ${c.title || 'No title'}\n`;
      candidatesText += `   URL: ${c.link}\n`;
      candidatesText += `   Snippet: ${c.snippet || 'No snippet'}\n\n`;
    }

    const candidateUrls = candidates.map(c => c.link);
    const humanText = stepInfo + candidatesText + `\nAvailable URLs: ${JSON.stringify(candidateUrls)}`;

    const messages = [
      new SystemMessage(sysText),
      new HumanMessage(humanText),
    ];

    const modelWithTool = model.bindTools([pickUrlsTool], {
      tool_choice: 'pick_urls',
    });

    logger.log(`SearchPick: invoking model for step ${step.id}`);
    const response = await modelWithTool.invoke(messages, config);

    let chosenUrls: string[] = [];

    if (response instanceof AIMessage && response.tool_calls && response.tool_calls.length > 0) {
      const toolCall = response.tool_calls[0];
      const args = toolCall.args;
      chosenUrls = args.urls || [];

      // Ensure at least one URL
      if (chosenUrls.length === 0 && candidateUrls.length > 0) {
        chosenUrls = [candidateUrls[0]];
      }
    } else {
      // Fallback: pick first candidate
      if (candidateUrls.length > 0) {
        chosenUrls = [candidateUrls[0]];
      }
    }

    logger.log(`SearchPick: selected ${chosenUrls.length} URLs for step ${step.id}`);
    logger.log(`Chosen URLs: ${chosenUrls.join(', ')}`);

    // Filter results to chosen URLs
    const chosenSet = new Set(chosenUrls);
    const chosenResults = candidates.filter(c => chosenSet.has(c.link));
    
    logger.log(`Filtered to ${chosenResults.length} results`);

    step.results = chosenResults;
    step.status = 'reading';
    steps[stepIdx] = step;
    
    logger.log(`Step ${step.id} status set to 'reading' with ${step.results.length} results`);

    return {
      plan: { ...plan, steps },
      search_candidates: { [step.id]: [] }, // Clear candidates
      current_step_id: step.id,
    };
  } catch (error) {
    logger.error(`SearchPick error: ${error.message}`);
    return {
      error: { type: 'picker_error', message: 'Failed to select URLs.' },
      goto: '__end__',
    };
  }
}

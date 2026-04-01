import { Logger } from '@nestjs/common';
import { RunnableConfig } from '@langchain/core/runnables';
import { AgentStateType, SearchResult, PlanStep } from '../agent.state';
import { randomUUID } from 'crypto';

const logger = new Logger('SearchCollectNode');

function faviconForUrl(url: string): string | undefined {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    if (!host) return undefined;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return undefined;
  }
}

function tbsFromTimeRange(val?: string): string | undefined {
  const map: Record<string, string> = {
    day: 'qdr:d',
    week: 'qdr:w',
    month: 'qdr:m',
    year: 'qdr:y',
  };
  return val ? map[val] : undefined;
}

async function searchQuery(query: string, serperKey: string, options: any = {}): Promise<SearchResult[]> {
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: options.max_results || 10,
        gl: options.country || 'us',
        hl: 'en',
        autocorrect: options.autocorrect !== false,
        ...(options.tbs ? { tbs: options.tbs } : {}),
      }),
    });

    if (!response.ok) {
      logger.error(`Serper API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const organic = data.organic || [];

    const results: SearchResult[] = [];
    for (const item of organic) {
      if (!item.link) continue;

      results.push({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        position: item.position,
        favicon: faviconForUrl(item.link),
      });
    }

    return results;
  } catch (error) {
    logger.error(`Serper search error: ${error.message}`);
    return [];
  }
}

export async function searchCollectNode(
  state: AgentStateType,
  config: RunnableConfig
): Promise<Partial<AgentStateType> & { goto?: string }> {
  try {
    const serperKey = (config as any)?.configurable?.serperApiKey;
    if (!serperKey) {
      logger.warn('No Serper API key provided');
      return {};
    }

    const plan = state.plan;
    if (!plan || plan.mode !== 'search') {
      logger.log('SearchCollect: no search plan; nothing to do');
      return {};
    }

    // Find first pending step
    const steps = [...plan.steps];
    let stepIdx = steps.findIndex(s => s.status === 'pending' && s.queries.length > 0);

    if (stepIdx === -1) {
      logger.log('SearchCollect: no pending steps');
      return {};
    }

    const step = steps[stepIdx];
    step.status = 'searching';
    steps[stepIdx] = step;

    // Update plan
    const updatedPlan = { ...plan, steps };

    // Execute searches for all queries in this step
    const queries = step.queries.slice(0, 5);
    const stepControls = step.controls || {};

    const searchPromises = queries.map(q =>
      searchQuery(q, serperKey, {
        max_results: stepControls.max_results || 10,
        country: stepControls.country || 'us',
        autocorrect: stepControls.autocorrect !== false,
        tbs: tbsFromTimeRange(stepControls.time_range),
      })
    );

    const resultsArrays = await Promise.all(searchPromises);

    // Aggregate and deduplicate results
    const seenUrls = new Set<string>();
    const aggregatedResults: SearchResult[] = [];

    for (const results of resultsArrays) {
      for (const result of results) {
        if (seenUrls.has(result.link)) continue;
        seenUrls.add(result.link);
        aggregatedResults.push(result);
      }
    }

    logger.log(`SearchCollect: collected ${aggregatedResults.length} results for step ${step.id}`);

    // Store in search_candidates
    const searchCandidates = {
      ...state.search_candidates,
      [step.id]: aggregatedResults,
    };

    return {
      plan: updatedPlan,
      search_candidates: searchCandidates,
      current_step_id: step.id,
    };
  } catch (error) {
    logger.error(`SearchCollect error: ${error.message}`);
    return {
      error: { type: 'search_collect_error', message: 'Failed to collect search results.' },
      goto: '__end__',
    };
  }
}

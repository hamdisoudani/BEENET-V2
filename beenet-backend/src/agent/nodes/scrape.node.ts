import { Logger } from '@nestjs/common';
import { RunnableConfig } from '@langchain/core/runnables';
import { AgentStateType, Evidence } from '../agent.state';

const logger = new Logger('ScrapeNode');

async function serperScrape(urls: string[], serperKey: string): Promise<any> {
  const results: any[] = [];
  const failedResults: any[] = [];

  // Scrape all URLs in parallel for speed
  const scrapePromises = urls.map(async (url) => {
    try {
      // Serper uses /scrape endpoint (singular) for one URL at a time
      const response = await fetch('https://google.serper.dev/scrape', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }), // Single URL, not array
        signal: AbortSignal.timeout(15000), // 15 second timeout per URL
      });

      if (response.status === 401) {
        return { url, error: 'serper_unauthorized' };
      }
      if (response.status === 402) {
        return { url, error: 'serper_payment_required' };
      }
      if (response.status === 429) {
        return { url, error: 'serper_rate_limited' };
      }
      if (!response.ok) {
        logger.error(`Serper scrape API error for ${url}: ${response.status}`);
        return { url, error: `provider_error_${response.status}` };
      }

      const data = await response.json();
      
      // Serper scrape returns 'markdown', 'text', or 'content'
      const rawContent = data.markdown || data.text || data.content;
      
      if (rawContent && typeof rawContent === 'string' && rawContent.trim()) {
        return {
          success: true,
          url,
          raw_content: rawContent,
          favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`,
        };
      } else {
        return { url, error: 'empty_content' };
      }
    } catch (error) {
      logger.error(`Serper scrape error for ${url}: ${error.message}`);
      return { url, error: 'extract_failed' };
    }
  });

  // Wait for all scrapes to complete in parallel
  const scrapeResults = await Promise.all(scrapePromises);

  // Separate successful results from failures
  for (const result of scrapeResults) {
    if (result.success) {
      const { success, ...rest } = result;
      results.push(rest);
    } else {
      failedResults.push(result);
    }
  }

  logger.log(`Serper scrape: results=${results.length}, failed=${failedResults.length}`);
  return { results, failed_results: failedResults };
}

export async function scrapeNode(
  state: AgentStateType,
  config: RunnableConfig
): Promise<Partial<AgentStateType> & { goto?: string }> {
  logger.log('=== SCRAPE NODE CALLED ===');
  try {
    const serperKey = (config as any)?.configurable?.serperApiKey;
    if (!serperKey) {
      logger.warn('No Serper API key provided');
      return {};
    }

    const plan = state.plan;
    if (!plan || plan.mode !== 'search') {
      logger.log('Scrape: no search plan; nothing to do');
      return {};
    }

    // Find step in 'reading' status
    const steps = [...plan.steps];
    logger.log(`Scrape: checking ${steps.length} steps for 'reading' status`);
    logger.log(`Step statuses: ${steps.map(s => `${s.title}: ${s.status}`).join(', ')}`);
    
    let stepIdx = steps.findIndex(s => s.status === 'reading');

    if (stepIdx === -1) {
      logger.log('Scrape: no step in reading state');
      return {};
    }

    const step = steps[stepIdx];
    const urls = step.results.map(r => r.link);

    if (urls.length === 0) {
      logger.warn(`Scrape: no URLs for step ${step.id}`);
      step.status = 'completed';
      steps[stepIdx] = step;
      return {
        plan: { ...plan, steps },
        current_step_id: null,
      };
    }

    logger.log(`Scrape: scraping ${urls.length} URLs for step ${step.id}`);
    logger.log(`URLs to scrape: ${urls.join(', ')}`);

    // Call Serper extract API
    const payload = await serperScrape(urls, serperKey);
    
    logger.log(`Serper extract response: ${JSON.stringify(payload).substring(0, 200)}...`);

    // Extract evidence
    const existingEvidence = [...(state.evidence || [])];
    const results = payload.results || [];
    
    logger.log(`Serper returned ${results.length} results, failed: ${(payload.failed_results || []).length}`);

    for (const item of results) {
      if (!item.url || !item.raw_content) continue;

      const evidence: Evidence = {
        stepId: step.id,
        url: item.url,
        markdown: item.raw_content,
        timestamp: new Date().toISOString(),
      };

      existingEvidence.push(evidence);
    }

    logger.log(`Scrape: extracted ${results.length} evidence items for step ${step.id}`);

    // Mark step as completed
    step.status = 'completed';
    steps[stepIdx] = step;

    return {
      plan: { ...plan, steps },
      evidence: existingEvidence,
      search_candidates: { [step.id]: [] }, // Clear candidates
      current_step_id: null,
    };
  } catch (error) {
    logger.error(`Scrape error: ${error.message}`);
    return {
      error: { type: 'scrape_error', message: 'Failed to scrape URLs.' },
      goto: '__end__',
    };
  }
}

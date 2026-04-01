import { Injectable, Logger } from '@nestjs/common';
import { StateGraph, START, END } from '@langchain/langgraph';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { Pool } from 'pg';
import { AgentState, AgentStateType } from './agent.state';
import { plannerNode } from './nodes/planner.node';
import { searchCollectNode } from './nodes/search-collect.node';
import { searchPickNode } from './nodes/search-pick.node';
import { scrapeNode } from './nodes/scrape.node';
import { chatNode } from './nodes/chat.node';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private initPromise: Promise<void>;
  public checkpointer: PostgresSaver;
  private pool: Pool;

  constructor() {
    this.initPromise = this.initCheckpointer();
  }

  private async initCheckpointer() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/beenet',
    });
    this.checkpointer = new PostgresSaver(this.pool);
    try {
      await this.checkpointer.setup();
      this.logger.log('Postgres Checkpointer Setup OK');
    } catch (e) {
      this.logger.error('Failed to setup Postgres Checkpointer: ' + e.message);
    }
  }

  async ensureReady() {
    await this.initPromise;
  }

  // Helper functions for conditional routing
  private hasPendingSteps(state: AgentStateType): boolean {
    if (!state.plan || state.plan.mode !== 'search') return false;
    return state.plan.steps.some(s => s.status === 'pending');
  }

  private needsPick(state: AgentStateType): boolean {
    if (!state.plan || state.plan.mode !== 'search') return false;
    return state.plan.steps.some(s => s.status === 'searching');
  }

  private needsScrape(state: AgentStateType): boolean {
    if (!state.plan || state.plan.mode !== 'search') return false;
    return state.plan.steps.some(s => s.status === 'reading');
  }

  getCompiledGraph(config: { apiKey?: string; modelName?: string; baseUrl?: string; serperApiKey?: string; }) {
    this.logger.log(`Creating graph with model: ${config.modelName}, baseUrl: ${config.baseUrl || 'default'}, apiKeyPresent: ${!!config.apiKey}`, 'AgentService');
    
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      this.logger.error(`CRITICAL: No API key provided to getCompiledGraph!`, 'AgentService');
      throw new Error('No API key provided to agent service');
    }

    // Build the multi-node graph matching Python architecture
    const graph = new StateGraph(AgentState)
      // Add all nodes
      .addNode('planner', async (state, cfg) => {
        const result = await plannerNode(state, cfg);
        const { goto, ...updates } = result;
        return updates;
      })
      .addNode('search_collect', async (state, cfg) => {
        const result = await searchCollectNode(state, cfg);
        const { goto, ...updates } = result;
        return updates;
      })
      .addNode('search_pick', async (state, cfg) => {
        const result = await searchPickNode(state, cfg);
        const { goto, ...updates } = result;
        return updates;
      })
      .addNode('scrape', async (state, cfg) => {
        const result = await scrapeNode(state, cfg);
        const { goto, ...updates } = result;
        return updates;
      })
      .addNode('chat_node', async (state, cfg) => {
        const result = await chatNode(state, cfg);
        const { goto, ...updates } = result;
        return updates;
      })
      // Start with planner
      .addEdge(START, 'planner')
      // Planner routes to search_collect or chat_node based on mode
      .addConditionalEdges('planner', (state) => {
        if (state.plan?.mode === 'search') {
          return 'search_collect';
        }
        return 'chat_node';
      })
      // After search_collect, go to search_pick
      .addEdge('search_collect', 'search_pick')
      // After search_pick, go to scrape
      .addEdge('search_pick', 'scrape')
      // After scrape, check if more steps are pending
      .addConditionalEdges('scrape', (state) => {
        if (this.hasPendingSteps(state)) {
          return 'search_collect'; // Loop back for next step
        }
        return 'chat_node'; // All steps done, go to chat
      })
      // Chat node always ends
      .addEdge('chat_node', END);

    return graph.compile({ checkpointer: this.checkpointer });
  }
}

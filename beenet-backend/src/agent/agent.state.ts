import { Annotation, messagesStateReducer } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';

// SearchResult from Serper API matching organic results structure
export interface SearchResult {
  title?: string;
  link: string; // URL from Serper 'link' field
  snippet?: string;
  position?: number; // Search engine position
  favicon?: string; // Generated favicon URL
}

// Optional targeting controls for a search step
export interface PlanControls {
  time_range?: 'any' | 'day' | 'week' | 'month' | 'year'; // Limit results to a recent window
  country?: string; // Two-letter country code (gl)
  autocorrect?: boolean; // Enable query autocorrect
  max_results?: number; // Max results to fetch per query (1-50)
}

// Individual research step
export interface PlanStep {
  id: string;
  title: string;
  queries: string[];
  results: SearchResult[];
  status: 'pending' | 'searching' | 'reading' | 'completed'; // Research execution phase
  controls?: PlanControls; // Optional per-step search controls
  error?: { type: string; message: string }; // Step-level error
}

// Research plan for the current user request
export interface ResearchPlan {
  mode: 'direct' | 'search'; // Whether to answer directly or perform web search first
  steps: PlanStep[]; // Execution steps
  reason?: string; // Short rationale for the chosen mode
  error?: { type: string; message: string }; // Plan-level error
}

// Evidence extracted from sources
export interface Evidence {
  stepId: string;
  url: string;
  markdown: string;
  timestamp: string;
}

// Agent state matching Python implementation
export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  // Current research plan
  plan: Annotation<ResearchPlan | null>({
    reducer: (state, action) => action,
    default: () => null,
  }),
  // Rolling history of prior plans for robustness/analytics
  plans: Annotation<ResearchPlan[]>({
    reducer: (state, action) => {
      // Handle both single plan and array of plans
      if (Array.isArray(action)) {
        return [...state, ...action];
      }
      return [...state, action];
    },
    default: () => [],
  }),
  // Error surface for UI
  error: Annotation<{ type: string; message: string } | null>({
    reducer: (state, action) => action,
    default: () => null,
  }),
  // Ephemeral evidence store: raw textual context extracted for selected sources
  // IMPORTANT: This is for in-memory use by the agent and SHOULD NOT be emitted to the UI or persisted
  evidence: Annotation<Evidence[]>({
    reducer: (state, action) => action,
    default: () => [],
  }),
  // Transient search candidates per step id (NOT part of the plan; never emitted/persisted)
  // Shape: { [stepId]: SearchResult[] }
  search_candidates: Annotation<Record<string, SearchResult[]>>({
    reducer: (state, action) => ({ ...state, ...action }),
    default: () => ({}),
  }),
  // Active step being processed across nodes
  current_step_id: Annotation<string | null>({
    reducer: (state, action) => action,
    default: () => null,
  }),
});

export type AgentStateType = typeof AgentState.State;

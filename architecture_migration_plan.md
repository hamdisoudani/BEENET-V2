# BeeNet Single-Endpoint SSE Architecture Migration Plan

## Goal
Refactor the BeeNet architecture to fix race conditions and prevent token loss during client disconnects/reloads. This involves removing CopilotKit in favor of Vercel AI SDK, migrating the TypeScript LangGraph agent into the NestJS backend, and using PostgreSQL for native checkpointing. We will establish a single-endpoint SSE "Catch-up Handshake" for flawless stream resumption.

## Phase 1: Dependencies & Cleanup
- [x] **Frontend (`beenet-frontend`)**:
  - [x] Uninstall `@copilotkit/*`.
  - [x] Install `ai` (Vercel AI SDK) and `@ai-sdk/react`.
  - [x] Clean up CopilotKit providers in `app/providers.tsx` and `app/c/[id]/layout.tsx`.
- [x] **Backend (`beenet-backend`)**:
  - [x] Uninstall `@copilotkit/runtime`.
  - [x] Install `@langchain/langgraph`, `@langchain/openai`, `langchain`, `@langchain/langgraph-checkpoint-postgres`, `pg`.
  - [x] Add `ai` to securely parse and format the Vercel Data Stream protocol.

## Phase 2: Agent Migration to NestJS & DB Refactor
- [x] **Create Basic TS Agent**: Built a lightweight LangGraph agent directly into an `@Injectable()` service in NestJS.
- [x] **Update State Schema** (`Annotation.Root`):
  - [x] Add `searchSteps`: `Array<{ query: string, status: 'pending'|'executing'|'complete', results?: any[] }>` to track live search execution.
  - [x] Add `draftAnswer`: `string` for partial completions.
- [x] **Mid-Node Checkpointing**: Updated `docker-compose.yml` with PostgreSQL and integrated `PostgresSaver` in `AgentService`.
- [x] **Single Source of Truth**: PostgreSQL is now the sole source of conversational thread state (Checkpointer).

## Phase 3: The `ConversationStreamManager` & Handshake
- [x] **Create RAM Buffer Singleton (`ConversationStreamManager`)**:
  - [x] Implemented a NestJS service holding a `Map<string, Session>` for each `threadId`.
  - [x] Session includes active stream execution and a token buffer for resilient delivery.
- [x] **Create Single SSE Endpoint (`POST /api/chat/:threadId/stream`)**:
  - [x] Handled the "Catch-up Handshake": History recovery from Postgres + Buffer dump of live tokens.
  - [x] Secured via `ClerkAuthGuard` and `SecretsService` (resolving per-user model keys).

## Phase 4: Frontend UI Refactoring
- [x] **Adopt `useChat` (Vercel AI SDK v6)**:
  - [x] Refactored `CustomChat.tsx` to use the **transport-based** architecture in v6.
  - [x] Migrated from `api` option to `transport: new DefaultChatTransport({ api: ... })`.
  - [x] Updated message rendering to use the new `parts` array instead of the legacy `content` field.
  - [x] Refactored `isLoading` and `input` state to align with v6's manual state management.
- [x] **Remove Obsolete Logic**:
  - [x] Cleaned up `app/c/[id]/page.tsx` of all legacy CopilotKit logic.
  - [x] Removed `uuid` and `sentOnceRef` from page level; moved initial message auto-send logic into `CustomChat`.
- [x] **Perplexity-style UI**:
  - [x] Implemented text extraction from `UIMessage.parts` for rendering user and assistant bubbles with markdown support.
- [x] **History Retrieval & Display**:
  - [x] Implemented conversation history loading from PostgreSQL via `/api/chat/:threadId/history` endpoint.
  - [x] Added frontend API route to proxy history requests to backend with Clerk authentication.
  - [x] Integrated history loading in `CustomChat` component with loading states.
  - [x] Restored previous research plans from checkpoint state.
  - [x] Ensured pending messages only send after history is fully loaded.
- [x] **Live Research Plan Display**:
  - [x] Created `PlanDisplay` component to visualize multi-step research workflow.
  - [x] Implemented `StepDisplay` with collapsible sections for each research step.
  - [x] Added real-time status indicators (pending, searching, reading, completed).
  - [x] Displayed search queries, results with favicons, and step controls.
  - [x] Integrated custom SSE data events (`data-plan`) for live plan updates during streaming.

## Final Status: 100% COMPLETE ✅
The BeeNet architectural migration is complete. The system now features:

- **Robust SSE Streaming**: Single-endpoint architecture with catch-up handshake for seamless reconnection
- **Native PostgreSQL Persistence**: LangGraph checkpointing with full conversation state recovery
- **Vercel AI SDK v6**: Modern transport-based streaming with custom data events
- **Live Research Visualization**: Real-time plan display with collapsible steps, search results, and status tracking
- **History Management**: Automatic conversation history loading from checkpoints
- **Secure Authentication**: Clerk-based auth with per-user model credentials
- **Zero Token Loss**: Buffer-based delivery ensures no message loss during disconnects

All features from the migration plan have been successfully implemented and tested.

# Beenet – AI Research Agent

A production-ready AI research chat application with LangGraph TypeScript agent, NestJS proxy, and Next.js frontend.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js UI    │────▶│  NestJS Proxy    │────▶│  LangGraph Dev  │
│  (Port 3000)    │     │   (Port 4000)    │     │  (Port 2024)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │   MongoDB   │
                        │ (metadata)  │
                        └─────────────┘
```

### Key Components

- **`agents/ts-agent`** - TypeScript LangGraph agent
  - Runs with `langgraph dev` (port 2024)
  - Native checkpoint persistence (no manual message storage)
  - Deep research workflow with sub-agents
  - Receives model config via headers from proxy

- **`beenet-backend`** - NestJS proxy server
  - Simple pass-through proxy to LangGraph dev server
  - Injects user model secrets as headers
  - Clerk authentication guard
  - MongoDB for conversation metadata only

- **`beenet-frontend`** - Next.js application
  - CopilotKit v2 for agent integration
  - Thread-based conversations (threadId = conversation ID)
  - Messages persisted via LangGraph checkpoint, not database

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+ (for old py-agent, not needed for ts-agent)
- MongoDB (local or Atlas)
- LangGraph CLI: `npm install -g @langchain/langgraph-cli`

### 1. Start the TypeScript Agent

```bash
cd agents/ts-agent
npm install
langgraph dev
# Server: http://localhost:2024
```

### 2. Start the Backend Proxy

```bash
cd beenet-backend
npm install
npm run start:dev
# Server: http://localhost:4000
```

### 3. Start the Frontend

```bash
cd beenet-frontend
npm install
npm run dev
# App: http://localhost:3000
```

## Environment Configuration

### Frontend (`beenet-frontend/.env`)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL=http://localhost:4000/api/copilotkit
NEXT_PUBLIC_COPILOTKIT_AGENT_NAME=agent
```

### Backend (`beenet-backend/.env`)
```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/beenet
CLERK_SECRET_KEY=sk_...
LANGGRAPH_URL=http://localhost:2024
DATA_KEY=your_base64_encryption_key
```

### TypeScript Agent (`agents/ts-agent/.env`)
```env
LANGSMITH_API_KEY=ls_...  # Optional, for tracing
```

## How It Works

### Thread-based Conversations
1. User creates new chat → generates UUID → navigates to `/c/{threadId}`
2. CopilotKit v2's `CopilotKitProvider` receives the `threadId`
3. LangGraph checkpoint automatically loads/saves messages by threadId
4. No manual message persistence needed!

### Model Configuration Flow
1. User saves model credentials in Settings UI
2. Backend encrypts and stores in MongoDB
3. On each request, proxy injects credentials as headers:
   - `x-openai-api-key`
   - `x-openai-base-url`
   - `x-openai-model`
   - `x-serper-api-key`
4. TypeScript agent reads headers and configures LLM

### Checkpoint Persistence
- LangGraph handles all message storage automatically
- Each thread's state is persisted by the checkpoint saver
- Frontend doesn't need to load messages manually
- Conversation list is the only thing stored in MongoDB

## Migration from Python Agent

The Python agent (`agents/py-agent`) is deprecated in favor of the TypeScript agent:

| Feature | Python Agent | TypeScript Agent |
|---------|--------------|------------------|
| Startup | `python main.py` | `langgraph dev` |
| Port | 8000 | 2024 |
| Persistence | Manual (MongoDB) | Native checkpoint |
| State Streaming | Custom | CopilotKit v2 native |

To switch:
1. Stop Python agent
2. Run `langgraph dev` in `agents/ts-agent`
3. Update `LANGGRAPH_URL` in backend `.env`
4. No frontend changes needed!

## Key Files

### Agent
- `agents/ts-agent/src/agent.ts` - Main agent graph definition
- `agents/ts-agent/langgraph.json` - LangGraph configuration

### Backend
- `beenet-backend/src/proxy/proxy.controller.ts` - Simple proxy with header injection
- `beenet-backend/src/secrets/` - User model management

### Frontend
- `beenet-frontend/app/c/[id]/layout.tsx` - Thread-scoped CopilotKit provider
- `beenet-frontend/components/chat/CustomChat.tsx` - Chat UI with v2 hooks
- `beenet-frontend/app/api/copilotkit/route.ts` - Frontend→Backend proxy

## Development Notes

- The proxy is intentionally simple - just forwards requests and injects auth headers
- LangGraph checkpoint handles ALL message persistence
- Thread ID is the single source of truth for conversation identity
- Model secrets are never exposed to the frontend

## Troubleshooting

- **Agent not found**: Ensure `langgraph dev` is running on port 2024
- **Checkpoint not loading**: Verify threadId is being passed correctly
- **Model errors**: Check proxy logs for header injection
- **Auth failures**: Verify Clerk keys are configured correctly

## License

Provided as-is under the repository's license.

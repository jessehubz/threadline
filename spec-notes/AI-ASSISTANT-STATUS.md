# AI Assistant — Implementation Status

## Decision Made

**Provider:** Llama 3.2 via Ollama (runs locally, no API key needed)  
**Reason:** Free, private (data never leaves the machine), fast enough for a chat assistant, no usage costs. Ollama exposes an OpenAI-compatible API at `localhost:11434/v1` which the Vercel AI SDK connects to seamlessly.

**Data access:** YES — the assistant has full read access to the user's tasks, projects, deadlines, dependencies, and assignees. This context is injected into the system prompt.

**Fallback:** If Ollama is not running or the request fails, the system automatically falls back to the heuristic-based parser (regex intent detection + canned responses).

## Setup

1. Install Ollama: https://ollama.com
2. Pull the model: `ollama pull llama3.2`
3. Start Ollama: `ollama serve` (runs on port 11434)
4. Start the app: `npm run dev`

No API keys needed. The assistant connects to `http://localhost:11434/v1` by default.

Optional `.env.local` overrides:
```
OLLAMA_BASE_URL="http://localhost:11434/v1"
OLLAMA_MODEL="llama3.2"
```

## Architecture

```
User types message
        │
        ▼
AIChatPanel (client component)
  → Builds conversation history (last 20 messages)
        │
        ▼
chatWithAssistant() server action
  → Fetches user context (tasks, projects, reminders)
  → Builds system prompt with Loom persona + workspace data
  → Calls Llama 3.2 via Ollama's OpenAI-compatible API
  → Falls back to heuristic if Ollama unavailable
        │
        ▼
Response displayed in chat popup (bottom-right corner)
```

## What the assistant can do

- ✅ Hold multi-turn conversations (20-message context window)
- ✅ Answer "what's your name?" → introduces itself as Loom
- ✅ Answer questions about the user's tasks, projects, deadlines
- ✅ Prioritize tasks based on due dates, dependencies, urgency
- ✅ Suggest work schedules and task ordering
- ✅ General productivity advice
- ✅ Graceful fallback to heuristic if Ollama is down

## Files Modified

- `src/actions/ai-assistant-actions.ts` — `chatWithAssistant()` uses Ollama/Llama
- `src/components/ai-chat-panel.tsx` — Calls `chatWithAssistant()`, positioned bottom-right
- `package.json` — Added `ai` and `@ai-sdk/openai` (for OpenAI-compatible client)
- `.env.example` — Ollama configuration

# Architecture

**Last updated:** 2026-04-29

## Architectural Pattern

Next.js 16 App Router with SSR-first architecture, augmented by client components for interactive features.

**Layer structure:**
- **Route layer** — `src/app/` — Next.js file-based routing with Server Components by default
- **Component layer** — `src/components/` — React components (server + client)
- **Library layer** — `src/lib/` — Business logic, state management, external integrations
- **Type layer** — `src/types/` — Shared TypeScript type definitions

## Entry Points

| Path | Type | Purpose |
|------|------|---------|
| `/` | Server Component | Auth-based redirect — authenticated → `/dashboard`, unauthenticated → `/login` |
| `/login` | Route Group (auth) | Auth forms with tab switching (login / register) |
| `/dashboard` | Protected page | Post-login landing page, entry to assessment chat |
| `/assessment` | Route Group (chat) | AI 创业体检 chat interface |
| `/result` | Route Group (chat) | Assessment completion placeholder (Phase 2) |
| `/api/chat` | Route Handler | AI streaming endpoint (mock responses, Phase 2) |

## Data Flow

```
User → Browser (client component)
  │
  ├── Auth: Server Actions (login/register/logout)
  │     └── Supabase Auth (SSR session via cookies)
  │
  ├── Chat: useChat hook (@ai-sdk/react)
  │     └── POST /api/chat → streamText() → SSE streaming response
  │
  ├── Parameters: Browser Supabase client (real-time save)
  │     └── assessments.update({ annual_capital, weekly_time, ... })
  │
  └── Completion: Server Actions
        ├── completeAssessment(assessmentId)
        └── saveChatMessages(assessmentId, messages[])
```

## Key Architecture Decisions

### Auth: Supabase SSR Three-File Pattern
- `client.ts` — `createBrowserClient()` for browser-side DB reads/writes
- `server.ts` — `createServerClient()` with `cookies()` for Server Actions, RSC
- `middleware.ts` — `updateSession()` for JWT refresh on every request
- Middleware protects `/dashboard*` routes, redirects authenticated away from `/login`

### Chat Streaming: AI SDK useChat
- Client component uses `useChat` with custom `DefaultChatTransport` for streaming
- Transport sends `followUpRounds` + `currentParameter` alongside messages
- Route handler (`/api/chat`) uses Node.js runtime (not Edge — Supabase server client needs `next/headers`)
- Mock AI via `MockLanguageModelV3` with character-by-character streaming

### State Machine: useReducer
- `ConversationState` tracks: collected params, current parameter, follow-up rounds, assessment ID, completion
- Flexible order: PARAMETER_ORDER defines sequence, transitions after each parameter
- Follow-up guard: max 1 follow-up per parameter (`FOLLOW_UP_USED` action rejects beyond limit)
- Startup: checks for in-progress assessment → resume prompt or new assessment

### Data Persistence
- Assessment created on page load (Server Action) — ID available immediately
- Parameters saved in real-time via `supabase.from('assessments').update()` on submit
- Chat messages batch-saved on completion via Server Action (ownership verified)
- Session resume: detect in-progress assessment, restore collected values, skip to next parameter

## Middleware

File: `src/middleware.ts`

- Routes protected: `/dashboard*` (unauthenticated → `/login`)
- Auth pages redirected for authenticated users: `/login`, `/reset-password`
- Matcher excludes static assets (`_next/static`, `_next/image`, favicon, images)
- Uses `updateSession()` middleware helper which calls `getUser()` for JWT refresh

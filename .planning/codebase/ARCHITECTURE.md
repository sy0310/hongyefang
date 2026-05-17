<!-- refreshed: 2026-05-17 -->
# Architecture

**Analysis Date:** 2026-05-17

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router (SSR)                  │
│           Mobile-first shell max-w-[430px]                  │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Auth pages  │  Dashboard   │  Chat/Funnel │  Profile       │
│ `(auth)/`    │ `dashboard/` │ `(chat)/`    │ `profile/`     │
└──────┬───────┴──────┬───────┴──────┬───────┴────────────────┘
       │              │              │
       ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│              Server Actions / API Routes                     │
│  `(auth)/login/actions.ts`      `api/chat/route.ts`         │
│  `(chat)/assessment/actions.ts` `lib/orders/actions.ts`     │
│  `(chat)/match/actions.ts`                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────┐   ┌─────────────────────────────────┐
│  Supabase (Postgres) │   │  External AI APIs               │
│  Auth, assessments,  │   │  Gemini 2.5 Flash (chat)        │
│  chat_messages,      │   │  DeepSeek V4 Flash (narrative)  │
│  orders, partner_*   │   │                                 │
└─────────────────────┘   └─────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root Layout | Font loading, mobile shell (max-w-430px) | `src/app/layout.tsx` |
| Middleware | Session refresh, route protection, auth redirect | `src/middleware.ts` |
| AssessmentChat | Client-side AI chat orchestration, parameter collection | `src/components/chat/AssessmentChat.tsx` |
| `/api/chat` route | Gemini streaming endpoint, `collectParameter` tool definition | `src/app/api/chat/route.ts` |
| `completeAssessment` action | Scoring engine + DeepSeek narrative + Supabase write | `src/app/(chat)/assessment/actions.ts` |
| Scoring Engine | Piecewise linear scoring across 8 dimensions, 1000-point scale | `src/lib/scoring/engine.ts` |
| State Machine | Immutable reducer for parameter collection progress (partially used) | `src/lib/chat/state-machine.ts` |
| Match Algorithm | Complementarity scoring between partner sub-scores | `src/lib/match/algorithm.ts` |
| Supabase server client | SSR cookie-based Supabase client for Server Components and Actions | `src/lib/supabase/server.ts` |
| Supabase browser client | CSR Supabase client for real-time DB writes in AssessmentChat | `src/lib/supabase/client.ts` |

## Pattern Overview

**Overall:** Next.js App Router monolith with an AI-driven assessment funnel.

**Key Characteristics:**
- Pages are async Server Components that fetch data from Supabase directly before rendering
- Mutations go through Next.js Server Actions (`'use server'`) or the `/api/chat` streaming route
- The one Client Component with significant state is `AssessmentChat`, which manages the entire AI conversation loop via refs and `useState`
- Mobile-first: all pages constrained to `max-w-[430px]` — designed as a mobile web app, not a desktop app
- No global state library; no context providers; state is either server-fetched or local to `AssessmentChat`

## Layers

**Page Layer (App Router):**
- Purpose: Route entry points; authentication gate; data fetching for initial render
- Location: `src/app/`
- Contains: Async Server Components, route groups `(auth)` and `(chat)`, `page.tsx` files
- Depends on: Supabase server client, Server Actions, UI components
- Used by: Browser navigation

**Server Actions Layer:**
- Purpose: Mutations and complex server-side operations invoked from client or server
- Location: `src/app/(auth)/login/actions.ts`, `src/app/(chat)/assessment/actions.ts`, `src/app/(chat)/match/actions.ts`, `src/lib/orders/actions.ts`
- Contains: `'use server'` functions — auth, create/complete assessments, partner pool, order creation
- Depends on: Supabase server client, scoring engine, DeepSeek AI SDK (dynamic import)
- Used by: Client Components and Server Components via direct import

**API Routes Layer:**
- Purpose: Streaming AI response — cannot be a Server Action because it returns a streaming body
- Location: `src/app/api/chat/route.ts`
- Contains: Gemini streaming chat with `collectParameter` tool, dynamic system prompt builder
- Depends on: `@ai-sdk/google`, `ai`, state-machine types
- Used by: `AssessmentChat` via `DefaultChatTransport`

**Business Logic Layer:**
- Purpose: Pure computation — scoring, matching, prompt construction
- Location: `src/lib/`
- Contains: `scoring/engine.ts`, `scoring/deepseek-prompt.ts`, `match/algorithm.ts`, `chat/state-machine.ts`, `chat/validation.ts`, `chat/mock-responses.ts`
- Depends on: Types only (`src/types/assessment.ts`)
- Used by: Server Actions, API routes, pages

**Component Layer:**
- Purpose: UI rendering; feature-grouped sub-directories mirror the page structure
- Location: `src/components/`
- Contains: Feature components (`chat/`, `result/`, `consult/`, `match/`, `auth/`, `dashboard/`, `profile/`) and shared primitives (`ui/`)
- Depends on: UI primitives, lucide-react, Server Actions (via import in Client Components)
- Used by: Pages

**Data Layer:**
- Purpose: Supabase access — two clients for server vs. browser contexts
- Location: `src/lib/supabase/`
- Contains: `server.ts` (SSR cookie client), `client.ts` (browser client), `middleware.ts` (session refresher)
- Used by: All layers that touch the database

## Data Flow

### AI Chat Assessment Flow

1. User loads `/assessment` — Server Component (`src/app/(chat)/assessment/page.tsx`) authenticates via `createClient()` and checks for an existing completed assessment
2. `AssessmentChat` mounts (`src/components/chat/AssessmentChat.tsx`), calls `getInProgressAssessment()` Server Action; creates a new `in_progress` assessment row if none found
3. `useChat` from `@ai-sdk/react` sends messages to `/api/chat` via `DefaultChatTransport`, including the `collected` parameter map in every request body
4. Gemini (`gemini-2.5-flash`) calls the `collectParameter` tool when a parameter value is confirmed; `onToolCall` in `AssessmentChat`:
   - Writes the value to Supabase via the **browser client** directly
   - Updates `collected` state and `collectedRef`
5. When all 9 parameters are collected (`isComplete = true`), after streaming finishes, `completeAssessment()` Server Action runs:
   - Fetches assessment row from Supabase
   - Calls `calculateScore()` (`src/lib/scoring/engine.ts`) — pure piecewise linear math, 1000-point scale
   - Calls DeepSeek V4 Flash via `@ai-sdk/deepseek` (dynamically imported) with prompt from `buildDeepSeekPrompt()`
   - Writes `score`, `tier`, `is_wishing_type`, `ai_narrative`, `status: 'completed'` back to Supabase
6. Browser redirects to `/result`

### Result Page Flow

1. `/result` page (`src/app/(chat)/result/page.tsx`) fetches latest completed assessment from Supabase (Server Component)
2. Calls `computeSubScores()` server-side for dimension breakdown
3. Renders `ScoreBanner`, `DimensionCard` array, AI narrative, `ResultCTA`, and `JoinPoolCTA`

### Partner Matching Flow

1. `/match` page (`src/app/(chat)/match/page.tsx`) fetches current user's assessment + all active `partner_profiles` with their linked assessments
2. Calls `complementarityScore()` for each candidate (`src/lib/match/algorithm.ts`) — weighted diff on capital, time, experience sub-scores
3. Sorts by score descending, renders top 10 `PartnerCard` components

### Auth Flow

1. Email/password via `login()`/`register()` Server Actions → Supabase Auth → `redirect('/dashboard')`
2. Email link (password reset, email confirm) → `/auth/callback` route exchanges PKCE code for session → `redirect('/dashboard')`
3. Middleware (`src/middleware.ts`) refreshes sessions on every request and enforces `/dashboard*` protection

## Key Design Decisions

**Two Supabase clients, strict context separation:**
`server.ts` uses `next/headers` cookies API and must only be used in Server Components, Server Actions, and Route Handlers. `client.ts` uses `createBrowserClient` and must only be used in Client Components. Mixing them causes auth failures.

**DeepSeek dynamic import:**
`@ai-sdk/deepseek` is dynamically imported inside `completeAssessment()` to isolate it from edge runtime. The action runs in Node.js only.

**Streaming requires an API route:**
`/api/chat` is a Route Handler (not a Server Action) because `streamText(...).toUIMessageStreamResponse()` returns a streaming HTTP response body — incompatible with Server Action semantics.

**Session resume:**
On `AssessmentChat` mount, `getInProgressAssessment()` checks for an existing `in_progress` row and prompts the user to resume, restoring the `collected` map from DB column values.

**Optimistic chat input:**
`ChatInput` uses controlled local state for the input field with `setInput('')` before `sendMessage()` to eliminate perceived lag.

## Component Hierarchy

```
layout.tsx (root shell, fonts)
├── page.tsx (auth redirect)
├── (auth)/login/page.tsx
│   └── components/auth/AuthTabs.tsx
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
├── dashboard/page.tsx
│   ├── components/ui/NavHeader.tsx
│   ├── components/ui/BottomNav.tsx
│   └── components/dashboard/AssessmentEntryButton.tsx
├── (chat)/assessment/page.tsx
│   ├── components/ui/NavHeader.tsx
│   ├── components/ui/FunnelProgressBar.tsx
│   ├── components/chat/AssessmentChat.tsx   ← 'use client', owns all chat state
│   │   ├── components/chat/MessageBubble.tsx
│   │   └── components/chat/ChatInput.tsx
│   └── components/ui/BottomNav.tsx
├── (chat)/result/page.tsx
│   ├── components/result/ScoreBanner.tsx
│   ├── components/result/DimensionCard.tsx
│   ├── components/result/ResultCTA.tsx
│   └── components/result/JoinPoolCTA.tsx
├── (chat)/match/page.tsx
│   └── components/match/PartnerCard.tsx
└── (chat)/consult/page.tsx
    ├── components/consult/ConsultClient.tsx  ← 'use client'
    │   ├── components/consult/PricingCard.tsx
    │   └── components/consult/PaymentModal.tsx
    └── [ConsultClient wraps server-fetched PLANS data]
```

## Error Handling

**Strategy:** Fail-fast with typed discriminated-union returns; fallbacks at AI boundaries.

**Patterns:**
- Server Actions return `{ error: string } | { success/data }` — callers check for `'error' in result`
- `completeAssessment()` wraps DeepSeek call in try/catch; falls back to `getFallbackNarrative()` so assessment completion never blocks on AI failure (`src/lib/scoring/deepseek-prompt.ts`)
- `AssessmentChat` catches `sendMessage()` errors and restores the input field value
- Auth failures in Server Actions call `redirect('/login')`
- Missing assessment data in result/match pages calls `redirect()` to earlier funnel steps

## Cross-Cutting Concerns

**Logging:** `console.error` only — no structured logging or error tracking service.
**Validation:** Zod schema on the `collectParameter` tool input in `src/app/api/chat/route.ts`; manual runtime checks in Server Actions.
**Authentication:** Every protected page and action independently calls `supabase.auth.getUser()`. Middleware handles session refresh; RLS policies handle DB-level authorization.
**Styling:** Tailwind v4 with `@theme inline` token bridge. Design tokens defined as CSS custom properties in `src/app/globals.css`; referenced in Tailwind utilities via `var(--token)` patterns.

---

*Architecture analysis: 2026-05-17*

# External Integrations

**Last updated:** 2026-04-29

## Supabase (Backend-as-a-Service)

**Status:** Active — fully configured

**Role:** Auth provider, PostgreSQL database, RLS enforcement

**Connection:** Two client factories in `src/lib/supabase/`:
- `client.ts` — Browser client via `createBrowserClient()` for client-side reads/writes
- `server.ts` — Server client via `createServerClient()` with `cookies()` from `next/headers` for Server Actions and Route Handlers
- `middleware.ts` — Session refresh helper using `createServerClient()` with cookie `getAll()`/`setAll()`

**Environment variables:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Tables (created via migrations in `supabase/migrations/`):**
- `public.assessments` — Assessment session tracking (user_id, 4 parameter columns, status, timestamps)
- `public.chat_messages` — Chat history per assessment (assessment_id FK, role, content, timestamp)

Both tables have RLS policies scoped to `auth.uid()`.

## Auth Providers

**Active:** Email + password authentication via Supabase Auth (built-in)

**Planned:** Phone + verification code (deferred to later phase)

**Auth flow:**
- Login/Register: Server Actions in `src/app/(auth)/login/actions.ts`
- Session refresh: Middleware via `updateSession()` calling `getUser()`
- Callback: Route handler at `src/app/auth/callback/route.ts` exchanges auth code for session

## AI (Planned — Not Yet Active)

**Current state:** Mock AI responses using AI SDK `MockLanguageModelV4` + `simulateReadableStream`

**API endpoint:** `POST /api/chat` (Route Handler at `src/app/api/chat/route.ts`)

**Mock responses:** Predefined text in `src/lib/chat/mock-responses.ts`

**Future:** Will connect to a real LLM provider (Claude/OpenAI/domestic model) — design accounts for drop-in replacement by changing only the `model` argument in `streamText()`.

## Payment (Planned — Phase 4)

**Future integrations:**
- WeChat Pay
- Alipay

Not yet implemented. Planned for Phase 4.

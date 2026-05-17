# External Integrations

**Analysis Date:** 2026-05-17

## APIs & External Services

**AI / LLM:**
- Google Gemini (`gemini-2.5-flash`) — real-time streaming chat during assessment intake
  - SDK/Client: `@ai-sdk/google` 3.0.67 via Vercel AI SDK (`ai` 6.0.168)
  - Used in: `src/app/api/chat/route.ts` (POST `/api/chat`)
  - Auth: Environment variable `GOOGLE_GENERATIVE_AI_API_KEY` (standard AI SDK convention; not documented in `.env.local.example`)
  - Pattern: `streamText()` with tool calling (`collectParameter` tool); response streamed as `UIMessageStream`

- DeepSeek (`deepseek-v4-flash`) — one-shot narrative text generation at assessment completion
  - SDK/Client: `@ai-sdk/deepseek` 2.0.31, dynamically imported (`await import('@ai-sdk/deepseek')`)
  - Used in: `src/app/(chat)/assessment/actions.ts` (`completeAssessment` Server Action)
  - Auth: `DEEPSEEK_API_KEY` env var (server-side only)
  - Pattern: `generateText()` with system + user messages; fails gracefully to `getFallbackNarrative()` if key absent or call fails

## Data Storage

**Databases:**
- Supabase PostgreSQL — primary data store
  - Hosted project ref: `nwloqvnsudjxbmymqzor` (project name: `hongyefang`)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Client (browser): `src/lib/supabase/client.ts` — `createBrowserClient()` from `@supabase/ssr`
  - Client (server): `src/lib/supabase/server.ts` — `createServerClient()` from `@supabase/ssr` with `next/headers` cookies
  - Client (middleware): `src/lib/supabase/middleware.ts` — `createServerClient()` for session refresh
  - Tables (managed via `supabase/migrations/`):
    - `public.assessments` — assessment sessions; columns: `id`, `user_id`, `target_industry`, `annual_capital`, `weekly_time`, `expected_return`, `investment_amount`, `industry_experience`, `monthly_debt`, `hands_off_preference`, `setup_aversion`, `score`, `tier`, `is_wishing_type`, `ai_narrative`, `status`, timestamps
    - `public.chat_messages` — per-assessment chat history; columns: `assessment_id` (FK), `role`, `content`, timestamp
    - `public.orders` — payment orders; created via `src/lib/orders/actions.ts`
    - `public.profiles` (implied by `src/app/profile/page.tsx` and partner matching)
  - RLS: Enabled on all tables; policies scoped to `auth.uid() = user_id`

**File Storage:**
- Not used; no Supabase Storage or S3/CDN references found

**Caching:**
- None; Next.js default fetch caching only

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in)
  - Method: Email + password (`signInWithPassword`, `signUp`, `signOut`)
  - Session management: Cookie-based via `@supabase/ssr` middleware; session refreshed on every request in `src/middleware.ts`
  - Auth callback: `src/app/auth/callback/route.ts` — exchanges OAuth/email-link code for session; runs on Edge runtime
  - Password reset: `src/app/(auth)/reset-password/` and `src/app/(auth)/update-password/` pages
  - Email confirmation redirect: `${NEXT_PUBLIC_SITE_URL}/auth/callback`
  - Server Actions: `src/app/(auth)/login/actions.ts` (`login`, `register`, `logout`)

## Payments

**Status:** Simulated only — no real payment gateway integrated
- UI in `src/components/consult/PaymentModal.tsx` creates an order record via `src/lib/orders/actions.ts` and redirects to `/payment-success`
- Modal copy explicitly states: "当前为测试环境模拟支付，不会产生实际扣款"
- Planned (not implemented): WeChat Pay and Alipay

## Monitoring & Observability

**Error Tracking:** Not detected
**Logs:** No structured logging library; server-side errors surface via `try/catch` with fallback logic

## CI/CD & Deployment

**Hosting:** Not explicitly configured in codebase; Supabase project is linked (suggesting Vercel or similar is target)
**CI Pipeline:** Not detected (no `.github/workflows/` or equivalent)

## Webhooks & Callbacks

**Incoming:**
- `GET /auth/callback` — Supabase auth code exchange (email confirmation, OAuth, password reset links)

**Outgoing:**
- None detected

## Environment Configuration

**Required env vars:**
```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anon key (public)
DEEPSEEK_API_KEY                  # DeepSeek LLM (server-only; optional, has fallback)
NEXT_PUBLIC_SITE_URL              # Base URL for auth redirects (defaults to http://localhost:3000)
GOOGLE_GENERATIVE_AI_API_KEY      # Google Gemini (server-only; undocumented in .env.local.example but required for chat)
```

**Secrets location:**
- `.env.local` (gitignored); `.env.local.example` is the canonical template (tracked in git)

---

*Integration audit: 2026-05-17*

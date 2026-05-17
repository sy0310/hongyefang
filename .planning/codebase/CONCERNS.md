# Technical Concerns

**Analysis Date:** 2026-05-17

---

## Critical Issues

### Scoring Display Bug: maxScore Mismatch

**What:** `DIMENSION_CONFIG` in `src/app/(chat)/result/page.tsx` (lines 12–19) passes `maxScore` values to `DimensionCard` that do not match actual engine maximums in `src/lib/scoring/engine.ts`.

| Dimension | Engine Max | Display maxScore | Impact |
|-----------|-----------|-----------------|--------|
| `annualCapital` | 200 | 250 | Max score shows as 80%, never 100% |
| `weeklyTime` | 200 | 250 | Max score shows as 80%, never 100% |
| `industryExperience` | 100 | 200 | Max score shows as 50%, reads as "lowTag" |
| `investmentAmount` | 200 | 150 | Can visually exceed 100% (clamped silently) |

**Files:** `src/app/(chat)/result/page.tsx:12–19`, `src/lib/scoring/engine.ts:16–62`, `src/components/result/DimensionCard.tsx:20`

**Impact:** Users with strong profiles see misleadingly low progress bars on result page. A user with max industry experience (100/100 pts) is displayed as 50% and tagged with the "一般" label instead of the "资深" label.

**Fix approach:** Align `maxScore` values in `DIMENSION_CONFIG` to match engine.ts comments: `annualCapital=200`, `weeklyTime=200`, `industryExperience=100`, `investmentAmount=200`.

### CORE_LOGIC.md Formula Is Stale

**What:** `CORE_LOGIC.md` documents a 4-parameter scoring formula (`C×40% + I×30% + T×20% + R×10%`). The live engine in `src/lib/scoring/engine.ts` uses 8 parameters with entirely different weights (each of the original 4 is now 20% or 10%). The tier thresholds and labels in `CORE_LOGIC.md` also differ from the 700/400 boundaries in `engine.ts`.

**Files:** `CORE_LOGIC.md`, `src/lib/scoring/engine.ts`

**Impact:** Documentation-code divergence misleads anyone reading the business spec. Future maintainers risk regressing on undocumented behavior.

**Fix approach:** Rewrite the scoring section of `CORE_LOGIC.md` to reflect the current 8-dimension, 1000-point model.

---

## Security Concerns

### Chat API Route Has No Authentication Check

**What:** `src/app/api/chat/route.ts` is a public POST endpoint with no authentication guard. Any unauthenticated request can invoke the Gemini streaming model at the platform's cost.

**Files:** `src/app/api/chat/route.ts`

**Current mitigation:** None. The middleware in `src/middleware.ts` only protects `/dashboard`. Routes under `/api/*` and `/(chat)/*` are unprotected at the edge.

**Recommendations:** Add a Supabase session check at the top of the POST handler (via `createClient()` and `supabase.auth.getUser()`). Return 401 for unauthenticated calls.

### Missing Rate Limiting on AI Endpoints

**What:** No rate limiting exists anywhere in the codebase. The chat route (`src/app/api/chat/route.ts`) and `completeAssessment` server action (`src/app/(chat)/assessment/actions.ts:70`) invoke LLM APIs with no per-user or per-IP throttle.

**Files:** `src/app/api/chat/route.ts`, `src/app/(chat)/assessment/actions.ts:70–172`

**Risk:** A single authenticated user can trigger unlimited Gemini and DeepSeek calls, creating both cost exposure and potential denial of service for other users.

**Recommendations:** Add rate limiting middleware (e.g., Upstash Redis ratelimit or Vercel's built-in edge rate limiting) on `/api/chat` before production launch.

### Gemini API Key Has No Startup Validation

**What:** `src/app/api/chat/route.ts` imports `google` from `@ai-sdk/google` and calls `google('gemini-2.5-flash')` with no check that `GOOGLE_GENERATIVE_AI_API_KEY` is present. If the key is absent, the error surfaces at runtime during streaming as an unhandled exception.

**Files:** `src/app/api/chat/route.ts:1`, `src/app/api/chat/route.ts:67`

**Contrast:** `src/app/(chat)/assessment/actions.ts:117` correctly validates `DEEPSEEK_API_KEY` before use. The `.env.local.example` does not document the Google key at all.

**Fix approach:** Add a guard at the top of the route: `if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return new Response('AI service not configured', { status: 503 })`. Add `GOOGLE_GENERATIVE_AI_API_KEY=...` to `.env.local.example`.

### Non-Critical Routes Not Protected by Middleware

**What:** `src/middleware.ts` only redirects unauthenticated users from `/dashboard`. Routes `/assessment`, `/result`, `/consult`, `/match`, and `/payment-success` are not covered. Server components and actions on those routes do perform `supabase.auth.getUser()` individually, so data is protected via RLS, but an unauthenticated user reaches the page before being redirected internally.

**Files:** `src/middleware.ts:8–19`

**Risk:** Low for data security (RLS and server-side auth checks exist). Medium for UX — unnecessary DB round-trips and potential brief flash of page content before redirect.

**Fix approach:** Extend the middleware `if` block to include `/(chat)/`, `/result`, `/consult`, `/match`, `/profile`.

### Auth Forms Use `any` for Server Action State

**What:** `src/components/auth/LoginForm.tsx:17` and `src/components/auth/RegisterForm.tsx:18` type their `useActionState` callback parameter as `any`, bypassing TypeScript safety on the return value.

**Files:** `src/components/auth/LoginForm.tsx:17`, `src/components/auth/RegisterForm.tsx:18`

**Fix approach:** Extract a `LoginActionResult` type (e.g., `{ error: string } | { success: boolean } | null`) and use it as the generic parameter to `useActionState`.

---

## Performance Risks

### Match Page Runs Sequential Supabase Queries

**What:** `src/app/(chat)/match/page.tsx` issues three Supabase queries sequentially: user assessment → pool status → candidates + interests. Each `await` blocks the next, adding latency that could be parallelized.

**Files:** `src/app/(chat)/match/page.tsx:48–108`

**Fix approach:** Use `Promise.all()` to run the user's assessment lookup and pool status check in parallel once `user.id` is available.

### Complementarity Algorithm Uses Wrong Normalization Divisors

**What:** `src/lib/match/algorithm.ts:6–7` normalizes sub-scores by dividing by 250 (`a.annualCapital / 250`, `a.weeklyTime / 250`). The engine maximum for both dimensions is 200, not 250. This compresses the complementarity score range — a perfect capital differential would show as `0.8` instead of `1.0`.

**Files:** `src/lib/match/algorithm.ts:6–9`

**Impact:** All complementarity percentages displayed on the match page are systematically lower than intended.

**Fix approach:** Update divisors to `200` to match the actual engine maximums documented in `src/lib/scoring/engine.ts:16–22`.

### AssessmentChat Is a 408-Line Monolith

**What:** `src/components/chat/AssessmentChat.tsx` is 408 lines and handles session creation, session resume, AI streaming orchestration, DB persistence of each parameter, completion detection, and report generation redirect — all in one component with 12+ state variables.

**Files:** `src/components/chat/AssessmentChat.tsx`

**Impact:** Hard to test, reason about, or modify safely. Any regression in one concern requires reading the entire file to diagnose.

**Fix approach:** Extract at minimum: a `useAssessmentSession` hook for DB session lifecycle, and a `useCompletionFlow` hook for the finish effect. This reduces the component to ~200 lines of UI logic.

---

## Technical Debt

### Simulated Payment — No Real Payment Integration

**What:** `src/lib/orders/actions.ts` creates orders with `status: 'completed'` immediately, bypassing any actual payment gateway. `src/components/consult/PaymentModal.tsx:85–89` shows a visible notice that this is test-mode only.

**Files:** `src/lib/orders/actions.ts:30`, `src/components/consult/PaymentModal.tsx:85–89`

**Impact:** PAY-01 and PAY-02 requirements (WeChat Pay, Alipay) are unimplemented. If deployed to production as-is, all orders accumulate fake `completed` records.

**Fix approach:** Integrate a real payment provider (WeChat Pay, Alipay, or Stripe). Gate the order `status` transition on a verified webhook callback, not the client confirm action.

### Validation Schema Is Only Partially Applied

**What:** `src/lib/chat/validation.ts` defines Zod schemas for four parameters but is only consumed by `src/components/chat/ParameterCard.tsx`. `ParameterCard` is not rendered anywhere in the current chat flow — the live chat uses `AssessmentChat.tsx` with the AI SDK directly. Parameter values are written to Supabase from the client `onToolCall` handler without server-side schema validation.

**Files:** `src/lib/chat/validation.ts`, `src/components/chat/ParameterCard.tsx`, `src/components/chat/AssessmentChat.tsx:87–111`

**Impact:** A crafted tool call could write unexpected value types into numeric DB columns. The `completeAssessment` server action scores whatever is in the DB without re-validating.

**Fix approach:** Apply schema validation in `completeAssessment` when reading parameters from the DB before scoring, or validate in `onToolCall` before the Supabase update.

### Mock Response Module Is Dead Code

**What:** `src/lib/chat/mock-responses.ts` exports `getNextMockResponse` and `getCompletionMessage` but is imported by no file in the current codebase. It predates the Gemini SDK integration.

**Files:** `src/lib/chat/mock-responses.ts`

**Fix approach:** Delete the file. If a mock mode is needed for testing, reintroduce it as a Vitest fixture.

### Migration 001 Is Missing

**What:** The migrations directory (`supabase/migrations/`) starts at `002_create_assessments.sql`. Migration 001 is absent, leaving a numbering gap that may confuse the Supabase CLI or future contributors.

**Files:** `supabase/migrations/`

**Fix approach:** Document why 001 is absent (if manually applied or handled by Supabase Auth setup), or create a placeholder migration.

### Typo in Action Type Name

**What:** `src/lib/chat/state-machine.ts:16` defines action type `'SET_ASSESEMENT_ID'` (missing one `S` in `ASSESSMENT`). Both dispatch and reducer match the misspelling so it functions correctly, but the typo will cause confusion if the type is referenced by name.

**Files:** `src/lib/chat/state-machine.ts:16`, `src/lib/chat/state-machine.ts:75`

**Fix approach:** Rename to `'SET_ASSESSMENT_ID'` in both the union type and the switch case.

### `console.error` in Production Client Code

**What:** `src/components/chat/AssessmentChat.tsx:142` and `:232` use `console.error` for error logging without any structured error tracking.

**Files:** `src/components/chat/AssessmentChat.tsx:142`, `src/components/chat/AssessmentChat.tsx:232`

**Fix approach:** Integrate an error tracking service (e.g., Sentry) and replace `console.error` with tracked exceptions.

### `toScoringInput` Silently Drops New Dimensions in Match Page

**What:** `src/app/(chat)/match/page.tsx:30–39` defines `toScoringInput()` which maps `AssessmentRow` to `ScoringInput` but omits `handsOffPreference` and `setupAversion`. The match page's complementarity scoring therefore ignores 15% of the total scoring weight. `ScoringInput` marks these fields as optional so this compiles without error.

**Files:** `src/app/(chat)/match/page.tsx:30–39`, `src/types/assessment.ts:60–69`

**Fix approach:** Pass `handsOffPreference` and `setupAversion` through `toScoringInput()` and include them in the `rawCandidates` select query.

---

## Dependency Risks

### Cutting-Edge SDK Versions with `^` Range

**What:** The project uses very recent major versions of the Vercel AI SDK family:
- `ai: ^6.0.168` — v6 is a recent major version with significant breaking changes from v4/v5
- `@ai-sdk/react: ^3.0.170`, `@ai-sdk/google: ^3.0.67`, `@ai-sdk/deepseek: ^2.0.31` — all recent majors
- `react: 19.2.4` — React 19 (stable, but ecosystem lag for third-party libraries)
- `next: 16.2.4` — pinned exactly (good), but AGENTS.md warns of breaking changes from prior Next.js versions

The `^` range on AI SDK packages means a future `npm install` (e.g., in a new deployment environment) could pull in breaking patch changes.

**Files:** `package.json:12–23`

**Recommendations:** Pin AI SDK versions exactly or use `~` for patch-only updates. Verify `package-lock.json` is committed and used in CI.

---

## Missing Infrastructure

### No Error Tracking

**What:** No error tracking service (Sentry, Datadog, etc.) is integrated. Production failures in client components are caught with `try/catch` and logged to `console.error` only. Server action errors return `{ error: string }` strings but are never aggregated.

**Impact:** Production failures are invisible until a user reports them.

**Recommendations:** Add Sentry or equivalent before go-live. Add a Next.js error boundary at the root layout.

### No Monitoring or Health Check Endpoint

**What:** No `/api/health` route, no uptime monitoring, no alerting is configured.

**Impact:** LLM provider or Supabase downtime will be noticed by users before operators.

**Recommendations:** Add a `GET /api/health` route that pings Supabase and returns 200/503.

### No `test` Script in package.json, No CI

**What:** `package.json` has no `"test"` script — `npm test` fails. There is no `.github/workflows/` or equivalent CI configuration. The one existing test file (`src/lib/scoring/engine.test.ts`) is only run manually via `npx vitest`.

**Files:** `package.json:5–10`

**Impact:** Regressions in the scoring engine are caught only if a developer manually runs tests.

**Recommendations:** Add `"test": "vitest run"` to `package.json` scripts. Set up GitHub Actions to run tests on every push to `main`.

### No Security Headers

**What:** `next.config.ts` is empty. No Content-Security-Policy, `X-Frame-Options`, `Strict-Transport-Security`, or other hardening headers are configured.

**Files:** `next.config.ts`

**Recommendations:** Add a `headers()` export with at minimum: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

---

## Test Coverage Gaps

### Only the Scoring Engine Is Tested

**What:** The only test file is `src/lib/scoring/engine.test.ts` (13 tests). The following have zero test coverage:
- `src/lib/chat/state-machine.ts` — conversation reducer logic
- `src/lib/match/algorithm.ts` — complementarity scoring
- `src/lib/chat/validation.ts` — parameter schemas
- All server actions in `src/app/(chat)/assessment/actions.ts`, `src/app/(chat)/match/actions.ts`, `src/lib/orders/actions.ts`
- All UI components

**Risk:** High. A regression in `conversationReducer` or `complementarityScore` would not be caught before deployment.

**Priority:** High

**Recommendations:** Add unit tests for `src/lib/chat/state-machine.ts` and `src/lib/match/algorithm.ts` as the next testing priority. Add integration tests for critical server actions using Vitest with a mocked Supabase client.

---

## Security Audit Summary

| Check | Status | Notes |
|-------|--------|-------|
| Hardcoded secrets | Pass | All secrets via environment variables |
| XSS vectors | Pass | React auto-escapes; no `dangerouslySetInnerHTML` |
| SQL injection | Pass | Supabase parameterized queries throughout |
| RLS policies | Pass | All tables have RLS scoped to `auth.uid()` |
| CSRF | Pass | Bearer token auth via Supabase cookies |
| API authentication | Fail | `/api/chat` route is publicly accessible |
| Rate limiting | Fail | No rate limiting on any AI endpoint |
| Input validation | Partial | Zod present but not applied server-side on tool call values |
| Security headers | Fail | No headers configured in `next.config.ts` |

---

## Recommendations (Prioritized)

1. **[Critical]** Fix scoring display `maxScore` mismatch in `src/app/(chat)/result/page.tsx` — users see misleading progress bars and wrong tier labels.
2. **[Critical]** Add authentication guard to `src/app/api/chat/route.ts` — unauthenticated calls incur LLM costs with no protection.
3. **[Critical]** Add rate limiting to `/api/chat` and `completeAssessment` before production launch.
4. **[High]** Fix complementarity algorithm divisors in `src/lib/match/algorithm.ts` (200 not 250 for capital and time normalization).
5. **[High]** Fix `toScoringInput` in `src/app/(chat)/match/page.tsx` to include `handsOffPreference` and `setupAversion`.
6. **[High]** Add Google Gemini API key validation in `src/app/api/chat/route.ts` and document it in `.env.local.example`.
7. **[High]** Integrate error tracking (Sentry) and add a `/api/health` endpoint.
8. **[Medium]** Add `"test": "vitest run"` to `package.json` and set up CI to run tests on every push.
9. **[Medium]** Apply server-side Zod validation to parameter values in `completeAssessment` before scoring.
10. **[Medium]** Delete dead code: `src/lib/chat/mock-responses.ts`.
11. **[Medium]** Add security headers to `next.config.ts`.
12. **[Medium]** Extend middleware protection to cover `/(chat)/`, `/result`, `/consult`, `/match`, `/profile`.
13. **[Medium]** Update `CORE_LOGIC.md` to reflect the current 8-dimension, 1000-point scoring model.
14. **[Low]** Fix typo `SET_ASSESEMENT_ID` → `SET_ASSESSMENT_ID` in `src/lib/chat/state-machine.ts`.
15. **[Low]** Refactor `src/components/chat/AssessmentChat.tsx` (408 lines) into focused hooks.

---

*Concerns audit: 2026-05-17*

# File Structure

**Analysis Date:** 2026-05-17

## Root

```
hongyefang-mvp/
├── src/                          # All application source code
├── supabase/                     # Supabase CLI project: migrations
├── public/                       # Static assets (favicon, images)
├── .planning/                    # GSD planning artifacts (non-shipping)
├── .env.local                    # Environment secrets (gitignored)
├── .env.local.example            # Template for required env vars
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript config with `@/` path alias
├── postcss.config.mjs            # PostCSS for Tailwind v4
├── eslint.config.mjs             # ESLint flat config
├── vitest.config.ts              # Vitest test runner config
├── package.json                  # npm dependencies
├── CLAUDE.md                     # Claude Code project instructions (@AGENTS.md)
├── AGENTS.md                     # AI agent instructions (Next.js 16 warning)
├── CORE_LOGIC.md                 # Business logic documentation
└── README.md                     # Project overview
```

## src/

```
src/
├── app/                              # Next.js App Router — all routes
│   ├── (auth)/                       # Route group: auth pages (URL-transparent)
│   │   ├── login/
│   │   │   ├── page.tsx              # Login page (renders AuthTabs)
│   │   │   └── actions.ts            # Server Actions: login, register, logout
│   │   ├── reset-password/
│   │   │   └── page.tsx              # Reset password form page
│   │   └── update-password/
│   │       └── page.tsx              # Update password form page
│   ├── (chat)/                       # Route group: core funnel pages
│   │   ├── assessment/
│   │   │   ├── page.tsx              # SSR auth gate + renders AssessmentChat
│   │   │   └── actions.ts            # Server Actions: create/get/complete assessment, saveChatMessages
│   │   ├── consult/
│   │   │   ├── page.tsx              # SSR: passes PLANS data to ConsultClient
│   │   │   └── ConsultClient.tsx     # Client Component: pricing + payment modal
│   │   ├── match/
│   │   │   ├── page.tsx              # SSR: partner matching with complementarity sort
│   │   │   └── actions.ts            # Server Actions: joinMatchPool, leaveMatchPool, expressInterest
│   │   ├── payment-success/
│   │   │   └── page.tsx              # Order confirmation page
│   │   └── result/
│   │       ├── page.tsx              # SSR: scoring + AI narrative display
│   │       └── loading.tsx           # Streaming loading UI for result
│   ├── api/
│   │   └── chat/
│   │       └── route.ts              # POST /api/chat — Gemini streaming with collectParameter tool
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts              # GET /auth/callback — PKCE code exchange, edge runtime
│   ├── dashboard/
│   │   └── page.tsx                  # Home: stats, funnel progress, assessment CTA
│   ├── profile/
│   │   └── page.tsx                  # User profile page
│   ├── globals.css                   # Tailwind v4 + CSS custom property design tokens
│   ├── layout.tsx                    # Root layout: DM Sans + Noto Sans SC, mobile shell
│   └── page.tsx                      # / — auth-based redirect; edge runtime
├── components/                       # React components grouped by feature
│   ├── auth/
│   │   ├── AuthTabs.tsx              # Login/Register tab switcher (client)
│   │   ├── LoginForm.tsx             # Login form with useActionState
│   │   ├── RegisterForm.tsx          # Register form with useActionState
│   │   ├── ResetPasswordForm.tsx     # Reset password form
│   │   └── UpdatePasswordForm.tsx    # Update password form
│   ├── chat/
│   │   ├── AssessmentChat.tsx        # Main chat client (useChat, parameter state, completion)
│   │   ├── ChatInput.tsx             # Controlled textarea + send button
│   │   ├── MessageBubble.tsx         # User/assistant message bubble with streaming cursor
│   │   └── ParameterCard.tsx         # Inline parameter display card
│   ├── consult/
│   │   ├── PaymentModal.tsx          # Payment confirmation modal (client)
│   │   └── PricingCard.tsx           # Pricing tier card
│   ├── dashboard/
│   │   └── AssessmentEntryButton.tsx # CTA button for starting/viewing assessment
│   ├── match/
│   │   └── PartnerCard.tsx           # Partner candidate display card
│   ├── profile/
│   │   └── ProfileClient.tsx         # Profile client component
│   ├── result/
│   │   ├── DimensionCard.tsx         # Single scoring dimension bar + label
│   │   ├── JoinPoolCTA.tsx           # Join/leave partner matching pool CTA
│   │   ├── ResultCTA.tsx             # Post-result action buttons (consult / retry)
│   │   └── ScoreBanner.tsx           # Total score + tier banner
│   └── ui/                           # Shared primitive components
│       ├── BackButton.tsx            # Navigation back button
│       ├── BottomNav.tsx             # Fixed bottom navigation (client, usePathname)
│       ├── Button.tsx                # Reusable button (variants)
│       ├── Card.tsx                  # Surface card wrapper
│       ├── FunnelProgressBar.tsx     # Step 1/2/3 progress indicator
│       ├── Input.tsx                 # Labeled input with error state
│       ├── LeafIcon.tsx              # Brand icon component
│       ├── Modal.tsx                 # Modal overlay primitive
│       ├── NavHeader.tsx             # Top navigation header
│       └── Tabs.tsx                  # Tab navigation component
├── lib/                              # Business logic, pure functions, integrations
│   ├── chat/
│   │   ├── mock-responses.ts         # Predefined mock AI responses (dev/testing)
│   │   ├── state-machine.ts          # ConversationState reducer + PARAMETER_ORDER + types
│   │   └── validation.ts             # Zod schemas for chat parameter validation
│   ├── match/
│   │   └── algorithm.ts              # complementarityScore() + label helpers
│   ├── orders/
│   │   └── actions.ts                # Server Actions: createOrder, getOrder
│   ├── scoring/
│   │   ├── deepseek-prompt.ts        # buildDeepSeekPrompt() + getFallbackNarrative()
│   │   ├── engine.ts                 # calculateScore(), computeSubScores() — pure math
│   │   └── engine.test.ts            # Vitest unit tests for scoring engine
│   └── supabase/
│       ├── client.ts                 # createBrowserClient() factory (CSR only)
│       ├── middleware.ts             # updateSession() for Next.js middleware
│       └── server.ts                 # createServerClient() factory (SSR/Server Actions)
├── middleware.ts                      # Next.js middleware: session refresh + route guards
└── types/
    ├── assessment.ts                  # ParameterKey, Assessment, ScoringInput/Result, Tier
    └── orders.ts                      # Order types
```

## supabase/

```
supabase/
└── migrations/
    ├── 002_create_assessments.sql          # assessments table + RLS policies
    ├── 003_create_chat_messages.sql        # chat_messages table + RLS
    ├── 004_assessment_scoring_fields.sql   # score, tier, is_wishing_type, ai_narrative columns
    ├── 005_create_orders.sql               # orders table
    ├── 006_add_experience_debt.sql         # industry_experience, monthly_debt columns
    ├── 007_partner_matching.sql            # partner_profiles, partner_interests tables
    └── 20260509232632_add_side_hustle_dimensions.sql  # hands_off_preference, setup_aversion columns
```

## Key Files

**Entry Points:**
- `src/app/page.tsx` — Root redirect based on auth state
- `src/app/layout.tsx` — Root layout: fonts (DM Sans, Noto Sans SC), mobile shell constraint
- `src/middleware.ts` — Session refresh + `/dashboard*` route protection

**Core AI Logic:**
- `src/app/api/chat/route.ts` — Gemini streaming endpoint; builds system prompt from `collected` state
- `src/app/(chat)/assessment/actions.ts` — `completeAssessment()`: scoring + DeepSeek narrative + DB write
- `src/components/chat/AssessmentChat.tsx` — Client-side chat orchestration; the most complex file (~400 lines)

**Scoring Engine:**
- `src/lib/scoring/engine.ts` — `calculateScore()` and `computeSubScores()`: piecewise linear math, no dependencies
- `src/lib/scoring/deepseek-prompt.ts` — Prompt templates and fallback narrative strings
- `src/types/assessment.ts` — Central type definitions: `ParameterKey`, `ScoringInput`, `ScoringResult`, `Tier`

**Data Access:**
- `src/lib/supabase/server.ts` — Server-side Supabase client (use in Server Components, Actions, Route Handlers)
- `src/lib/supabase/client.ts` — Browser-side Supabase client (use in Client Components only)

**Shared UI:**
- `src/app/globals.css` — All CSS custom property design tokens (`--accent`, `--bg`, `--text`, radii, shadows)
- `src/components/ui/BottomNav.tsx` — Fixed bottom nav (client component, 4 destinations)
- `src/components/ui/FunnelProgressBar.tsx` — Step 1/2/3 funnel progress indicator

## Naming Conventions

**Files:**
- Pages: `page.tsx` (App Router convention)
- Server Actions collocated with routes: `actions.ts`
- Route Handlers: `route.ts`
- Client Components that are entry points for a page: `[Feature]Client.tsx` (e.g., `ConsultClient.tsx`)
- Shared UI primitives: PascalCase matching the component name (`Button.tsx`, `Modal.tsx`)
- Feature components: PascalCase describing function (`AssessmentChat.tsx`, `ScoreBanner.tsx`)
- Types: lowercase with descriptive domain name (`assessment.ts`, `orders.ts`)

**Components:**
- PascalCase for all React components
- `'use client'` directive at top of file when client-side hooks/events are needed
- No `'use client'` directive = Server Component (default)

**Server Actions:**
- `'use server'` at top of `actions.ts` files
- Return discriminated unions: `{ id/success/data } | { error: string }`
- Never throw — return error objects for caller handling

**Library functions:**
- camelCase for functions (`calculateScore`, `complementarityScore`, `buildDeepSeekPrompt`)
- Pure functions in `src/lib/` — no side effects, no DB access
- DB access only in Server Actions or pages

## Where to Add New Code

**New funnel page:**
- Route: `src/app/(chat)/[page-name]/page.tsx`
- Server Actions (if needed): `src/app/(chat)/[page-name]/actions.ts`
- Feature components: `src/components/[page-name]/`

**New auth page:**
- Route: `src/app/(auth)/[page-name]/page.tsx`
- Server Actions: `src/app/(auth)/[page-name]/actions.ts`
- Component: `src/components/auth/[ComponentName].tsx`

**New shared UI primitive:**
- Component: `src/components/ui/[ComponentName].tsx`
- No `'use client'` unless it requires browser hooks

**New scoring dimension:**
- Add `ParameterKey` union in `src/types/assessment.ts`
- Add scoring function in `src/lib/scoring/engine.ts`
- Add to `PARAMETER_ORDER` in `src/lib/chat/state-machine.ts`
- Add to `PARAM_LABELS` in `src/app/api/chat/route.ts`
- Add Supabase migration in `supabase/migrations/`

**New database table:**
- Migration: `supabase/migrations/[NNN]_[description].sql`
- Types: `src/types/[domain].ts`
- Server Actions: `src/lib/[domain]/actions.ts` or collocated with the route

**Tests:**
- Unit tests: co-located with the file being tested (e.g., `engine.test.ts` next to `engine.ts`)
- Test runner: Vitest (`vitest.config.ts`)

## Special Directories

**`.planning/`:**
- Purpose: GSD planning artifacts — phases, codebase maps, research
- Generated: No (hand-authored + agent-written)
- Committed: Yes

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No

**`supabase/.temp/`:**
- Purpose: Supabase CLI linked project metadata
- Generated: Yes (Supabase CLI)
- Committed: No (typically gitignored, but present here)

---

*Structure analysis: 2026-05-17*

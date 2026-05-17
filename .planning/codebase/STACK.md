# Technology Stack

**Analysis Date:** 2026-05-17

## Languages

**Primary:**
- TypeScript 5.x — all application code (`src/**/*.ts`, `src/**/*.tsx`)

**Secondary:**
- SQL — database schema and migrations (`supabase/migrations/`)

## Runtime

**Environment:**
- Node.js >=18 (runtime constraint from dependencies; local dev runs v25.8.2)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.2.4 — full-stack React framework (App Router, Server Actions, Route Handlers, Middleware)
- React 19.2.4 — UI rendering

**Testing:**
- Vitest 4.1.5 — unit test runner; config at `vitest.config.ts`; runs files matching `src/**/*.test.ts`

**Build/Dev:**
- Tailwind CSS 4.x — utility-first styling (v4 CSS-first API via `@import "tailwindcss"` in `src/app/globals.css`)
- PostCSS — via `@tailwindcss/postcss` (`postcss.config.mjs`)
- ESLint 9 — linting via `eslint-config-next` (core-web-vitals + typescript presets); config at `eslint.config.mjs`

## Key Dependencies

**Critical:**
- `ai` 6.0.168 — Vercel AI SDK core (`streamText`, `generateText`, `tool`, `zodSchema`, `UIMessage`, `convertToModelMessages`, `toUIMessageStreamResponse`)
- `@ai-sdk/react` 3.0.170 — React bindings for streaming chat (`useChat` hook used in `src/components/chat/AssessmentChat.tsx`)
- `@ai-sdk/google` 3.0.67 — Google Gemini provider (chat route uses `gemini-2.5-flash` model)
- `@ai-sdk/deepseek` 2.0.31 — DeepSeek provider (dynamically imported in `src/app/(chat)/assessment/actions.ts` for narrative generation with `deepseek-v4-flash`)
- `@supabase/supabase-js` 2.105.0 — Supabase JS client
- `@supabase/ssr` 0.10.2 — Supabase SSR helpers for Next.js (browser + server clients, middleware session handling)
- `zod` 4.3.6 — runtime schema validation (`zodSchema()` for AI tool input schemas)
- `lucide-react` 1.11.0 — icon library

**Infrastructure:**
- `eslint-config-next` 16.2.4 — Next.js ESLint rule sets

## Configuration

**Environment:**
- `.env.local` (gitignored) — runtime secrets
- `.env.local.example` — documents required variables:
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (client-safe)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (client-safe)
  - `DEEPSEEK_API_KEY` — DeepSeek API key (server-side only; falls back to static narrative if absent)
  - `NEXT_PUBLIC_SITE_URL` — base URL for auth redirect (defaults to `http://localhost:3000`)

**Build:**
- `next.config.ts` — minimal config, no custom options currently set
- `tsconfig.json` — strict mode, `bundler` moduleResolution, path alias `@/*` → `./src/*`, target ES2017
- `postcss.config.mjs` — PostCSS with Tailwind v4

## Platform Requirements

**Development:**
- Node.js >=18
- Supabase project linked (ref: `nwloqvnsudjxbmymqzor`, project: `hongyefang`)
- Valid Supabase credentials in `.env.local`
- Optional: `DEEPSEEK_API_KEY` (assessment completion falls back to hardcoded narrative strings when absent)

**Production:**
- Deployment target: Not explicitly configured in codebase; standard Next.js output assumed (Vercel-compatible)
- Auth callback route opts into Edge runtime (`export const runtime = 'edge'` in `src/app/auth/callback/route.ts`)
- Google Gemini API key must be available to the server (no env var name documented; provider reads default `GOOGLE_GENERATIVE_AI_API_KEY`)

---

*Stack analysis: 2026-05-17*

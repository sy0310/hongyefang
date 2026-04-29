# Technology Stack

**Last updated:** 2026-04-29

## Languages

| Language | Version | Usage |
|----------|---------|-------|
| TypeScript | ^5 | Primary language — all source files |
| Node.js | v25.8.2 | Runtime (local dev) |
| SQL | — | Supabase migrations |

## Runtime & Framework

| Component | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.4 | Full-stack React framework with App Router |
| React | 19.2.4 | UI library |
| Turbopack | (Next.js default) | Dev server bundler |

Next.js uses `strict` TypeScript mode with `bundler` module resolution and `@/*` path alias mapping to `./src/*`.

## Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/ssr` | ^0.10.2 | Supabase SSR authentication — three-file pattern (client, server, middleware) |
| `@supabase/supabase-js` | ^2.105.0 | Supabase database client |
| `ai` | ^6.0.168 | AI SDK core — `streamText`, `MockLanguageModelV4`, `simulateReadableStream` |
| `@ai-sdk/react` | ^3.0.170 | React bindings — `useChat` hook for streaming chat |
| `zod` | ^4.3.6 | Schema validation — parameter card inputs |
| `lucide-react` | ^1.11.0 | Icon set for chat UI |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5 | Type checking |
| `tailwindcss` | ^4 | CSS framework (CSS-first config, no `tailwind.config.js`) |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin for Tailwind v4 |
| `eslint` | ^9 | Linting |
| `eslint-config-next` | 16.2.4 | Next.js ESLint config |
| `@types/react` | ^19 | React type definitions |
| `@types/react-dom` | ^19 | React DOM type definitions |
| `@types/node` | ^20 | Node.js type definitions |

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration (empty defaults) |
| `tsconfig.json` | TypeScript config — strict mode, `@/*` alias |
| `postcss.config.mjs` | PostCSS config with `@tailwindcss/postcss` and `tailwindcss` plugins |
| `.env.local` | Local environment variables (Supabase URL + anon key) — gitignored |
| `.env.local.example` | Template for environment variables — tracked in git |
| `.eslintrc.json` / `eslint.config.*` | ESLint configuration (uses default Next.js config) |

## Installation

```bash
npm install    # Installs all dependencies from package.json
npm run dev    # Starts Next.js dev server with Turbopack
npm run build  # Production build
npm run start  # Production server
```

## No Test Framework Installed

No test runner (Vitest, Jest, Playwright) is currently installed. Testing infrastructure is a gap for all phases.

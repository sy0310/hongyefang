# 红叶坊 (hongyefang)

AI-driven startup consulting funnel platform for individual entrepreneurs in China.

## Quick Start

```bash
npm install
cp .env.local.example .env.local  # fill in Supabase + AI API keys
npm run dev
```

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS 4, TypeScript
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** OpenAI / Claude API via Server Actions
- **Payment:** WeChat Pay + Alipay (sandbox for MVP)
- **Deploy:** Vercel

## GSD Workflow

This project uses the GSD (Get Shit Done) framework. Read `.planning/` for current scope:

- `.planning/PROJECT.md` — project context and decisions
- `.planning/ROADMAP.md` — 4 phased roadmap
- `.planning/REQUIREMENTS.md` — 20 v1 requirements
- `.planning/config.json` — workflow config (YOLO mode)
- `.planning/STATE.md` — current phase status

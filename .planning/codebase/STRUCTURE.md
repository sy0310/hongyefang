# Directory Structure

**Last updated:** 2026-04-29

```
hongyefang-mvp/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── (auth)/                   # Auth route group (no layout effect)
│   │   │   ├── login/
│   │   │   │   ├── page.tsx          # Login page with auth tabs
│   │   │   │   └── actions.ts        # Server Actions: login, register, logout
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx          # Reset password page
│   │   │   └── update-password/
│   │   │       └── page.tsx          # Update password page
│   │   ├── (chat)/                   # Chat route group
│   │   │   ├── assessment/
│   │   │   │   ├── page.tsx          # Chat assessment page
│   │   │   │   └── actions.ts        # Server Actions: create/get/complete assessment, save messages
│   │   │   └── result/
│   │   │       └── page.tsx          # Result placeholder page
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          # POST /api/chat — mock AI streaming endpoint
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts          # Auth callback — exchanges code for session
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Protected dashboard page
│   │   ├── favicon.ico
│   │   ├── globals.css               # Tailwind v4 CSS import
│   │   ├── layout.tsx                # Root layout with Geist font + metadata
│   │   └── page.tsx                  # Home page (auth-based redirect)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthTabs.tsx          # Tab switcher: login / register
│   │   │   ├── LoginForm.tsx         # Login form with useActionState
│   │   │   ├── RegisterForm.tsx      # Register form with useActionState
│   │   │   ├── ResetPasswordForm.tsx # Reset password form
│   │   │   └── UpdatePasswordForm.tsx# Update password form
│   │   ├── chat/
│   │   │   ├── AssessmentChat.tsx    # Main chat client container
│   │   │   ├── ChatInput.tsx         # Bottom input bar + send button
│   │   │   ├── MessageBubble.tsx     # Individual message bubble
│   │   │   └── ParameterCard.tsx     # Inline parameter input card
│   │   ├── dashboard/
│   │   │   └── AssessmentEntryButton.tsx  # "开始创业体检" button
│   │   └── ui/
│   │       ├── Button.tsx            # Reusable button (primary/secondary/ghost)
│   │       ├── Input.tsx             # Reusable input with label + error
│   │       └── Tabs.tsx              # Tab navigation component
│   ├── lib/
│   │   ├── chat/
│   │   │   ├── mock-responses.ts     # Predefined mock AI responses per stage
│   │   │   ├── state-machine.ts      # Conversation state machine (useReducer)
│   │   │   └── validation.ts         # Zod schemas for parameter validation
│   │   └── supabase/
│   │       ├── client.ts             # Browser Supabase client factory
│   │       ├── middleware.ts         # SSR session update helper
│   │       └── server.ts             # Server Supabase client factory
│   ├── middleware.ts                  # Next.js middleware (route protection)
│   └── types/
│       └── assessment.ts             # Assessment, ChatMessage types + parameter constants
├── supabase/
│   └── migrations/
│       ├── 002_create_assessments.sql     # assessments table + RLS
│       └── 003_create_chat_messages.sql   # chat_messages table + RLS
├── .planning/                        # GSD planning artifacts
│   ├── STATE.md
│   ├── ROADMAP.md
│   ├── REQUIREMENTS.md
│   ├── PROJECT.md
│   ├── codebase/                     # Codebase mapping documents
│   ├── phases/
│   │   ├── 01-基础搭建/
│   │   └── 02-ai/
│   └── spikes/                       # Technical spikes
├── .env.local.example                # Environment variable template
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── CLAUDE.md                         # Claude Code project instructions
```

## Key Structure Rules

- **Route groups** `(auth)/` and `(chat)/` are URL-transparent — they organize related pages without affecting the URL path
- **Components** grouped by feature domain: `auth/`, `chat/`, `dashboard/`, `ui/`
- **Library files** grouped by concern: `chat/` for AI assessment logic, `supabase/` for database
- **Supabase migrations** stored in `supabase/migrations/` following standard Next.js + Supabase convention

## File Size Summary

| Range | Count | Files |
|-------|-------|-------|
| < 50 lines | 18 | Most UI components, pages, types, configs |
| 50-100 lines | 4 | ParameterCard, state-machine, mock-responses, middlware |
| 100+ lines | 2 | AssessmentChat (251), API route (125) |

# Phase 2: AI 创业体检 — 对话系统 - Research

**Researched:** 2026-04-27
**Domain:** Next.js 16 App Router streaming, AI chat UI, state machine conversation flow, Supabase real-time persistence
**Confidence:** HIGH

## Summary

This phase builds a conversational AI assessment interface that collects four parameters (年度弹性资金、每周投入时间、预期年化回报、投入金额) through a chat-like UI with streaming AI responses. The AI is mocked for Phase 2 but the streaming infrastructure must be production-ready. Key technical decisions center around: using the Vercel AI SDK (`ai` v6 + `@ai-sdk/react` v3) for streaming chat state management, Next.js Route Handlers with `ReadableStream` for SSE delivery, a lightweight custom state machine (not XState — overkill for 4 parameters), and Supabase browser client for real-time parameter persistence.

**Primary recommendation:** Use Vercel AI SDK `ai` + `@ai-sdk/react` as the streaming backbone with `useChat` hook, a custom `useReducer`-based state machine for parameter collection tracking, and Supabase browser client (`createBrowserClient` from `@supabase/ssr`) for client-side real-time saves.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **AI 模型接入暂不实现** — Phase 2 先搭建对话系统基础设施（聊天 UI、状态管理、数据持久化、流式框架），AI Provider 接入留到后续阶段添加
- **Phase 2 可以使用模拟/mock AI 回复**来跑通完整流程
- **混合模式聊天** — 整体聊天风格，关键参数用结构化卡片展示，参数卡片内嵌在消息流中
- **AI 回复使用流式逐字显示**（打字动画）
- **状态机 + AI 自动引导** — 使用状态机定义 4 个参数收集状态，AI 根据用户回答灵活调整提问顺序
- **轮数计数规则** — 仅额外追问计入轮数限制（最多一次追问），4 项参数的主要提问不计入
- **参数实时保存** — 每收集一个参数就更新 assessment 记录
- **对话历史** — 前端暂存，对话结束时统一保存到 `chat_messages` 表
- **新建 `assessments` Supabase 表**
- **Dashboard 增加「开始创业体检」入口按钮**
- **收集完成自动跳转到结果页**（/assessment/result），Phase 2 先做简单完成页/placeholder
- **随时退出支持浏览器返回 + 自动保存已填参数到 Supabase**
- **AI 流式回复使用 API Route + Edge streaming 方式**

### Claude's Discretion

- AI Provider SDK 选型、API 路由结构设计、prompt 编写
- 具体卡片样式、颜色、动画细节
- 状态机具体实现细节、system prompt 内容、追问话术
- Edge runtime 具体配置、前端 streaming 客户端实现
- 表结构详细字段名、索引设计
- 返回按钮 UI 位置、恢复对话的交互提示

### Deferred Ideas (OUT OF SCOPE)

- **AI Provider 接入**（OpenAI/Claude/国内模型）— 后续阶段添加，Phase 2 用 mock 回复
- **手机号+验证码注册** — Phase 1 已延期，等后续加入
- **评估结果页完整实现** — Phase 3 负责
- **咨询套餐展示和支付** — Phase 4 负责
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHAT-01 | 用户可以开始 AI 创业体检对话 | AI SDK streaming infrastructure + chat UI component + Dashboard entry button |
| CHAT-02 | AI 对话收集四项核心参数 | State machine for 4 parameters + inline parameter cards + real-time Supabase saves |
| CHAT-03 | AI 对话追问不超过 3 轮 | State machine tracks round count + mock AI respects limits |
| CHAT-04 | 对话界面提供流畅的聊天交互体验 | useChat hook with streaming, message bubble layout, typing animation |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Chat UI rendering | Browser / Client | — | All message rendering, streaming display, and form card interaction are client-side |
| Streaming AI responses | API / Backend (Route Handler) | — | SSE/ReadableStream endpoint that will later call real AI |
| Conversation state machine | Browser / Client | — | Tracks parameter collection state, transitions, and round counting |
| Real-time parameter save | Browser / Client (Supabase browser client) | — | Direct browser-to-Supabase updates during conversation |
| Conversation history save | Browser / Client | API / Backend | Frontend batches messages, saves on completion (browser client for authed writes) |
| Assessment creation | API / Backend (Server Action or Route Handler) | — | Needs authenticated user context; can use server client for security |
| Session resume | Browser / Client | Database / Storage | On page load, query Supabase for incomplete assessment, restore state |
| Dashboard entry button | Browser / Client | — | Simple UI addition to existing dashboard |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | 6.0.168 | AI SDK core — `streamText`, `useChat`, streaming protocol | Vercel-maintained, production-proven, Next.js-native streaming, mock support built-in [VERIFIED: npm registry] |
| `@ai-sdk/react` | 3.0.170 | React bindings for AI SDK — `useChat` hook | Pairs with `ai` core, handles message state, streaming display, form submission [VERIFIED: npm registry] |
| `zod` | 4.3.6 | Schema validation for parameter card inputs | Project rules mandate Zod for input validation, types inferred from schemas [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@supabase/supabase-js` | 2.105.x (already installed) | Browser client for real-time parameter saves and chat history | Already in project, use existing `createBrowserClient` from `@supabase/ssr` |
| `lucide-react` | latest (verify at install time) | Icons for chat UI (send button, parameter card icons) | Lightweight, popular icon set for React [ASSUMED] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AI SDK `useChat` | Custom `useReducer` + `fetch` + `ReadableStream` reader | More control but significantly more boilerplate; lose battle-tested streaming protocol handling |
| XState for state machine | `useReducer` + plain TypeScript state | XState is overkill for 4 states; `useReducer` is simpler and already React-native |
| `@tanstack/react-query` for Supabase | Direct `@supabase/supabase-js` calls | For real-time saves during conversation, direct client calls are simpler |

**Installation:**
```bash
npm install ai@6 @ai-sdk/react@3 zod lucide-react
```

**Version verification:**
- `ai`: 6.0.168 (latest, verified 2026-04-27) [VERIFIED: npm registry]
- `@ai-sdk/react`: 3.0.170 (latest, verified 2026-04-27) [VERIFIED: npm registry]
- `zod`: 4.3.6 (latest, verified 2026-04-27) [VERIFIED: npm registry]

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
│                                                              │
│  ┌──────────────┐    ┌───────────────┐    ┌───────────────┐ │
│  │ Chat UI      │◄──►│ useChat Hook  │◄──►│ State Machine │ │
│  │ (messages +  │    │ (@ai-sdk/     │    │ (useReducer)  │ │
│  │  param cards)│    │  react)       │    │               │ │
│  └──────────────┘    └───────┬───────┘    └───────┬───────┘ │
│                              │                    │         │
│                     POST     │          UPDATE     │         │
│                     /api/chat│          assessments│         │
│                              ▼                    ▼         │
│                    ┌─────────────────────────────────────┐   │
│                    │       Supabase (Browser Client)      │   │
│                    │  assessments table (real-time save)  │   │
│                    │  chat_messages table (batch save)    │   │
│                    └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Next.js Route Handler (Node.js)               │
│                                                              │
│  POST /api/chat                                              │
│  ├── receives: { messages: UIMessage[] }                     │
│  ├── streamText({ model: mock, messages })                   │
│  └── returns: result.toUIMessageStreamResponse()             │
│                                                              │
│  Mock model streams predefined responses with               │
│  simulateReadableStream for realistic typing effect          │
└─────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure
```
src/
├── app/
│   ├── (chat)/
│   │   ├── assessment/
│   │   │   ├── page.tsx              # Chat page — AssessmentChat component
│   │   │   └── loading.tsx           # Loading skeleton
│   │   └── result/
│   │       └── page.tsx              # Result placeholder (Phase 2)
│   └── api/
│       └── chat/
│           └── route.ts              # Streaming route handler
├── components/
│   ├── chat/
│   │   ├── AssessmentChat.tsx        # Main chat container
│   │   ├── MessageBubble.tsx         # User/AI message rendering
│   │   ├── ParameterCard.tsx         # Inline parameter input card
│   │   └── ChatInput.tsx             # Bottom input + send button
│   └── dashboard/
│       └── AssessmentEntryButton.tsx # "开始创业体检" button
├── lib/
│   ├── chat/
│   │   ├── state-machine.ts          # Conversation state machine types + reducer
│   │   ├── mock-responses.ts         # Predefined mock AI responses
│   │   └── validation.ts             # Zod schemas for 4 parameters
│   └── supabase/
│       ├── server.ts                 # Existing — server client
│       └── client.ts                 # Existing — browser client
└── types/
    └── assessment.ts                 # Assessment and ChatMessage types
```

### Pattern 1: Streaming Chat with AI SDK useChat

**What:** Use `useChat` from `@ai-sdk/react` to manage conversation state, message history, and streaming responses.

**When to use:** Any chat interface that needs AI streaming, typing animation, and message history management.

**Example:**
```tsx
// Source: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
'use client';

import { useChat } from '@ai-sdk/react';

function AssessmentChat() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: '/api/chat',
  });

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          <div>{message.role}</div>
          {message.parts.map((part, i) =>
            part.type === 'text' ? <p key={i}>{part.text}</p> : null
          )}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit" disabled={status === 'streaming'}>Send</button>
      </form>
    </div>
  );
}
```

Key notes for v7 API:
- `useChat` returns `messages` as `UIMessage[]` with `parts` array (not `content` string)
- `sendMessage({ text: '...' })` replaces the old `append()` method
- `status` is `'ready' | 'streaming' | 'error' | 'submitted'`

### Pattern 2: Route Handler with Streaming

**What:** A POST route handler using `streamText` and `toUIMessageStreamResponse()` for SSE delivery.

**When to use:** AI streaming endpoint that will later be connected to a real AI provider.

**Example:**
```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-core/stream-text
import { streamText } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { simulateReadableStream } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: new MockLanguageModelV4({
      doStream: async () => ({
        stream: simulateReadableStream({
          chunks: [
            { type: 'text-start', id: 'msg-1' },
            { type: 'text-delta', id: 'msg-1', delta: 'Hello' },
            { type: 'text-delta', id: 'msg-1', delta: ' from mock AI!' },
            { type: 'text-end', id: 'msg-1' },
            { type: 'finish', finishReason: { unified: 'stop', raw: undefined }, logprobs: undefined, usage: { inputTokens: { total: 3, noCache: 3, cacheRead: undefined, cacheWrite: undefined }, outputTokens: { total: 10, text: 10, reasoning: undefined } } },
          ],
        }),
      }),
    }),
    messages,
  });

  return result.toUIMessageStreamResponse();
}
```

### Pattern 3: Lightweight State Machine with useReducer

**What:** A `useReducer`-based state machine tracking which parameters are collected, round counts, and conversation stage.

**When to use:** Guided multi-parameter collection where order is flexible but completion is mandatory.

**Example:**
```typescript
type ParameterKey = 'annualCapital' | 'weeklyTime' | 'expectedReturn' | 'investmentAmount';

interface ConversationState {
  collected: Partial<Record<ParameterKey, number>>;
  currentParameter: ParameterKey | null;
  roundCount: number;
  isComplete: boolean;
  assessmentId: string | null;
}

type Action =
  | { type: 'SET_PARAMETER'; key: ParameterKey; value: number }
  | { type: 'NEXT_PARAMETER'; key: ParameterKey }
  | { type: 'INCREMENT_ROUND' }
  | { type: 'SET_ASSESSMENT_ID'; id: string }
  | { type: 'COMPLETE' };

function conversationReducer(state: ConversationState, action: Action): ConversationState {
  // ... transitions
}
```

### Pattern 4: Supabase Real-Time Parameter Save

**What:** Use the existing Supabase browser client (`createClient()` from `src/lib/supabase/client.ts`) to update assessment records as each parameter is collected.

**When to use:** Preventing data loss from user interruption during a multi-step conversation.

**Example:**
```typescript
// Source: existing project pattern — src/lib/supabase/client.ts
import { createClient } from '@/lib/supabase/client';

async function saveParameter(assessmentId: string, key: string, value: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from('assessments')
    .update({ [key]: value, updated_at: new Date().toISOString() })
    .eq('id', assessmentId);
  if (error) throw error;
}
```

### Anti-Patterns to Avoid

- **Manual ReadableStream implementation instead of AI SDK:** The AI SDK handles the SSE protocol, reconnection, and message parsing. Manual implementation duplicates this and introduces bugs.
- **Deeply nested `useEffect` for state machine:** Keep state transitions in the reducer, not scattered across effects.
- **Animating height/width/margin for typing effect:** Use opacity and transform only — per project coding style rules.
- **`export const runtime = 'edge'` with Supabase server client in route handler:** Edge runtime has limited Node.js API support. The Supabase server client imports `cookies()` from `next/headers` which works differently in Edge. See Pitfall 1 below.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| AI streaming protocol | Custom SSE parser + fetch + ReadableStream reader | AI SDK `useChat` + `toUIMessageStreamResponse()` | Handles reconnection, message parsing, streaming state, error recovery |
| State machine for 4 parameters | XState library | `useReducer` + TypeScript discriminated unions | XState adds 10kb+ for a 4-state machine; `useReducer` is React-native and sufficient |
| Input validation | Manual type checks | Zod schemas | Project rules mandate Zod; handles type inference + error messages |
| Chat message ID generation | Random string generators | AI SDK auto-generates message IDs | Built-in, collision-safe |
| Mock AI streaming | setTimeout-based string appending | AI SDK `MockLanguageModelV4` + `simulateReadableStream` | Matches real streaming protocol exactly, zero code changes when switching to real AI |

**Key insight:** The AI SDK's mock infrastructure (`MockLanguageModelV4`) uses the exact same streaming protocol as real providers. Switching from mock to real AI later requires only changing the `model` argument — no streaming, transport, or UI code changes.

## Common Pitfalls

### Pitfall 1: Edge Runtime Cannot Use Supabase Server Client
**What goes wrong:** Route handler with `export const runtime = 'edge'` tries to use `createClient()` from `src/lib/supabase/server.ts` which imports `cookies()` from `next/headers`. Edge runtime has limited Node.js API support.
**Why it happens:** `cookies()` and `headers()` from `next/headers` work differently in Edge vs Node.js runtime.
**How to avoid:** If the chat route handler needs database access, use Node.js runtime (default). Only use Edge if the handler is purely proxying to an external AI API (Phase 3+). For Phase 2 with mock responses, Node.js runtime is fine. The locked decision says "Edge streaming" but this refers to the streaming response pattern (ReadableStream/SSE), not necessarily the Edge runtime environment.
**Warning signs:** Runtime error about missing Node.js APIs or `cookies()` returning undefined.

### Pitfall 2: Next.js 16 Async Request APIs
**What goes wrong:** Code that accesses `cookies()`, `headers()`, `params`, or `searchParams` synchronously will fail in Next.js 16.
**Why it happens:** Next.js 16 removes the synchronous compatibility layer entirely (introduced as breaking change in v15).
**How to avoid:** All `cookies()`, `headers()` calls must be awaited. Route handler `params` is a Promise that must be awaited.
**Warning signs:** "Cannot access cookies synchronously" or similar runtime errors.

### Pitfall 3: AI SDK v7 Message Parts vs Content String
**What goes wrong:** Code expecting `message.content` (string) fails because v7 uses `message.parts` array.
**Why it happens:** AI SDK v5+ replaced `Message.content` with `UIMessage.parts` array for multi-modal support.
**How to avoid:** Always use `message.parts.map(...)` for rendering. For simple text, extract with `part.type === 'text' ? part.text : ''`.
**Warning signs:** `message.content` is undefined; TypeScript errors on `Message` vs `UIMessage` types.

### Pitfall 4: Browser Buffering Makes Streaming Look Non-Streaming
**What goes wrong:** Streaming appears to deliver all at once instead of chunk-by-chunk.
**Why it happens:** Safari/WebKit buffers until 1024 bytes. Compression layers buffer internally. Reverse proxies buffer by default.
**How to avoid:** During development, verify with the stream-observer script pattern from Next.js docs. Ensure initial response is > 1024 bytes. For dev (Chrome), this should not be an issue.
**Warning signs:** All text appears at once instead of character-by-character.

### Pitfall 5: Supabase RLS Policies Block Browser Client Writes
**What goes wrong:** Browser client `insert` or `update` calls fail with "new row violates row-level security policy".
**Why it happens:** New tables need RLS policies configured. Authenticated users need `insert`, `select`, `update` on their own assessment records.
**How to avoid:** Create RLS policies alongside the table migration. Use `auth.uid()` to scope policies to the authenticated user.
**Warning signs:** Supabase returns 403 with RLS policy error in browser console.

## Code Examples

### Mock AI Route Handler (Phase 2)

```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-core/testing
// src/app/api/chat/route.ts
import { streamText } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { simulateReadableStream } from 'ai';
import type { UIMessage } from 'ai';
import { getNextMockResponse } from '@/lib/chat/mock-responses';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Determine what the mock AI should say based on conversation state
  const mockResponse = getNextMockResponse(messages);

  const result = streamText({
    model: new MockLanguageModelV4({
      doStream: async () => ({
        stream: simulateReadableStream({
          chunks: [
            { type: 'text-start', id: 'msg-1' },
            ...mockResponse.split('').map(char => ({
              type: 'text-delta' as const,
              id: 'msg-1',
              delta: char,
            })),
            { type: 'text-end', id: 'msg-1' },
            {
              type: 'finish',
              finishReason: { unified: 'stop', raw: undefined },
              logprobs: undefined,
              usage: {
                inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
                outputTokens: { total: mockResponse.length, text: mockResponse.length, reasoning: undefined },
              },
            },
          ],
          initialDelayInMs: 200,
          chunkDelayInMs: 10,
        }),
      }),
    }),
    messages: [],
    prompt: mockResponse,
  });

  return result.toUIMessageStreamResponse();
}
```

### Parameter Card Inline in Message Flow

```tsx
// src/components/chat/ParameterCard.tsx
'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface ParameterCardProps {
  label: string;
  placeholder: string;
  unit: string;
  onSubmit: (value: number) => void;
}

export function ParameterCard({ label, placeholder, unit, onSubmit }: ParameterCardProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(value);
    if (!isNaN(num)) onSubmit(num);
  };

  return (
    <form onSubmit={handleSubmit} className="my-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <p className="text-sm font-medium text-blue-800 mb-2">{label}</p>
      <div className="flex gap-2">
        <Input
          label=""
          type="number"
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
          className="flex-1"
        />
        <span className="self-end text-sm text-gray-500 pb-2">{unit}</span>
        <Button type="submit" variant="primary" className="self-end">确认</Button>
      </div>
    </form>
  );
}
```

### Supabase assessments Table Schema

```sql
-- migration: create_assessments
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  annual_capital numeric,
  weekly_time numeric,
  expected_return numeric,
  investment_amount numeric,
  status text default 'in_progress' check (status in ('in_progress', 'completed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.assessments enable row level security;

create policy "Users can create their own assessments" on public.assessments
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own assessments" on public.assessments
  for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own assessments" on public.assessments
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### Supabase chat_messages Table Schema

```sql
-- migration: create_chat_messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.assessments(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamp with time zone default now()
);

alter table public.chat_messages enable row level security;

create policy "Users can create chat messages for their assessments" on public.chat_messages
  for insert to authenticated
  with check (
    exists (
      select 1 from public.assessments
      where id = chat_messages.assessment_id
      and user_id = auth.uid()
    )
  );

create policy "Users can view chat messages from their assessments" on public.chat_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.assessments
      where id = chat_messages.assessment_id
      and user_id = auth.uid()
    )
  );
```

### Conversation State Machine

```typescript
// src/lib/chat/state-machine.ts
export type ParameterKey = 'annualCapital' | 'weeklyTime' | 'expectedReturn' | 'investmentAmount';

export interface ConversationState {
  collected: Partial<Record<ParameterKey, number>>;
  currentParameter: ParameterKey | null;
  followUpRounds: Record<ParameterKey, number>;
  assessmentId: string | null;
  isComplete: boolean;
}

export type ConversationAction =
  | { type: 'START' }
  | { type: 'PARAMETER_COLLECTED'; key: ParameterKey; value: number }
  | { type: 'FOLLOW_UP_USED'; key: ParameterKey }
  | { type: 'SET_ASSESSMENT_ID'; id: string }
  | { type: 'COMPLETE' };

const PARAMETER_ORDER: ParameterKey[] = [
  'annualCapital',
  'weeklyTime',
  'expectedReturn',
  'investmentAmount',
];

export function conversationReducer(
  state: ConversationState,
  action: ConversationAction,
): ConversationState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        currentParameter: PARAMETER_ORDER[0],
      };

    case 'PARAMETER_COLLECTED': {
      const newCollected = { ...state.collected, [action.key]: action.value };
      const currentIndex = PARAMETER_ORDER.indexOf(action.key);
      const nextIndex = currentIndex + 1;
      const nextParameter = nextIndex < PARAMETER_ORDER.length
        ? PARAMETER_ORDER[nextIndex]
        : null;
      const isComplete = nextParameter === null && Object.keys(newCollected).length === 4;

      return {
        ...state,
        collected: newCollected,
        currentParameter: nextParameter,
        followUpRounds: { ...state.followUpRounds, [action.key]: 0 },
        isComplete,
      };
    }

    case 'FOLLOW_UP_USED':
      return {
        ...state,
        followUpRounds: {
          ...state.followUpRounds,
          [action.key]: (state.followUpRounds[action.key] || 0) + 1,
        },
      };

    case 'SET_ASSESSMENT_ID':
      return { ...state, assessmentId: action.id };

    case 'COMPLETE':
      return { ...state, isComplete: true };

    default:
      return state;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `message.content` string | `message.parts` array (UIMessage) | AI SDK v5+ | Multi-modal message support; text extracted via `part.type === 'text'` |
| `append({ role, content })` | `sendMessage({ text: '...' })` | AI SDK v5+ | Structured message sending with parts |
| Manual SSE with `EventSource` | `useChat` hook with `toUIMessageStreamResponse()` | AI SDK v4+ | Built-in streaming, error handling, state management |
| `export const runtime = 'experimental-edge'` | `export const runtime = 'edge'` | Next.js 15+ | Experimental flag removed |
| Sync `cookies()`, `headers()`, `params` | Async `await cookies()`, `await params` | Next.js 16 | Sync access removed; must await all request-time APIs |

**Deprecated/outdated:**
- `message.content` on AI SDK messages: replaced by `message.parts` array
- `append()` method on `useChat`: replaced by `sendMessage()`
- Next.js 15 sync request APIs: fully removed in Next.js 16
- `experimental-edge` runtime: deprecated since Next.js 15

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `lucide-react` is the best icon library choice | Standard Stack | Low — any icon library works; can be swapped without architecture impact |
| A2 | `useReducer` is sufficient for 4-state conversation (no XState needed) | Don't Hand-Roll | Low-Medium — if conversation complexity grows significantly, may need XState later |
| A3 | Node.js runtime for the chat route handler is acceptable despite "Edge streaming" locked decision | Pitfall 1 / Open Questions | Medium — the locked decision says "Edge streaming" which could mean Edge runtime specifically; needs user confirmation |

## Open Questions

1. **Edge runtime vs Node.js for `/api/chat`**
   - What we know: CONTEXT.md says "API Route + Edge streaming". Next.js docs show streaming works in both runtimes.
   - What's unclear: Does "Edge streaming" mean `export const runtime = 'edge'` specifically, or just the streaming pattern (ReadableStream/SSE)?
   - Recommendation: Use Node.js runtime (default) for Phase 2 since we're using mock responses. The streaming behavior is identical. Can migrate to Edge when real AI provider is added. **Needs user confirmation.**

2. **Assessment creation trigger**
   - What we know: One assessment record per conversation session.
   - What's unclear: Should the assessment be created when the user first opens the chat page (server-side, via Server Action), or when they submit their first message (client-side, via browser client)?
   - Recommendation: Create on page load via Server Action — gives us an assessment ID immediately for real-time saves and resume functionality.

3. **Resume conversation UX**
   - What we know: Must restore incomplete assessment on return.
   - What's unclear: Should the restored conversation show the full chat history (from `chat_messages`), or just the parameter cards with filled values and a fresh chat?
   - Recommendation: Show filled parameter cards + a brief AI greeting summarizing progress. Full chat history restoration is complex with streaming; defer to Phase 3+.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js dev server | (existing project) | Verify at runtime | — |
| npm | Package installation | (existing project) | Verify at runtime | — |
| Supabase project | Database + auth | (existing project) | — | — |
| `ai` + `@ai-sdk/react` | Chat streaming | Not yet installed | 6.0.x + 3.0.x | None — must install |
| `zod` | Input validation | Not yet installed | 4.3.x | None — must install |

**Missing dependencies with no fallback:**
- `ai` + `@ai-sdk/react` — required for streaming infrastructure
- `zod` — required for parameter validation (project rules mandate)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Not yet installed — Vitest or Playwright TBD |
| Config file | None — see Wave 0 |
| Quick run command | TBD |
| Full suite command | TBD |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAT-01 | User can start assessment conversation from Dashboard | E2E | TBD | ❌ Wave 0 |
| CHAT-02 | AI collects all 4 parameters through conversation | Unit + E2E | TBD | ❌ Wave 0 |
| CHAT-03 | Follow-up rounds limited to max 1 per parameter | Unit | TBD | ❌ Wave 0 |
| CHAT-04 | Chat UI streams messages smoothly | E2E (Playwright visual) | TBD | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Not configured — framework not yet installed
- **Per wave merge:** Not configured
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] Test framework selection and installation (Vitest for unit, Playwright for E2E)
- [ ] `tests/unit/state-machine.test.ts` — covers CHAT-02, CHAT-03
- [ ] `tests/e2e/assessment-chat.spec.ts` — covers CHAT-01, CHAT-04
- [ ] Framework install commands

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Supabase Auth (existing) — session cookies via `@supabase/ssr` middleware |
| V3 Session Management | yes | Supabase session management, RLS policies scoped to `auth.uid()` |
| V4 Access Control | yes | RLS policies on `assessments` and `chat_messages` — user can only access own data |
| V5 Input Validation | yes | Zod schemas for all 4 parameter inputs |
| V6 Cryptography | no | No direct cryptography in this phase |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| RLS bypass — user accessing another user's assessment | Tampering | RLS policies with `auth.uid()` check on all CRUD operations |
| XSS via injected chat messages | Tampering | React auto-escapes; never use `dangerouslySetInnerHTML` with user input |
| CSRF on form submissions | Spoofing | Supabase uses Bearer token auth; CSRF not applicable for API-based auth |
| Parameter injection (non-numeric values) | Tampering | Zod `z.number()` validation on all parameter inputs |
| Assessment ID enumeration | Information Disclosure | RLS ensures only assessment owner can read |

## Sources

### Primary (HIGH confidence)
- Context7: `/websites/nextjs` — Next.js 16 streaming guide, route handler API, async request APIs, edge runtime [VERIFIED: Context7]
- Context7: `/websites/ai-sdk_dev_v7` — AI SDK v7 streaming, useChat hook, mock testing, custom data parts, response methods [VERIFIED: Context7]
- Context7: `/supabase/supabase` — RLS policies, table creation, browser client patterns [VERIFIED: Context7]
- npm registry — `ai@6.0.168`, `@ai-sdk/react@3.0.170`, `zod@4.3.6` [VERIFIED: npm view]
- Project codebase — existing Supabase SSR pattern, Button/Input components, middleware [VERIFIED: codebase read]

### Secondary (MEDIUM confidence)
- Next.js official streaming guide (https://nextjs.org/docs/app/guides/streaming) — chunked transfer encoding, Suspense boundaries, streaming verification [VERIFIED: WebFetch]
- AI SDK official docs (https://ai-sdk.dev/docs) — useChat, streamText, simulateReadableStream, UIMessage type [VERIFIED: Context7 sourced from official]

### Tertiary (LOW confidence)
- `lucide-react` as icon library recommendation [ASSUMED: training knowledge]
- Assessment creation timing recommendation (page load vs first message) [ASSUMED: architectural reasoning]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified via npm registry and Context7 official docs
- Architecture: HIGH — streaming patterns verified against Next.js 16 and AI SDK v7 official docs
- Pitfalls: HIGH — Next.js 16 async APIs verified, Edge/Node runtime differences verified, AI SDK v7 message types verified
- Schema design: MEDIUM — based on Supabase official patterns, not tested against this specific project's RLS setup

**Research date:** 2026-04-27
**Valid until:** 30 days (AI SDK moves fast; Next.js 16 is stable)

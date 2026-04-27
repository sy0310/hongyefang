# Phase 2: AI 创业体检 — 对话系统 - Validation

**Phase:** 02-ai
**Created:** 2026-04-27
**Status:** Pending test framework installation

## Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (unit) + Playwright (E2E) |
| Config file | vitest.config.ts + playwright.config.ts (Wave 0 must create) |
| Quick run command | `npx vitest --run` (unit) / `npx playwright test` (E2E) |
| Full suite command | `npm test` (to be configured) |

## Requirements → Test Cases

### CHAT-01: 用户可以开始 AI 创业体检对话

| # | Test Case | Type | Steps | Expected | File |
|---|-----------|------|-------|----------|------|
| CHAT-01-01 | Dashboard entry button exists | E2E | 1. Navigate to /dashboard 2. Check for "开始创业体检" button | Button is visible and clickable | `tests/e2e/assessment-chat.spec.ts` |
| CHAT-01-02 | Clicking entry navigates to /assessment | E2E | 1. Click "开始创业体检" button | URL changes to /assessment | `tests/e2e/assessment-chat.spec.ts` |
| CHAT-01-03 | Assessment page renders for authenticated user | E2E | 1. Login 2. Navigate to /assessment | Chat interface renders without error | `tests/e2e/assessment-chat.spec.ts` |
| CHAT-01-04 | Unauthenticated access redirects to /login | E2E | 1. Logout 2. Navigate to /assessment | Redirected to /login | `tests/e2e/assessment-chat.spec.ts` |
| CHAT-01-05 | Assessment record created on page load | Unit | 1. Call createAssessment Server Action with auth context | Returns { id: string } with valid UUID | `tests/unit/server-actions.test.ts` |

### CHAT-02: AI 对话收集四项核心参数

| # | Test Case | Type | Steps | Expected | File |
|---|-----------|------|-------|----------|------|
| CHAT-02-01 | State machine START transitions to first parameter | Unit | 1. Dispatch START action to initialState | currentParameter = 'annualCapital' | `tests/unit/state-machine.test.ts` |
| CHAT-02-02 | PARAMETER_COLLECTED advances to next parameter | Unit | 1. Dispatch START, then PARAMETER_COLLECTED for annualCapital | currentParameter = 'weeklyTime' | `tests/unit/state-machine.test.ts` |
| CHAT-02-03 | All 4 parameters collected sets isComplete | Unit | 1. Dispatch PARAMETER_COLLECTED for all 4 parameters | isComplete = true, currentParameter = null | `tests/unit/state-machine.test.ts` |
| CHAT-02-04 | Zod schema validates valid input | Unit | 1. annualCapitalSchema.parse(50) | Returns 50 without error | `tests/unit/validation.test.ts` |
| CHAT-02-05 | Zod schema rejects invalid input | Unit | 1. annualCapitalSchema.safeParse(-1) | Returns { success: false } | `tests/unit/validation.test.ts` |
| CHAT-02-06 | ParameterCard renders input for unfilled parameter | Unit | 1. Render ParameterCard with value=null | Input field + submit button visible | `tests/unit/parameter-card.test.tsx` |
| CHAT-02-07 | ParameterCard shows filled state | Unit | 1. Render ParameterCard with value=50 | Shows green card with value, no input | `tests/unit/parameter-card.test.tsx` |
| CHAT-02-08 | Parameter save updates Supabase record | Unit | 1. Call supabase.update with column + value | No error, row updated | `tests/unit/supabase-save.test.ts` |

### CHAT-03: AI 对话追问不超过 3 轮

| # | Test Case | Type | Steps | Expected | File |
|---|-----------|------|-------|----------|------|
| CHAT-03-01 | FOLLOW_UP_USED increments round count | Unit | 1. Dispatch FOLLOW_UP_USED for annualCapital | followUpRounds.annualCapital = 1 | `tests/unit/state-machine.test.ts` |
| CHAT-03-02 | FOLLOW_UP_USED rejected after limit reached | Unit | 1. Dispatch FOLLOW_UP_USED twice for same parameter | Second dispatch returns unchanged state (followUpRounds stays 1) | `tests/unit/state-machine.test.ts` |
| CHAT-03-03 | Mock response respects follow-up limit | Unit | 1. getNextMockResponse(0, 'annualCapital', true, true) | Returns PARAMETER_PROMPTS[annualCapital], not FOLLOW_UP_PROMPTS | `tests/unit/mock-responses.test.ts` |
| CHAT-03-04 | Mock response returns follow-up when limit not reached | Unit | 1. getNextMockResponse(0, 'annualCapital', true, false) | Returns FOLLOW_UP_PROMPTS[annualCapital] | `tests/unit/mock-responses.test.ts` |
| CHAT-03-05 | Follow-up resets on PARAMETER_COLLECTED | Unit | 1. FOLLOW_UP_USED then PARAMETER_COLLECTED for same parameter | followUpRounds resets to 0 | `tests/unit/state-machine.test.ts` |

### CHAT-04: 对话界面提供流畅的聊天交互体验

| # | Test Case | Type | Steps | Expected | File |
|---|-----------|------|-------|----------|------|
| CHAT-04-01 | MessageBubble renders user message right-aligned | Unit | 1. Render MessageBubble with role='user' | Message has justify-end class | `tests/unit/message-bubble.test.tsx` |
| CHAT-04-02 | MessageBubble renders assistant message left-aligned | Unit | 1. Render MessageBubble with role='assistant' | Message has justify-start class | `tests/unit/message-bubble.test.tsx` |
| CHAT-04-03 | MessageBubble shows streaming indicator | Unit | 1. Render MessageBubble with isStreaming=true | Pulse dot (animate-pulse) is visible | `tests/unit/message-bubble.test.tsx` |
| CHAT-04-04 | ChatInput disabled during streaming | Unit | 1. Render ChatInput with isStreaming=true | Input has disabled attribute, button disabled | `tests/unit/chat-input.test.tsx` |
| CHAT-04-05 | POST /api/chat returns streaming response | E2E | 1. POST to /api/chat with messages array | Response is SSE stream with chunks | `tests/e2e/api-chat.spec.ts` |
| CHAT-04-06 | Streaming appears character by character | E2E | 1. POST to /api/chat 2. Measure time between chunks | Chunks arrive with ~10ms intervals | `tests/e2e/api-chat.spec.ts` |

## Wave 0 Gaps

- [ ] Install Vitest: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] Create `vitest.config.ts` with jsdom environment
- [ ] Create `tests/unit/state-machine.test.ts` — covers CHAT-02-01 through CHAT-02-03, CHAT-03-01, CHAT-03-02, CHAT-03-05
- [ ] Create `tests/unit/validation.test.ts` — covers CHAT-02-04, CHAT-02-05
- [ ] Create `tests/unit/mock-responses.test.ts` — covers CHAT-03-03, CHAT-03-04
- [ ] Create `tests/unit/message-bubble.test.tsx` — covers CHAT-04-01 through CHAT-04-03
- [ ] Create `tests/unit/chat-input.test.tsx` — covers CHAT-04-04
- [ ] Create `tests/unit/parameter-card.test.tsx` — covers CHAT-02-06, CHAT-02-07
- [ ] Create `tests/unit/server-actions.test.ts` — covers CHAT-01-05
- [ ] Create `tests/unit/supabase-save.test.ts` — covers CHAT-02-08
- [ ] Install Playwright: `npm install -D @playwright/test` + `npx playwright install`
- [ ] Create `tests/e2e/assessment-chat.spec.ts` — covers CHAT-01-01 through CHAT-01-04
- [ ] Create `tests/e2e/api-chat.spec.ts` — covers CHAT-04-05, CHAT-04-06
- [ ] Configure `playwright.config.ts`

## Coverage Targets

| Requirement | Minimum Tests | Coverage Target |
|-------------|--------------|-----------------|
| CHAT-01 | 3 | 1 E2E + 2 Unit |
| CHAT-02 | 8 | 6 Unit + 2 Component |
| CHAT-03 | 5 | 5 Unit |
| CHAT-04 | 6 | 3 Unit + 2 E2E + 1 Component |
| **Total** | **22** | |

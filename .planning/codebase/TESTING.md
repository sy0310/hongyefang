# Testing Patterns

**Analysis Date:** 2026-05-17

## Test Framework

**Runner:** Vitest ^4.1.5 (installed as a devDependency)

**Config:** `vitest.config.ts` at project root:
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

Note: `.tsx` test files are not included by the current glob. Only `.ts` test files are picked up.

**Assertion library:** Vitest built-in (`expect`, `describe`, `it`)

**Run commands:**
```bash
npx vitest            # run all tests
npx vitest --watch    # watch mode
npx vitest --coverage # coverage (no coverage provider configured yet)
```

No `test` script is defined in `package.json` — tests must be run via `npx vitest` directly.

## Test File Organization

**Location:** Co-located with the module under test.

**Naming:** `<module>.test.ts` (e.g., `engine.test.ts` alongside `engine.ts`)

**Current test file:** `src/lib/scoring/engine.test.ts`

## Test Types Present

**Unit tests:** One file present, covering the scoring engine thoroughly.

**Integration tests:** None.

**E2E tests:** None.

## Test Structure

**Suite and case naming:**
```ts
describe('calculateScore', () => {
  it('returns 高度适配 for a strong profile', () => { ... });
  it('returns 1000 for maximum inputs', () => { ... });
});

describe('computeSubScores', () => {
  it('matches calculateScore.subScores for same input', () => { ... });
});
```

**AAA pattern followed:** Tests use Arrange (shared `STRONG_PROFILE` constant) / Act (`calculateScore(...)`) / Assert (`expect(result.score).toBe(...)`).

**Shared fixtures:** Module-level constant `STRONG_PROFILE` used across multiple tests to avoid repetition:
```ts
const STRONG_PROFILE = {
  annualCapital: 50,
  weeklyTime: 40,
  expectedReturn: 50,
  investmentAmount: 30,
  industryExperience: 5,
  debtPressure: 0,
};
```

**Spread overrides for variants:**
```ts
it('detects wishing type when expectedReturn > 500', () => {
  const result = calculateScore({ ...STRONG_PROFILE, expectedReturn: 600 });
  expect(result.isWishingType).toBe(true);
});
```

## What Is Tested

**`src/lib/scoring/engine.ts`** (`src/lib/scoring/engine.test.ts`):
- `calculateScore`: tier assignments at all three thresholds, maximum inputs (score = 1000), null inputs (defaults), wishing-type flag detection, tier override when wishing-type, boundary exactness at 500% return, step-function boundary for `industryExperience`, debt pressure extremes
- `computeSubScores`: verified to match `calculateScore.subScores` output
- 11 test cases total

## What Is Not Tested

**All other lib modules:**
- `src/lib/chat/state-machine.ts` — `conversationReducer` transitions, follow-up guard, completion detection
- `src/lib/chat/validation.ts` — Zod schema min/max boundary correctness
- `src/lib/match/algorithm.ts` — `complementarityScore`, label functions
- `src/lib/chat/mock-responses.ts` — response selection logic
- `src/lib/scoring/deepseek-prompt.ts` — prompt builder, fallback narrative

**All Server Actions:**
- `src/app/(chat)/assessment/actions.ts` — `createAssessment`, `completeAssessment`, `saveChatMessages`, `getInProgressAssessment`
- `src/app/(auth)/login/actions.ts` — `login`, `register`, `logout`
- `src/lib/orders/actions.ts`

**All components:** No component tests exist. Chat flow, auth form behavior, result display, and session resume are untested.

**All API routes:**
- `src/app/api/chat/route.ts` — system prompt building, tool invocation

**E2E flows:**
- Login → Dashboard
- Dashboard → Assessment → completion → /result redirect
- Session resume for in-progress assessments
- Payment modal interaction

## Coverage

No coverage provider is configured (no `@vitest/coverage-v8` or `@vitest/coverage-istanbul` in devDependencies). Coverage cannot currently be measured.

**Estimated actual coverage:** Very low. Only the scoring engine (`src/lib/scoring/engine.ts`, 115 lines) is tested. All Server Actions, components, API routes, and other lib modules are uncovered.

**Target per project rules:** Minimum 80% for library code (`src/lib/`) and Server Actions.

## Mocking

No mocking utilities configured or used in the existing test file. The scoring engine is pure functions with no external dependencies, so no mocks are needed.

When testing Server Actions and API routes, the following will need to be mocked:
- Supabase client (`@supabase/supabase-js`) — via `vi.mock`
- AI SDK calls (`generateText`, `streamText`) — via `vi.mock`
- Next.js navigation (`redirect`, `revalidatePath`) — via `vi.mock('next/navigation')`

## Gaps to Address (Priority Order)

1. **HIGH** — `src/lib/chat/state-machine.ts`: pure reducer with complex logic, zero test coverage
2. **HIGH** — `src/lib/chat/validation.ts`: Zod schema boundaries untested
3. **HIGH** — `src/app/(chat)/assessment/actions.ts`: core Server Actions covering data persistence
4. **MEDIUM** — `src/lib/match/algorithm.ts`: scoring helpers and label functions
5. **MEDIUM** — `src/lib/scoring/deepseek-prompt.ts`: prompt builder and fallback
6. **LOW** — Component rendering tests (lower signal-to-noise for highly visual components)
7. **LOW** — E2E flows with Playwright (requires environment with Supabase available)

---

*Testing analysis: 2026-05-17*

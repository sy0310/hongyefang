# Phase 3: 评估引擎 — 画像生成 + 结果展示 - Research

**Researched:** 2026-04-29
**Domain:** Rule-based scoring engine, DeepSeek API integration, Supabase ALTER TABLE migration, Next.js 16 Server Component with async data fetch
**Confidence:** HIGH

## Summary

Phase 3 receives four parameters collected by the Phase 2 chat system (annual capital, weekly time, expected return, investment amount), runs a deterministic weighted scoring algorithm, persists the result to Supabase, calls DeepSeek to generate a personalized narrative paragraph, and renders a full result page replacing the Phase 2 placeholder.

The scoring engine is a pure TypeScript function — no library needed. DeepSeek integration uses the existing Vercel AI SDK pattern (`@ai-sdk/deepseek` v2.0.30 + `generateText` from `ai` v6) called from within the Server Component (or a Server Action triggered at assessment completion). The `assessments` table gains four new columns via a new migration file using `ALTER TABLE`. The result page is an async Server Component that queries the most recently completed assessment for the authenticated user, calls DeepSeek for the narrative, and renders the full layout.

**Primary recommendation:** Run scoring computation inside an extended `completeAssessment` Server Action (persist score + tier + is_wishing_type + ai_narrative in one `UPDATE`), then navigate to `/result` which reads the already-persisted data — this eliminates race conditions between navigation and async AI generation.

## Project Constraints (from CLAUDE.md / AGENTS.md)

AGENTS.md states: "This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."

Key Next.js 16 breaking changes confirmed from local docs:
- `searchParams` and `params` in page components are now `Promise<...>` — must be `await`ed [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md]
- `loading.js` wraps page in Suspense boundary automatically
- Server Components fetch data directly (no `getServerSideProps`)
- Server Actions use `'use server'` directive — same as observed in `src/app/(chat)/assessment/actions.ts`

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 评分方式为规则加权计算，不使用 AI 生成评分，0–1000 分范围
- **D-02:** 四项参数权重：年度弹性资金 40% + 投入金额 30% + 每周投入时间 20% + 预期年化回报率 10%
- **D-03:** 三个等级标签：高度适配 / 中度适配 / 需要准备（分数阈值由 planner 决定）
- **D-04:** 许愿型判断规则：预期年化回报率 > 500% 即标记为许愿型
- **D-05:** 被标记为许愿型的用户直接强制评为「需要准备」，绕过加权分数计算
- **D-06:** 布局方案：维度拆解卡片（方案B）— 顶部横栏综合分数+等级标签；中部四项维度各自进度条+文字评价；底部 AI 叙述+CTA
- **D-07:** 话术策略按等级分：许愿型用温和劝退，高度适配/中度适配用正面肯定引导咨询
- **D-08:** 底部 CTA 按钮所有用户可见，措辞不同（许愿型「准备好后预约顾问」，适配型「立即预约专属顾问」）
- **D-09:** 使用 DeepSeek API 生成结果页个性化叙述段落（非评分逻辑）
- **D-10:** 实现方式：Server Component 后台生成，页面加载时调用 DeepSeek，完成后整段文字渲染，不使用流式输出
- **D-11:** 新增环境变量 `DEEPSEEK_API_KEY`

### Claude's Discretion

- 各等级的具体分数边界值（如 700+/400–699/<400）
- 各参数映射到子分数的具体公式
- `assessments` 表新字段的具体命名和类型
- DeepSeek prompt 设计（须包含四项参数值、等级、是否许愿型，并遵守 D-07 话术策略）
- 进度条视觉实现（颜色、宽度计算、文字标签样式）

### Deferred Ideas (OUT OF SCOPE)

- 咨询套餐详情展示 — Phase 4 负责
- 支付入口 — Phase 4 负责
- 手机号+验证码注册 — 已延期，待后续阶段加入
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EVAL-01 | AI 根据收集的参数生成创业适配度评分 | Rule-based scoring function (D-01/D-02/D-03) called in extended `completeAssessment` Server Action |
| EVAL-02 | 系统自动识别并标记"许愿型"用户 | `expectedReturn > 500` check (D-04/D-05) runs before scoring, forces tier to 「需要准备」 |
| EVAL-03 | 用户画像数据保存到数据库 | Supabase migration 004 adds `score`, `tier`, `is_wishing_type`, `ai_narrative` columns; updated in `completeAssessment` |
| RESULT-01 | 用户查看评估结果页面（适配度评分 + 建议） | Async Server Component reads completed assessment from Supabase, renders dimension cards with progress bars (D-06) |
| RESULT-02 | 评估结果使用正面话术包装，避免用户被冒犯感 | DeepSeek narrative generation with tier-specific prompt strategy (D-07/D-09/D-10) |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Scoring computation | API / Backend (Server Action) | — | Pure function called server-side inside `completeAssessment`; never exposes scoring logic to client |
| Wishing-type detection | API / Backend (Server Action) | — | Same action as scoring; single pass, single DB write |
| Persist score + tier + narrative | Database / Storage (Supabase) | API / Backend | `UPDATE assessments SET score=..., tier=..., is_wishing_type=..., ai_narrative=...` in extended `completeAssessment` |
| DeepSeek narrative generation | API / Backend (Server Action) | — | Called server-side; API key never exposed to browser |
| Result page rendering | Frontend Server (SSR) | — | Async Server Component reads persisted data, renders dimension cards |
| Progress bar display | Browser / Client (Tailwind inline styles) | — | Width calculated from sub-scores using inline `style={{ width: '...' }}` |
| CTA button | Frontend Server (SSR) | — | Text variant selected at render time based on `tier` / `is_wishing_type` |

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | 6.0.168 | `generateText` for DeepSeek narrative call | Already in project; `generateText` is the non-streaming text generation function [VERIFIED: npm registry] |
| `@ai-sdk/deepseek` | 2.0.30 | DeepSeek provider for Vercel AI SDK | Official AI SDK provider; uses same `generateText` API as other AI SDK providers [VERIFIED: npm view] |
| `@supabase/ssr` | 0.10.2 | Server client for reading assessment in Server Component | Already used in `src/lib/supabase/server.ts` [VERIFIED: package.json] |
| `zod` | 4.3.6 | Validate scoring inputs before computing | Already in project; project rules mandate Zod for boundary validation [VERIFIED: package.json] |
| `tailwindcss` | 4.x | Progress bar width, tier color coding | Already in project; no additional UI library (per project constraint) [VERIFIED: package.json] |

### New Dependency

| Library | Version | Purpose | Install |
|---------|---------|---------|---------|
| `@ai-sdk/deepseek` | 2.0.30 | DeepSeek provider | `npm install @ai-sdk/deepseek` |

**Version verification:**
```bash
npm view @ai-sdk/deepseek version
# 2.0.30 (verified 2026-04-29)
```

**Installation:**
```bash
npm install @ai-sdk/deepseek
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@ai-sdk/deepseek` | Raw `fetch` to `https://api.deepseek.com/chat/completions` | Raw fetch works (OpenAI-compatible API); but `@ai-sdk/deepseek` + `generateText` fits the existing AI SDK pattern already used in the project API route; avoids manual header management |
| `@ai-sdk/deepseek` | OpenAI SDK pointed at DeepSeek base URL | Also valid; but project already depends on `ai` SDK, adding OpenAI SDK is unnecessary duplication |

## Architecture Patterns

### System Architecture Diagram

```
Assessment Chat completes
        |
        v
completeAssessment() Server Action (extended)
  ├─ 1. Fetch four params from assessments table
  ├─ 2. Run scoring engine (pure TS function)
  │       ├─ wishing-type check (expectedReturn > 500%)
  │       ├─ weighted scoring (if not wishing-type)
  │       └─ tier assignment
  ├─ 3. Call DeepSeek generateText (server-side)
  │       └─ returns ai_narrative string
  └─ 4. UPDATE assessments SET score, tier, is_wishing_type, ai_narrative
        |
        v
router.push('/result')  [client-side navigation]
        |
        v
/result Server Component
  ├─ createClient() → query most recent completed assessment for user
  ├─ Render: score banner + tier badge
  ├─ Render: 4x dimension progress bars (sub-score % of max)
  ├─ Render: ai_narrative paragraph
  └─ Render: CTA button (text varies by tier/is_wishing_type)
```

### Recommended Project Structure

```
src/
├── lib/
│   └── scoring/
│       ├── engine.ts          # Pure scoring function: calculateScore(params) → ScoringResult
│       └── engine.test.ts     # Unit tests for scoring logic
├── app/
│   └── (chat)/
│       ├── assessment/
│       │   └── actions.ts     # Extended: completeAssessment now runs scoring + DeepSeek + DB write
│       └── result/
│           ├── page.tsx       # Async Server Component (full replace of placeholder)
│           └── loading.tsx    # Suspense fallback (skeleton)
├── components/
│   └── result/
│       ├── ScoreBanner.tsx    # Top band: overall score + tier badge
│       ├── DimensionCard.tsx  # Single dimension row: label + progress bar + text
│       └── ResultCTA.tsx      # Bottom CTA button with tier-dependent copy
└── types/
    └── assessment.ts          # Extended: add score, tier, isWishingType, aiNarrative fields
supabase/
└── migrations/
    └── 004_assessment_scoring_fields.sql   # ALTER TABLE adds 4 columns
```

### Pattern 1: Extended `completeAssessment` Server Action

**What:** Single Server Action runs scoring, AI generation, and DB persistence atomically before redirect.
**When to use:** When result page must render from already-persisted data (no async wait on load).

```typescript
// Source: established pattern from src/app/(chat)/assessment/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateScore } from '@/lib/scoring/engine';
import { generateText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

export async function completeAssessment(assessmentId: string): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  // 1. Fetch collected parameters
  const { data: assessment, error: fetchError } = await supabase
    .from('assessments')
    .select('annual_capital, weekly_time, expected_return, investment_amount')
    .eq('id', assessmentId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !assessment) return { error: 'assessment not found' };

  // 2. Run scoring engine (pure function)
  const scoring = calculateScore({
    annualCapital: assessment.annual_capital,
    weeklyTime: assessment.weekly_time,
    expectedReturn: assessment.expected_return,
    investmentAmount: assessment.investment_amount,
  });

  // 3. Generate narrative via DeepSeek
  const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY! });
  const { text: aiNarrative } = await generateText({
    model: deepseek('deepseek-v4-flash'),
    messages: [
      { role: 'system', content: buildSystemPrompt(scoring.tier, scoring.isWishingType) },
      { role: 'user', content: buildUserPrompt(assessment, scoring) },
    ],
  });

  // 4. Persist all scoring fields + complete status
  const { error: updateError } = await supabase
    .from('assessments')
    .update({
      status: 'completed',
      score: scoring.score,
      tier: scoring.tier,
      is_wishing_type: scoring.isWishingType,
      ai_narrative: aiNarrative,
    })
    .eq('id', assessmentId)
    .eq('user_id', user.id);

  if (updateError) return { error: updateError.message };
  return { success: true };
}
```

### Pattern 2: Pure Scoring Engine

**What:** Stateless function that takes four params and returns score, tier, sub-scores, is_wishing_type.
**When to use:** Always — scoring must be deterministic and unit-testable.

```typescript
// Source: CONTEXT.md D-01 through D-05 decisions
// src/lib/scoring/engine.ts

export interface ScoringInput {
  annualCapital: number | null;
  weeklyTime: number | null;
  expectedReturn: number | null;
  investmentAmount: number | null;
}

export interface ScoringResult {
  score: number;           // 0–1000
  tier: '高度适配' | '中度适配' | '需要准备';
  isWishingType: boolean;
  subScores: {
    annualCapital: number;    // 0–400 (40%)
    investmentAmount: number; // 0–300 (30%)
    weeklyTime: number;       // 0–200 (20%)
    expectedReturn: number;   // 0–100 (10%)
  };
}

export function calculateScore(input: ScoringInput): ScoringResult {
  const annualCapital = input.annualCapital ?? 0;
  const weeklyTime = input.weeklyTime ?? 0;
  const expectedReturn = input.expectedReturn ?? 0;
  const investmentAmount = input.investmentAmount ?? 0;

  // D-04: wishing-type check first
  const isWishingType = expectedReturn > 500;

  // Sub-score formulas (Claude's Discretion — planner finalizes exact ranges)
  // These are placeholder formulas; planner will refine
  const capitalScore = Math.min(400, (annualCapital / 50) * 400);  // 50万 = max
  const investScore = Math.min(300, (investmentAmount / 30) * 300); // 30万 = max
  const timeScore = Math.min(200, (weeklyTime / 40) * 200);         // 40h = max
  // Lower expected return = higher return score (realistic expectations rewarded)
  const returnScore = isWishingType ? 0 : Math.min(100, Math.max(0, 100 - (expectedReturn / 100) * 50));

  const totalScore = Math.round(capitalScore + investScore + timeScore + returnScore);

  // D-05: wishing-type forces 「需要准备」 regardless of score
  let tier: ScoringResult['tier'];
  if (isWishingType) {
    tier = '需要准备';
  } else if (totalScore >= 700) {
    tier = '高度适配';
  } else if (totalScore >= 400) {
    tier = '中度适配';
  } else {
    tier = '需要准备';
  }

  return {
    score: isWishingType ? totalScore : totalScore, // score is computed regardless; tier is forced
    tier,
    isWishingType,
    subScores: {
      annualCapital: Math.round(capitalScore),
      investmentAmount: Math.round(investScore),
      weeklyTime: Math.round(timeScore),
      expectedReturn: Math.round(returnScore),
    },
  };
}
```

### Pattern 3: Result Page Server Component

**What:** Async Server Component queries the most recently completed assessment for the user.
**When to use:** After `completeAssessment` has already written score + narrative to DB.

```typescript
// Source: Next.js 16 local docs — node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md
// src/app/(chat)/result/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ResultPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: assessment } = await supabase
    .from('assessments')
    .select('score, tier, is_wishing_type, ai_narrative, annual_capital, weekly_time, expected_return, investment_amount')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (!assessment) redirect('/dashboard');

  return (
    <main>
      {/* ScoreBanner, DimensionCards, NarrativeParagraph, CTA */}
    </main>
  );
}
```

**Note:** No `id` is passed in the URL — the result page queries the most recently completed assessment. This is consistent with the existing `router.push('/result')` in `AssessmentChat.tsx` (no query params). [VERIFIED: src/components/chat/AssessmentChat.tsx line 164]

### Pattern 4: Supabase Migration — Add Columns to Existing Table

**What:** New migration file with `ALTER TABLE` to add scoring columns.
**When to use:** When columns are added to an existing deployed table.

```sql
-- supabase/migrations/004_assessment_scoring_fields.sql
-- migration: add scoring fields to assessments

alter table public.assessments
  add column if not exists score integer,
  add column if not exists tier text check (tier in ('高度适配', '中度适配', '需要准备')),
  add column if not exists is_wishing_type boolean,
  add column if not exists ai_narrative text;
```

`add column if not exists` is idempotent — safe to re-run. [CITED: supabase.com/docs/guides/deployment/database-migrations]

### Pattern 5: Progress Bar with Tailwind CSS 4

**What:** Dimension progress bars use inline `style` for dynamic widths (Tailwind purges dynamic class names).
**When to use:** Any percentage-width that varies at runtime.

```tsx
// src/components/result/DimensionCard.tsx
interface DimensionCardProps {
  label: string;
  subScore: number;
  maxScore: number;
  description: string;
}

export function DimensionCard({ label, subScore, maxScore, description }: DimensionCardProps) {
  const pct = Math.round((subScore / maxScore) * 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{description}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

**Why inline style:** Tailwind 4 still purges classes not present in source — `w-[${pct}%]` will be purged. `style={{ width }}` is the correct pattern for dynamic values. [ASSUMED — standard Tailwind constraint, well-documented in Tailwind docs]

### Anti-Patterns to Avoid

- **Calling DeepSeek in the result page Server Component:** Creates latency on every page load. Pre-generate and persist instead.
- **Passing assessment ID via URL query params:** Not current pattern (`router.push('/result')` has no params). Query by `user_id + status='completed' ORDER BY updated_at DESC` instead.
- **Dynamic Tailwind width classes:** `w-[${n}%]` will be purged at build time — use inline `style={{ width }}`.
- **Using `supabase.auth.getSession()` in Server Components:** Phase 2 result page uses this, but Supabase docs recommend `supabase.auth.getUser()` for server-side auth validation (getSession reads from cookie without re-validation). Existing result page uses getSession — standardize on getUser in new code.
- **Using `deepseek-chat` model name:** Deprecated as of July 24, 2026 per DeepSeek docs. Use `deepseek-v4-flash` (fast/cheaper) or `deepseek-v4-pro`. [CITED: api-docs.deepseek.com]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DeepSeek API calls | Custom fetch wrapper | `@ai-sdk/deepseek` + `generateText` | Same API as existing `streamText` usage; handles auth headers, error types, retries |
| Supabase column addition | Drop/recreate table | `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` | Non-destructive; preserves existing data and RLS policies |
| Progress bar component | CSS animation library | Tailwind + inline `style={{ width }}` | No extra library needed; project constraint = no extra UI libs |
| Scoring formula | AI-generated scores | Pure deterministic TypeScript function | D-01 explicitly prohibits AI-generated scoring |

**Key insight:** The DeepSeek call is for *narrative text only* — not for scoring. Scoring is pure rule-based TypeScript. This separation makes the scoring engine fully unit-testable without API mocks.

## Common Pitfalls

### Pitfall 1: DeepSeek Call Latency Blocks Navigation

**What goes wrong:** If DeepSeek is called in the result page Server Component, every page load (including refreshes) re-calls DeepSeek. User waits 2–5 seconds on every visit.
**Why it happens:** Server Components run on every request unless cached.
**How to avoid:** Call DeepSeek once in `completeAssessment` Server Action, persist the result to `ai_narrative` column. Result page reads persisted text — zero AI latency on page load.
**Warning signs:** `generateText` import found in `result/page.tsx`.

### Pitfall 2: `is_wishing_type` Shortcircuits Score Display Logic

**What goes wrong:** Result page renders score (e.g., 650) but tier shows 「需要准备」 — confusing for users who expect score and tier to correlate.
**Why it happens:** D-05 forces tier to 「需要准备」 for wishing-type regardless of computed score.
**How to avoid:** For `is_wishing_type = true`, consider displaying the score as "参考分数" with a note, or hide the numeric score entirely and lead with tier label. Planner should decide presentation.
**Warning signs:** User feedback that score and tier "don't match".

### Pitfall 3: Dynamic Tailwind Classes Purged at Build

**What goes wrong:** `className={`w-[${pct}%]`}` works in dev but breaks in production build.
**Why it happens:** Tailwind 4 scans source files at build time; dynamically constructed class names are not detected.
**How to avoid:** Always use `style={{ width: `${pct}%` }}` for runtime-computed values.
**Warning signs:** Progress bars render at 0 width in production.

### Pitfall 4: assessments Table RLS Allows Read-Only — No UPDATE for New Columns

**What goes wrong:** `UPDATE assessments SET score=...` fails with RLS policy violation.
**Why it happens:** Existing RLS policy for UPDATE on assessments only allows `user_id = auth.uid()` — this is correct. But if the migration adds a `CHECK` constraint on `tier` column, inserts/updates with empty tier (for in_progress rows) will fail.
**How to avoid:** Use `add column if not exists tier text check (tier in ('高度适配', '中度适配', '需要准备'))` — the CHECK constraint only fires on non-null values. Nullable columns with CHECK constraints accept NULL without violating the constraint in PostgreSQL. [VERIFIED: standard PostgreSQL behavior]
**Warning signs:** Error `new row for relation "assessments" violates check constraint` when updating in-progress assessments.

### Pitfall 5: `completeAssessment` Called Twice on Re-render

**What goes wrong:** The `useEffect` in `AssessmentChat` that calls `completeAssessment` may fire twice in React 18/19 Strict Mode, causing duplicate DeepSeek calls.
**Why it happens:** React 19 Strict Mode double-invokes effects in development.
**How to avoid:** Make `completeAssessment` idempotent — if score/tier/ai_narrative already exist on the assessment, skip re-computation. Add a guard at the top of the action.
**Warning signs:** Two DeepSeek API calls visible in server logs per completion event.

### Pitfall 6: Result Page Has No Assessment to Show

**What goes wrong:** User navigates to `/result` directly without completing an assessment — `supabase.select().single()` throws error on no rows.
**Why it happens:** `.single()` raises an error if no rows found.
**How to avoid:** Check `data` for null before rendering; redirect to `/dashboard` if no completed assessment found.
**Warning signs:** Unhandled error in Server Component on direct `/result` navigation.

## Code Examples

### DeepSeek generateText Call

```typescript
// Source: [CITED: ai-sdk.dev/providers/ai-sdk-providers/deepseek]
import { createDeepSeek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

const { text } = await generateText({
  model: deepseek('deepseek-v4-flash'),
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ],
});
// text is the ai_narrative string
```

**Environment variable validation** (TypeScript security rules require startup validation):
```typescript
if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error('DEEPSEEK_API_KEY is not configured');
}
```

### Supabase ALTER TABLE Migration

```sql
-- supabase/migrations/004_assessment_scoring_fields.sql
alter table public.assessments
  add column if not exists score integer,
  add column if not exists tier text check (tier in ('高度适配', '中度适配', '需要准备')),
  add column if not exists is_wishing_type boolean,
  add column if not exists ai_narrative text;
```

Apply locally: `npx supabase db push` or apply SQL directly in Supabase dashboard.

### TypeScript Type Extension

```typescript
// src/types/assessment.ts — extended Assessment interface
export type Tier = '高度适配' | '中度适配' | '需要准备';

export interface Assessment {
  id: string;
  userId: string;
  annualCapital: number | null;
  weeklyTime: number | null;
  expectedReturn: number | null;
  investmentAmount: number | null;
  status: AssessmentStatus;
  // Phase 3 additions:
  score: number | null;
  tier: Tier | null;
  isWishingType: boolean | null;
  aiNarrative: string | null;
  createdAt: string;
  updatedAt: string;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `deepseek-chat` model | `deepseek-v4-flash` / `deepseek-v4-pro` | DeepSeek deprecation notice (July 24, 2026) | Must use new model names; old name still works until deadline |
| `supabase.auth.getSession()` | `supabase.auth.getUser()` | Supabase SSR v2+ | `getUser()` re-validates server-side; `getSession()` only reads cookie |

**Deprecated/outdated:**
- `deepseek-chat`: Deprecated July 24, 2026. Use `deepseek-v4-flash` for cost efficiency in this use case. [CITED: api-docs.deepseek.com]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Dynamic Tailwind width classes (`w-[${n}%]`) are purged at build time in Tailwind 4 | Common Pitfalls #3, Code Examples | If wrong, dynamic classes work fine — low risk, inline style is still valid |
| A2 | Scoring formula placeholders (50万 capital = max 400 points, etc.) — planner will refine these | Architecture Patterns (scoring engine code) | If formula ranges are wrong for the business domain, tier distribution will be off |
| A3 | PostgreSQL CHECK constraints on nullable columns accept NULL without violation | Common Pitfalls #4 | If wrong, in-progress assessments will fail UPDATE — planner must add `WHERE is_wishing_type IS NOT NULL` guard or omit CHECK constraint |

## Open Questions

1. **Score display for wishing-type users**
   - What we know: D-05 forces tier to 「需要准备」; the numeric score is still computed
   - What's unclear: Should the numeric score (e.g., 420) be displayed, or hidden to avoid confusion between score and tier?
   - Recommendation: Planner should decide — safest is to show score with a `*` note explaining why tier was overridden

2. **Error handling for DeepSeek API failure**
   - What we know: D-10 specifies non-streaming generation; no fallback strategy is documented
   - What's unclear: If DeepSeek times out or returns an error, should `completeAssessment` fail (and assessment not be marked complete) or succeed with a generic fallback narrative?
   - Recommendation: On DeepSeek failure, use a tier-specific fallback narrative string (hardcoded) and still persist the scoring result — assessment completion should not depend on AI availability

3. **Sub-score formula calibration**
   - What we know: D-02 defines weights; exact formulas are Claude's discretion
   - What's unclear: What are realistic input ranges for the target user population (startup advisees)?
   - Recommendation: Planner sets reasonable defaults; business can tune after seeing real data

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@ai-sdk/deepseek` | DeepSeek narrative generation | Not installed yet | 2.0.30 (latest) | Must install: `npm install @ai-sdk/deepseek` |
| `DEEPSEEK_API_KEY` | `createDeepSeek()` | Not in `.env.local` | — | Must add before testing; use fallback narrative string in dev if absent |
| Supabase CLI | Migration deployment | 2.95.6 (via npx) | 2.95.6 | `npx supabase db push` or apply SQL via Supabase dashboard |
| `ai` package | `generateText` | 6.0.168 installed | 6.0.168 | Already present |

**Missing dependencies with no fallback:**
- `DEEPSEEK_API_KEY` must be obtained from platform.deepseek.com before testing the narrative generation path

**Missing dependencies with fallback:**
- DeepSeek API during development: use hardcoded fallback narrative strings per tier, guarded by `process.env.DEEPSEEK_API_KEY` check

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No test runner detected in project |
| Config file | None — Wave 0 must add |
| Quick run command | `npx vitest run src/lib/scoring/` (after install) |
| Full suite command | `npx vitest run` |

No test runner is currently installed in the project. [VERIFIED: package.json — no jest, vitest, or mocha in devDependencies]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EVAL-01 | `calculateScore` returns correct weighted score for valid inputs | unit | `npx vitest run src/lib/scoring/engine.test.ts` | Wave 0 |
| EVAL-02 | `calculateScore` returns `isWishingType=true` and `tier='需要准备'` when `expectedReturn > 500` | unit | `npx vitest run src/lib/scoring/engine.test.ts` | Wave 0 |
| EVAL-02 | Wishing-type bypasses weighted score for tier assignment | unit | `npx vitest run src/lib/scoring/engine.test.ts` | Wave 0 |
| EVAL-03 | `completeAssessment` persists score, tier, is_wishing_type, ai_narrative to Supabase | integration (manual) | Manual Supabase dashboard check | manual-only |
| RESULT-01 | Result page renders score banner, 4 dimension cards, CTA button | smoke | `npx playwright test result` | Wave 0 |
| RESULT-02 | Wishing-type narrative contains 温和劝退 language; non-wishing-type contains 正面肯定 | manual review | DeepSeek prompt review | manual-only |

**Manual-only justification for EVAL-03:** Supabase integration tests require live credentials — not suitable for automated CI without test database setup. Row verification via Supabase dashboard is the standard validation approach for this project phase.

**Manual-only justification for RESULT-02:** Narrative quality is subjective; automated testing of AI-generated text is unreliable. Review DeepSeek prompt against D-07 tone requirements.

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/scoring/engine.test.ts` (scoring unit tests only)
- **Per wave merge:** `npx vitest run` (all unit tests)
- **Phase gate:** Full unit test suite green + manual smoke check of result page before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `vitest` and `@vitest/ui` — install: `npm install -D vitest`
- [ ] `src/lib/scoring/engine.test.ts` — covers EVAL-01 and EVAL-02
- [ ] `vitest.config.ts` — basic vitest configuration

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `supabase.auth.getUser()` in Server Component and Server Action |
| V3 Session Management | no | Handled by Supabase SSR cookie (established in Phase 1) |
| V4 Access Control | yes | `.eq('user_id', user.id)` on all Supabase queries; RLS policies |
| V5 Input Validation | yes | Zod schema for scoring inputs at action boundary |
| V6 Cryptography | no | No custom crypto |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| User reads another user's assessment result | Information Disclosure | Supabase RLS `user_id = auth.uid()` on assessments table; enforced at DB level |
| `DEEPSEEK_API_KEY` exposed in client bundle | Information Disclosure | `createDeepSeek()` called only in Server Action (server-side); never in Client Component |
| Arbitrary score manipulation via client | Tampering | Scoring runs in Server Action; client cannot influence score computation |
| DeepSeek prompt injection via stored params | Tampering | Params are numeric (annualCapital, weeklyTime, etc.) — no free-text user input injected into prompt; low risk |

**Note:** `DEEPSEEK_API_KEY` must never be prefixed with `NEXT_PUBLIC_` — that would expose it to the browser. Use bare `DEEPSEEK_API_KEY` (server-only). [CITED: common/security.md — never hardcode secrets]

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` — Next.js 16 page.tsx searchParams/params as Promise
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md` — loading.js Suspense boundary
- `src/app/(chat)/assessment/actions.ts` — existing Server Action patterns (verified current)
- `src/components/chat/AssessmentChat.tsx` — router.push('/result') with no query params (line 164)
- `package.json` — all installed package versions
- `supabase/migrations/002_create_assessments.sql` — current assessments table structure
- `npm view @ai-sdk/deepseek version` — version 2.0.30 (2026-04-29)

### Secondary (MEDIUM confidence)
- [ai-sdk.dev/providers/ai-sdk-providers/deepseek](https://ai-sdk.dev/providers/ai-sdk-providers/deepseek) — `@ai-sdk/deepseek` usage pattern with `createDeepSeek` and `generateText`
- [api-docs.deepseek.com](https://api-docs.deepseek.com) — DeepSeek API endpoint, supported models, deprecation notice for `deepseek-chat`
- [supabase.com/docs/guides/deployment/database-migrations](https://supabase.com/docs/guides/deployment/database-migrations) — ALTER TABLE migration workflow

### Tertiary (LOW confidence)
- Tailwind dynamic class purging behavior — [ASSUMED] based on well-known Tailwind constraint; inline `style` is the safe workaround

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via npm view and package.json
- Architecture: HIGH — patterns derived directly from verified existing codebase files
- DeepSeek API: HIGH — verified via official API docs and ai-sdk.dev provider page
- Scoring engine formulas: LOW — Claude's discretion per CONTEXT.md; planner must finalize ranges
- Pitfalls: MEDIUM — inline style/Tailwind issue is well-known; others derived from code analysis

**Research date:** 2026-04-29
**Valid until:** 2026-05-29 (stable libraries; DeepSeek model names may change sooner)

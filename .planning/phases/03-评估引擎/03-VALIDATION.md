---
phase: 3
slug: 评估引擎
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-29
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (not yet installed — Wave 0 installs) |
| **Config file** | `vitest.config.ts` — Wave 0 creates |
| **Quick run command** | `npx vitest run src/lib/scoring/` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/lib/scoring/`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full unit suite green + manual smoke check of `/result` page
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | EVAL-03 | — | Migration is non-destructive (ADD COLUMN IF NOT EXISTS) | manual | `npx supabase db push` exits 0 | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | EVAL-01 | — | N/A | unit | `npx vitest run src/lib/scoring/engine.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 1 | EVAL-02 | — | Wishing-type (expectedReturn > 500) → tier forced to 「需要准备」 | unit | `npx vitest run src/lib/scoring/engine.test.ts` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 1 | EVAL-03 | T-DEEPSEEK | DEEPSEEK_API_KEY never exposed to client bundle | manual | Check no NEXT_PUBLIC_DEEPSEEK env var | ❌ W0 | ⬜ pending |
| 3-02-02 | 02 | 1 | RESULT-02 | — | DeepSeek fallback narrative used on API failure | unit | `npx vitest run src/lib/scoring/` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03 | 2 | RESULT-01 | — | Result page renders score, tiers, dimension cards | smoke | `npx playwright test result` (or manual) | ❌ W0 | ⬜ pending |
| 3-03-02 | 03 | 2 | RESULT-02 | — | CTA copy differs by tier/is_wishing_type | smoke | manual browser check | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install -D vitest` — no test runner in project (verified: package.json)
- [ ] `vitest.config.ts` — minimal vitest config at project root
- [ ] `src/lib/scoring/engine.test.ts` — stubs for EVAL-01 and EVAL-02 (scoring engine + wishing-type detection)

*Wave 0 is a prerequisite for all automated scoring tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `score`, `tier`, `is_wishing_type`, `ai_narrative` persisted to Supabase after assessment completion | EVAL-03 | Supabase integration requires live credentials — no test DB setup in this phase | Complete a chat assessment, then check Supabase dashboard → Table Editor → assessments; verify row has non-null values in all 4 new columns |
| AI-generated narrative uses 温和劝退 tone for wishing-type users | RESULT-02 | AI text quality is subjective; automated assertion on free-form prose is unreliable | Trigger completion with `expected_return > 500`; read `ai_narrative` in Supabase; confirm no accusatory language, tone matches "doctor recommending preparation" |
| AI-generated narrative uses 正面肯定 tone for 高度适配 / 中度适配 users | RESULT-02 | Same as above | Trigger completion with realistic inputs scoring ≥ 400; read narrative; confirm positive affirming tone + prompt toward advisor consultation |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

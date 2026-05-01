---
phase: 04
slug: 付费转化-咨询展示-支付集成
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-05-01
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None required (Phase 4 is UI components + thin Server Actions, no algorithmic logic) |
| **TypeScript checker** | `npx tsc --noEmit --pretty false` -- already configured from Phase 1 |
| **Quick run command** | `npx tsc --noEmit --pretty false` |
| **Full suite command** | `npx tsc --noEmit --pretty false` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit --pretty false`
- **After every plan wave:** Run `npx tsc --noEmit --pretty false` + manual browser smoke check
- **Before `/gsd-verify-work`:** Full tsc clean + manual smoke check of `/consult`, `/payment-success`, and `/result` pages
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | PAY-04 | T-04-01-01, T-04-01-02 | createOrder validates planName (non-empty string) and amount (positive integer) before DB insert. Auth check via supabase.auth.getUser() at function entry. | automated | `test -f ... && grep ... && npx tsc --noEmit --pretty false` | -- | pending |
| 04-01-02 | 01 | 1 | PAY-04 | T-04-01-03, T-04-01-04 | getOrder scopes query by user_id. RLS policies scope INSERT/SELECT to auth.uid() = user_id. | automated | `test -f ... && grep -q ... && test $(grep -c ...) -eq 2` | -- | pending |
| 04-02-01 | 02 | 2 | CONSULT-01 | -- | ResultCTA does not expose sensitive data. Client-side navigation has no security boundary. | manual smoke | `npx tsc --noEmit --pretty false` | -- | pending |
| 04-02-02 | 02 | 2 | PAY-03 | T-04-02-01, T-04-02-02 | /payment-success verifies auth, validates order ownership via user_id eq filter, redirects to /consult if order not found. | automated + smoke | `test -f ... && grep -q ... && npx tsc --noEmit --pretty false` | -- | pending |
| 04-03-01 | 03 | 2 | CONSULT-01 | -- | PricingCard is pure UI -- no data processing, no auth boundary. | manual smoke | `test -f ... && grep -q ... && npx tsc --noEmit --pretty false` | -- | pending |
| 04-03-02 | 03 | 2 | CONSULT-02 | T-04-03-01, T-04-03-02 | PaymentModal calls createOrder Server Action which runs server-side auth check and input validation. Backdrop does NOT dismiss on click (prevents accidental cancel). | automated + smoke | `test -f ... && grep -q ... && npx tsc --noEmit --pretty false` | -- | pending |
| 04-03-03 | 03 | 2 | CONSULT-01 | -- | consult page and ConsultClient are presentational. No auth boundary (pricing visible to all). PLANS is module-level constant -- no DB queries. | automated + smoke | `test -f ... && grep -q ... && npx tsc --noEmit --pretty false` | -- | pending |

*Status: pending . green . red . flaky*

---

## Wave 0 Requirements

- [x] `npx tsc --noEmit --pretty false` -- already configured, exits 0 (verified in Phase 1--3)
- [x] `vitest` installed (Phase 3) -- not needed for Phase 4 tasks
- [x] `vitest.config.ts` exists (Phase 3) -- not needed for Phase 4 tasks

*Wave 0 is complete. No new test infrastructure required for Phase 4.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ResultCTA displays correct button copy per tier | CONSULT-01 | Visual rendering depends on assessment data loaded into result page | Complete an assessment, then visit `/result`. Verify button label and variant match the tier: (高度适配/中度适配) = "查看咨询方案" primary; (需要准备) = "了解付费咨询服务" secondary; (wishing) = "了解更多" secondary. |
| Three pricing cards render correctly on /consult with proper hierarchy | CONSULT-01, CONSULT-02 | Visual layout and badge positioning | Visit `/consult`. Verify: 3 columns,  pro plan has amber border + recommended badge, feature checkmarks align, CTA buttons at card bottom. |
| PaymentModal opens, displays plan details, confirm creates order | PAY-04 | Interactive dialog -- triggers createOrder Server Action, redirect to /payment-success | Click select on a tier. Verify: modal shows plan name + amount + simulated payment notice. Click confirm. Verify: redirect to /payment-success with correct order data. Click cancel. Verify: modal closes, back on pricing. |
| /payment-success page displays order confirmation and next-steps | PAY-03 | Data-dependent Server Component -- requires completed order ID from DB | After confirming payment, verify /payment-success shows: green checkmark, plan name, formatted amount, short order ID, contact section, QR code placeholder. |
| /payment-success handles edge cases gracefully | PAY-03 | Error paths require manual trigger | Visit /payment-success without ?id= param -- redirects to /consult. Visit /payment-success?id=FAKEID -- redirects to /consult (order not found). |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter (set upon completion)

**Approval:** pending

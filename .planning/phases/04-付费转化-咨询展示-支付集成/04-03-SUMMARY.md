---
phase: 04
plan: 03
name: Consult Pricing Page — PricingCard, PaymentModal, and /consult routing
subsystem: consult
tags: [pricing, payment, modal, server-action]
requires:
  - 04-01 (orders table, createOrder Server Action)
  - 04-02 (orders table migration — executed in same wave)
affects: []
tech-stack:
  added: []
  patterns: [Server/Client boundary split, inline SVG checkmarks, useCallback for Escape key handler]
key-files:
  created:
    - src/components/consult/PricingCard.tsx (72 lines)
    - src/components/consult/PaymentModal.tsx (108 lines)
    - src/app/(chat)/consult/page.tsx (72 lines)
    - src/app/(chat)/consult/ConsultClient.tsx (52 lines)
  modified: []
decisions:
  - PricingCard uses flex-col justify-between min-h-full for equal-height cards in grid row
  - PaymentModal backdrop click does NOT dismiss (prevents accidental close during payment flow)
  - Escape key dismisses via useEffect/addEventListener pattern
  - PLANS data is hardcoded as Server Component constant (no DB query — pricing is static for MVP)
metrics:
  duration_minutes: ~15
  completed_date: 2026-05-01
---

# Phase 04 Plan 03: Consult Pricing Page Summary

Three-tier consulting pricing page with PricingCard component, PaymentModal confirmation dialog, and simulated payment flow via createOrder Server Action.

- `PricingCard` renders plan name, price (¥ formatted), description, feature list with checkmark SVGs, "推荐方案" badge variant for the recommended tier
- `PaymentModal` is a conditional overlay with Escape-to-dismiss, calls createOrder Server Action on confirm, redirects to `/payment-success` on success, shows inline error on failure
- `/consult` page (Server Component) with hardcoded PLANS constant passes tier data to `ConsultClient` (Client boundary)
- Grid layout: stacked on mobile, 3 columns on md+, equal-height cards

## Tasks Executed

| # | Task | Type | Status | Commit |
|---|------|------|--------|--------|
| 1 | Create PricingCard component | auto | Done | `35f7328` |
| 2 | Create PaymentModal component | auto | Done | `9cdf56a` |
| 3 | Create /consult page and ConsultClient | auto | Done | `c54b943` |

## Deviations from Plan

None — all three tasks executed exactly as specified. No bugs found, no missing critical functionality, no blocking issues. Authentication gates were not triggered (createOrder handles auth internally).

## Known Stubs

None. All components are fully wired:
- PricingCard receives real data via props from ConsultClient
- PaymentModal calls real createOrder Server Action
- PLANS data is intentionally hardcoded (static pricing, no DB needed)
- Error handling is fully implemented (payment failure shows inline error)

## Threat Surface Scan

No new security-relevant surface introduced beyond what the plan's threat model accounts for:
- T-04-03-01 (Tampering with createOrder input): accepted MVP — prices originate from server-rendered PLANS constant
- T-04-03-02 (Auth bypass): mitigated — createOrder calls supabase.auth.getUser()
- T-04-03-03 (Price modification): accepted MVP

## Self-Check: PASSED

| Check | Status |
|-------|--------|
| src/components/consult/PricingCard.tsx exists | PASS |
| src/components/consult/PaymentModal.tsx exists | PASS |
| src/app/(chat)/consult/page.tsx exists | PASS |
| src/app/(chat)/consult/ConsultClient.tsx exists | PASS |
| PricingCard exports function | PASS |
| PaymentModal exports function | PASS |
| PaymentModal imports createOrder | PASS |
| PaymentModal shows 模拟支付 notice | PASS |
| Consult page has 2999, 6999, 14999 | PASS |
| ConsultClient imports PaymentModal | PASS |
| TypeScript compilation 0 errors | PASS |
| No accidental file deletions | PASS |

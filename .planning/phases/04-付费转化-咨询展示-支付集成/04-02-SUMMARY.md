---
phase: 04
plan: 02
subsystem: result-page, payment-page
tags:
  - result-cta
  - tier
  - payment-success
  - consult-links
depends_on:
  - 01 (orders table, order actions)
requires: []
affects:
  - src/components/result/ResultCTA.tsx
  - src/app/(chat)/result/page.tsx
  - src/app/(chat)/payment-success/page.tsx
tech-stack:
  added: []
  patterns:
    - 'Tier-aware UI differentiation via props'
    - 'Server Component with Supabase query + auth guard'
    - 'useRouter client navigation replacing mailto:'
key-files:
  created:
    - src/app/(chat)/payment-success/page.tsx (107 lines)
  modified:
    - src/components/result/ResultCTA.tsx (24 insertions, 6 deletions)
    - src/app/(chat)/result/page.tsx (1 line changed)
decisions:
  - 'Mailto: link removed in favor of router.push navigation to /consult'
  - 'getCTADetails extracted as private helper function for clarity'
  - 'Tier type imported from @/types/assessment (3 values)'
  - 'Order ID displayed as first 8 chars uppercase for readability'
  - 'Amount formatted with Yen prefix and toLocaleString'
  - 'searchParams typed as Promise<> per Next.js 15 async contract'
  - 'QR code is a placeholder (gray box) deferred to future plan'
  - 'Supabase ownership check (.eq user_id) on orders query'
metrics:
  duration: null
  completed_date: 2026-05-01
  files_created: 1
  files_modified: 2
  total_insertions: 131
  total_deletions: 6
  typecheck_errors: 0
---

# Phase 04 Plan 02: Result CTA Tier Differentiation and Payment Success Page

Substantive: ResultCTA now drives differentiated button copy/variant across four tier states via getCTADetails helper, removing the old mailto: approach; /payment-success page is a new Server Component with Supabase auth guard, orders query, order detail display, and edge-case redirects.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

1. **WeChat QR code placeholder** - `/src/app/(chat)/payment-success/page.tsx` lines 101-108. Renders a gray placeholder box with "微信二维码" text instead of a real QR code image. Intentional: the actual QR code asset is not available yet and will be added in a future plan.

## Threat Flags

None - all security-relevant surfaces are covered by the plan's threat model (T-04-02-01 through T-04-02-04).

## Task Summary

### Task 1: Modify ResultCTA with tier-aware CTA and add tier prop to result page

**Files modified:**
- `src/components/result/ResultCTA.tsx` - Full rewrite: added `tier: Tier` prop, `useRouter` from next/navigation, `getCTADetails` helper with 3-way branching logic (许愿型 leads to secondary, 需要准备 leads to secondary, 高度适配/中度适配 leads to primary). Removed mailto: link and fixed labels.
- `src/app/(chat)/result/page.tsx` - Changed ResultCTA invocation to pass `tier={assessment.tier}` prop.

**Verification:**
- `'use client'` directive present
- `useRouter` imported from `next/navigation`
- All three CTA labels present: "查看咨询方案", "了解更多 →", "了解付费咨询服务 →"
- `tier={assessment.tier}` passed in result page
- TypeScript compiles with 0 errors

**Commit:** `a60138d`

### Task 2: Create /payment-success page

**Files created:**
- `src/app/(chat)/payment-success/page.tsx` - New Server Component:
  - Auth check: redirects to /login if unauthenticated
  - Reads `searchParams.id` (Next.js 15 async Promise contract)
  - Missing orderId leads to redirect to /consult
  - Queries Supabase `orders` table with `user_id` ownership check
  - Order not found leads to redirect to /consult
  - Displays: green SVG checkmark (emerald-500), "支付成功" heading, plan_name, Yen-formatted amount, short order ID (first 8 chars uppercase)
  - Next-steps section: "我们将在24小时内联系您" with QR code placeholder
  - "返回首页" button linking to /dashboard via Next.js Link

**Verification:**
- File exists and contains "支付成功", "redirect('/consult')", "24小时内", "二维码"
- TypeScript compiles with 0 errors

**Commit:** `edf16c9`

## Self-Check: PASSED

All acceptance criteria met:
- [x] ResultCTA has tier prop imported from @/types/assessment
- [x] ResultCTA uses useRouter from next/navigation (no mailto:)
- [x] getCTADetails returns correct label+variant for all 4 states
- [x] result/page.tsx passes tier prop to ResultCTA
- [x] payment-success page exists as Server Component
- [x] payment-success handles auth check, missing orderId, and not-found order
- [x] payment-success displays order details, green checkmark, next-steps
- [x] npx tsc --noEmit exits 0 errors
- [x] No accidental deletions in commits

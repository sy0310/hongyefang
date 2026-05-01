---
phase: 04
plan: 01
subsystem: data-layer
tags:
  - orders
  - migration
  - supabase
  - rls
  - server-actions
requires: []
provides:
  - supabase/migrations/005_create_orders.sql
  - src/types/orders.ts
  - src/lib/orders/actions.ts
affects: []
tech-stack:
  added: []
  patterns:
    - "Supabase migration pattern: CREATE TABLE IF NOT EXISTS + RLS policies"
    - "Server Action pattern: 'use server' directive, auth check, input validation, .select().single()"
    - "Type definition pattern: camelCase from DB snake_case"
key-files:
  created:
    - supabase/migrations/005_create_orders.sql
    - src/types/orders.ts
    - src/lib/orders/actions.ts
  modified: []
decisions:
  - "orders table is simplified per D-08: id, user_id, plan_name, amount (integer), status (default 'completed'), created_at"
  - "No update/delete RLS policies — users never modify orders in MVP"
  - "amount is integer stored in fen/cents; display formatted with ¥ prefix on frontend"
metrics:
  duration: "~15 minutes"
  tasks_completed: 2
  tasks_blocked: 0
  completed_date: "2026-05-01"
---

# Phase 04 Plan 01: Orders Table + Server Actions — Summary

**One-liner:** Created the underlying data infrastructure for simulated payment records: Supabase migration 005 for the orders table (with RLS), Order type definitions, and createOrder/getOrder Server Actions that validate auth and input before database operations.

## Completed Tasks

### Task 1: Create orders migration, type definitions, and createOrder/getOrder Server Actions

**Status:** Complete
**Commit:** 7eca438

**Created files:**

1. **supabase/migrations/005_create_orders.sql**
   - Creates `public.orders` table with 6 columns: `id` (uuid PK), `user_id` (FK to auth.users), `plan_name` (text), `amount` (integer), `status` (text, default 'completed'), `created_at` (timestamptz)
   - Enables Row Level Security
   - Creates 2 RLS policies: INSERT with check `auth.uid() = user_id`, SELECT with using `auth.uid() = user_id`

2. **src/types/orders.ts**
   - Exports `Order` interface (camelCase: id, userId, planName, amount, status, createdAt)
   - Exports `CreateOrderInput` interface (planName, amount)
   - Follows existing camelCase convention from src/types/assessment.ts

3. **src/lib/orders/actions.ts**
   - Exports `createOrder(planName, amount)` Server Action:
     - Authenticates via `supabase.auth.getUser()`
     - Validates planName is non-empty string, amount is positive integer via `Number.isInteger`
     - Inserts into `orders` table with status 'completed'
     - Returns `{ orderId }` on success, `{ error }` on failure
   - Exports `getOrder(orderId)` Server Action:
     - Authenticates and scopes query by `user_id` as defense-in-depth ownership check
     - Handles PGRST116 as "order not found" (returns `{ order: null }`)
     - Returns order details on success

**Verification:**
- Files exist and contain expected content
- `grep -c "create policy"` returns 2
- `grep -c "create table if not exists public.orders"` returns 1
- Exported functions detectable via grep
- `npx tsc --noEmit --pretty false` exits with 0 errors

### Task 2: Apply schema push (supabase db push)

**Status:** Complete  
**Resolution date:** 2026-05-01

**Resolved by:** Linked project `nwloqvnsudjxbmymqzor` and ran `npx supabase db push`. All 4 migrations applied:
- `002_create_assessments.sql`
- `003_create_chat_messages.sql`
- `004_assessment_scoring_fields.sql`
- `005_create_orders.sql`

## Deviations from Plan

None — plan executed as written. The schema push failure is a documented acceptance criterion (auth gate), not a deviation.

## Security Compliance

All mitigations from the threat model are implemented:

| Threat ID | Category | Component | Disposition | Implementation |
|-----------|----------|-----------|-------------|----------------|
| T-04-01-01 | Tampering | createOrder | mitigate | Input validation: planName checked as non-empty string, amount checked as positive integer via Number.isInteger |
| T-04-01-02 | Spoofing | createOrder auth check | mitigate | `supabase.auth.getUser()` at function entry, unauthenticated returns error before DB write |
| T-04-01-03 | Info Disclosure | getOrder / RLS SELECT | mitigate | RLS policy + `.eq('user_id', user.id)` defense-in-depth |
| T-04-01-04 | Elevation of Privilege | migration SQL RLS | mitigate | RLS enabled, both INSERT/SELECT policies scope to `auth.uid() = user_id` |
| T-04-01-05 | Tampering | migration DDL file | accept | Migration SQL is version-controlled DDL, read-only to app users |

## Success Criteria Check

- [x] Migration 005 (005_create_orders.sql) defines the complete orders schema with RLS
- [x] Order and CreateOrderInput types are exported from src/types/orders.ts
- [x] createOrder and getOrder Server Actions are exported from src/lib/orders/actions.ts
- [x] Server Actions validate authentication and input before database writes
- [x] All TypeScript compiles with 0 errors
- [x] Schema push succeeds — all 4 migrations applied

## Self-Check

```
PASS: File exists: supabase/migrations/005_create_orders.sql
PASS: File exists: src/types/orders.ts
PASS: File exists: src/lib/orders/actions.ts
PASS: tsc --noEmit --pretty false exits 0
PASS: 2 RLS policies in migration
```

## Self-Check: PASSED

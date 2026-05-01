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
  duration: "~10 minutes"
  tasks_completed: 1
  tasks_blocked: 1
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

**Status:** Blocked (auth gate)

**Attempted:** `npx supabase db push` from project root.

**Result:** Exit code 1 — "Cannot find project ref. Have you run supabase link?"

This is an authentication gate. The project has not been linked to a Supabase project (local Docker or remote). The migration file is complete and verified; it just needs to be applied when Supabase is configured.

## Auth Gate

**Task 2** is blocked by Supabase CLI not being linked to a project.

### To resolve:

1. **Get your Supabase project ref** (if using remote Supabase):
   - Go to Supabase Dashboard -> Settings -> General
   - Copy the Project Reference ID (e.g., `abcdefghijklmno`)

2. **Set SUPABASE_ACCESS_TOKEN** (or log in interactively):
   ```bash
   # Option A: Set env var
   export SUPABASE_ACCESS_TOKEN="sbp_..."
   # Get token from: Supabase Dashboard -> Account -> Access Tokens

   # Option B: Interactive login
   npx supabase login
   ```

3. **Link the project:**
   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```

4. **OR use local Docker Supabase:**
   ```bash
   npx supabase start
   ```

5. **Re-run schema push:**
   ```bash
   npx supabase db push
   ```

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
- [ ] Schema push either succeeds or creates an actionable checkpoint (partial — checkpoint created below)

## Self-Check

```
PASS: File exists: supabase/migrations/005_create_orders.sql
PASS: File exists: src/types/orders.ts
PASS: File exists: src/lib/orders/actions.ts
PASS: tsc --noEmit --pretty false exits 0
PASS: 2 RLS policies in migration
```

## Self-Check: PASSED

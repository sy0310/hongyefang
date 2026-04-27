# Phase 1: 基础搭建 — Validation Strategy

**Phase:** 01
**Date:** 2026-04-27
**Test Framework:** Playwright (E2E) + npm built-in assertions

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Playwright |
| Config file | `playwright.config.ts` |
| Quick run command | `npx playwright test --headed` |
| Full suite command | `npx playwright test` |
| Install command | `npm init playwright@latest -- --no-browser --lang=ts` |

## Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | Test File |
|--------|----------|-----------|-------------------|-----------|
| AUTH-01 | User can register with email+password | E2E | `npx playwright test auth-register` | `e2e/auth-register.spec.ts` |
| AUTH-02 | Phone auth | N/A (deferred) | -- | -- |
| AUTH-03 | Session persists after refresh | E2E | `npx playwright test auth-session` | `e2e/auth-session.spec.ts` |
| AUTH-04 | User can sign out | E2E | `npx playwright test auth-logout` | `e2e/auth-logout.spec.ts` |
| AUTH-05 | User can reset password | E2E | `npx playwright test auth-reset-password` | `e2e/auth-reset-password.spec.ts` |

## E2E Test Specifications

### AUTH-01: Registration Flow
```
Test: User registers with email+password, lands on dashboard
Steps:
  1. Navigate to /login
  2. Click "Register" tab
  3. Fill email + password
  4. Submit form
  5. Assert: URL contains /dashboard
  6. Assert: page shows dashboard content
Verify command: npx playwright test auth-register
```

### AUTH-03: Session Persistence
```
Test: After login, page refresh keeps user logged in
Steps:
  1. Register/login a test user
  2. Navigate to /dashboard
  3. Reload page (page.reload())
  4. Assert: URL still contains /dashboard (not redirected to /login)
  5. Assert: user info still visible
Verify command: npx playwright test auth-session
```

### AUTH-04: Sign Out
```
Test: User clicks logout, returns to login page
Steps:
  1. Register/login a test user
  2. Navigate to /dashboard
  3. Click logout button
  4. Assert: URL contains /login
  5. Assert: visiting /dashboard redirects to /login
Verify command: npx playwright test auth-logout
```

### AUTH-05: Password Reset
```
Test: User requests password reset, can update password
Note: Requires Supabase test project with email confirmation disabled.
  In E2E test, directly call Supabase API to set new password
  (skip actual email roundtrip for automated testing).
Steps:
  1. Register a test user
  2. Navigate to /reset-password
  3. Fill email, submit
  4. Use Supabase admin API to verify reset token / set new password directly
  5. Navigate to /login
  6. Login with new password
  7. Assert: URL contains /dashboard
Verify command: npx playwright test auth-reset-password
```

## Sampling Rate

- **Per task commit:** Run relevant E2E test file after auth-related code changes
- **Per wave merge:** Run full `npx playwright test` suite
- **Phase gate:** All 4 E2E tests must pass before Phase 1 marked complete

## Manual Verification Checklist

These items require manual verification (Supabase dashboard configuration):

- [ ] Supabase project created at supabase.com
- [ ] `.env.local` contains valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Email confirmation disabled in Supabase Dashboard (Authentication -> Providers -> Email)
- [ ] Redirect URLs configured: `http://localhost:3000/auth/callback`, `http://localhost:3000/update-password`
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] User can register, login, stay logged in after refresh, logout, and reset password manually

## Wave 0 Setup Verification

After Playwright installation:
```bash
# Verify Playwright installed
npx playwright --version

# Verify browsers installed
npx playwright install --dry-run

# Run a smoke test (create a simple test that visits localhost:3000)
npx playwright test --reporter=list
```

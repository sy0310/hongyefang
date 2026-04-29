# Concerns

**Last updated:** 2026-04-29

## 1. Missing Input Validation on Server Actions (HIGH)

**Files:** `src/app/(auth)/login/actions.ts`

Server Actions `login` and `register` pass raw `FormData` values directly to Supabase without Zod validation:

```typescript
email: formData.get('email') as string,
password: formData.get('password') as string,
```

While the project has Zod installed (`zod@^4.3.6`) and `src/lib/chat/validation.ts` validates parameter inputs, the auth actions bypass validation entirely. This can cause unhelpful error messages when empty or malformed credentials are sent.

**Impact:** Poor UX on validation errors. No security risk (Supabase rejects invalid data), but unprofessional error messages.

## 2. `any` Type Usage in Forms (MEDIUM)

**Files:**
- `src/components/auth/LoginForm.tsx:18`
- `src/components/auth/RegisterForm.tsx:18`

Both forms define `formAction` as `(formData: any) => any` when calling `useActionState`. This violates the project's TypeScript coding rules which mandate avoiding `any`.

```typescript
// Current
const [state, formAction] = useActionState(async (formData: any) => {

// Should be
const [state, formAction] = useActionState(async (prevState: unknown, formData: FormData) => {
```

**Impact:** Loses type safety on Server Action return values.

## 3. `console.error` in Production Code (MEDIUM)

**File:** `src/components/chat/AssessmentChat.tsx:139,160`

Two `console.error` calls in the assessment chat component — one for failed parameter saves, one for failed chat message saves. Project rules require no `console.log` in production code, and these should use a proper logging mechanism.

```typescript
if (error) console.error('Failed to save parameter:', error.message);
```

**Impact:** Silent on user-facing side (error is logged but user has no feedback). No structured logging.

## 4. `window.location.origin` in Client Component (LOW)

**File:** `src/components/auth/ResetPasswordForm.tsx:20`

`window.location.origin` is used in a client component's event handler, which runs client-side only. This is safe in the current browser-only context but would break if the component were ever SSR-rendered.

```typescript
redirectTo: `${window.location.origin}/update-password`,
```

**Impact:** Currently safe. Would need a guard (`typeof window !== 'undefined'`) if SSR is introduced.

## 5. No Test Infrastructure (HIGH)

- No test framework installed (Vitest, Jest, Playwright)
- No test files exist
- No CI configuration
- Build passes but there is zero automated test coverage

**Impact:** Cannot verify phase requirements (CHAT-01 through CHAT-04) programmatically. Regressions impossible to catch. This is a critical gap for production readiness.

## 6. No Linter Configuration (MEDIUM)

The project has `eslint` and `eslint-config-next` in `devDependencies` but no ESLint configuration file. Linting was left at defaults. No Prettier config either.

**Impact:** Inconsistent code formatting. Automated fixes from IDE not standardized.

## 7. Missing a11y Attributes on Error Messages (LOW)

**File:** `src/components/ui/Input.tsx`

Error messages are displayed visually but not linked to inputs via `aria-describedby`. No `role="alert"` on error elements.

```tsx
// Current
{error && <p className="text-sm text-red-600">{error}</p>}

// Should be
{error && <p id={`${id}-error`} role="alert">{error}</p>}
// And input should have aria-describedby={error ? `${id}-error` : undefined}
```

**Impact:** Screen readers won't announce validation errors.

## 8. AssessmentChat Component Size (MEDIUM)

**File:** `src/components/chat/AssessmentChat.tsx` — 251 lines, likely the largest component in the project.

Combines state management, session resume, parameter handling, real-time saves, and message display in one component. Could benefit from splitting: extract session resume prompt into a separate component, move parameter save logic to a custom hook.

**Impact:** Maintainability concern as assessment features grow.

## 9. API Route Uses MockLanguageModelV3 Instead of V4 (LOW)

**File:** `src/app/api/chat/route.ts:3-4`

The route uses `MockLanguageModelV3` from `ai/test` instead of the V4 variant. The research doc recommended `MockLanguageModelV4`. This works but uses a slightly older API surface.

```typescript
import { MockLanguageModelV3 } from 'ai/test';
```

**Impact:** Should upgrade to `MockLanguageModelV4` when switching to real AI provider for consistency.

## 10. No Assessment History or Data Export (INFO)

Phase 2 only stores chat data — no way for the user or admin to view assessment history outside the session resume flow. Acceptable for MVP but limits debugging and analysis.

## Security Audit Summary

| Check | Status | Notes |
|-------|--------|-------|
| Hardcoded secrets | ✅ None | All secrets via environment variables |
| XSS vectors | ✅ None | React auto-escapes, no `dangerouslySetInnerHTML` |
| SQL injection | ✅ None | Supabase parameterized queries |
| RLS policies | ✅ Present | All tables have RLS scoped to `auth.uid()` |
| CSRF | ✅ N/A | Bearer token auth via Supabase |
| Input validation | ⚠️ Partial | Zod for parameter cards only; auth Server Actions missing |
| Rate limiting | ⚠️ Missing | No server-side rate limiting on auth endpoints |

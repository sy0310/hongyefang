# Code Conventions

**Analysis Date:** 2026-05-17

## TypeScript Usage

**Strictness:** Full strict mode enabled (`"strict": true` in `tsconfig.json`). Target ES2017, `isolatedModules: true`.

**Path alias:** `@/*` maps to `src/*`. All cross-directory imports use this alias — never relative `../../` paths across feature boundaries.

**`any` usage:** Avoided in library and business logic code. Two documented exceptions exist, both suppressed with `// eslint-disable-next-line @typescript-eslint/no-explicit-any`:
- `src/components/chat/AssessmentChat.tsx:66` — ref holding an SDK callback with an unresolvable type
- `src/components/auth/LoginForm.tsx:17` and `src/components/auth/RegisterForm.tsx:18` — `useActionState` prev argument typed as `any` (React 19 API constraint)

**`unknown` narrowing:** Not yet adopted for API route body parsing — bodies are cast with `as { ... }` rather than narrowed from `unknown`. See `src/app/api/chat/route.ts:59`.

**Type vs interface:** `interface` for object shapes and component props; `type` for unions, aliases, and mapped records. Shared domain types live in `src/types/assessment.ts`.

**`import type`:** Used consistently for type-only references:
```ts
import type { Metadata } from 'next'
import type { ScoringInput } from '@/types/assessment'
```

**Zod validation:** Used at the boundary layer (`src/lib/chat/validation.ts`) and in API tool schemas (`src/app/api/chat/route.ts`). Zod schemas declared as named exports; inferred types (`z.infer`) are not yet used — types are declared separately in `src/types/assessment.ts`.

## Component Patterns

**Directive placement:** `'use client'` at the very top of every interactive component file; `'use server'` at the top of every Server Actions file.

**Function declaration style:** Named function exports (not arrow functions) for top-level components:
```tsx
export function AssessmentChat({ hasCompletedAssessment = false }: AssessmentChatProps) { ... }
export function ScoreBanner({ score, tier, isWishingType }: ScoreBannerProps) { ... }
```

**`forwardRef` pattern:** Used only for low-level UI primitives that must expose a ref (`src/components/ui/Button.tsx`). Application-level components do not use `forwardRef`.

**Props interface:** Inline `interface` declared immediately before the component function in the same file:
```tsx
interface AssessmentChatProps {
  hasCompletedAssessment?: boolean;
}
export function AssessmentChat({ hasCompletedAssessment = false }: AssessmentChatProps) { ... }
```

**No `React.FC`:** Components typed through their props parameter only.

**Subcomponents:** Small co-located helpers (e.g., `SubmitButton` inside `LoginForm.tsx`) are plain functions in the same file, not exported.

**Conditional rendering:** Multiple early returns for distinct UI states (loading, error, prompt), followed by the main return. No ternary nesting beyond a single level.

**Supabase client — two factories:**
```tsx
// Server Component or Server Action
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Component
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (`AssessmentChat.tsx`, `ScoreBanner.tsx`, `DimensionCard.tsx`)
- Pages: `page.tsx`, `layout.tsx` (Next.js App Router)
- Actions: `actions.ts` co-located with their route segment
- Lib utilities: `kebab-case.ts` (`state-machine.ts`, `engine.ts`, `algorithm.ts`, `deepseek-prompt.ts`)
- Type definitions: `camelCase.ts` (`assessment.ts`, `orders.ts`)

**Directories:**
- Feature domains: `kebab-case` (`auth/`, `chat/`, `scoring/`, `match/`, `consult/`)
- Route groups: `(group-name)` (`(auth)/`, `(chat)/`)

**Symbols:**
- Components: `PascalCase` (`AssessmentChat`, `PartnerCard`, `DimensionCard`)
- Hooks: `use` prefix, camelCase (`useChat`, `useFormStatus`, `useActionState`)
- Constants / lookup maps: `UPPER_SNAKE_CASE` (`PARAMETER_ORDER`, `INIT_TRIGGER`, `PARAMETER_KEY_TO_DB_COLUMN`, `PARAM_LABELS`, `TIER_BADGE`)
- Server Action functions: camelCase verbs (`createAssessment`, `completeAssessment`, `saveChatMessages`, `login`, `logout`, `register`)
- Pure utility functions: camelCase (`piecewise`, `scoreCapital`, `complementarityScore`, `capitalLabel`)

## Import Style

**Order (observed):**
1. External packages (`next`, `react`, `@ai-sdk/*`, `ai`, `zod`, `lucide-react`)
2. Internal `@/lib/*` utilities
3. Internal `@/components/*`
4. Internal `@/app/...` actions
5. Internal `@/types/*`

**No barrel files:** Each module is imported directly by file path. No `index.ts` re-export aggregators observed.

**Mixing type and value imports:** `import type` used for type-only imports; combined import when both types and values are needed from the same module:
```ts
import { PARAMETER_ORDER, type ParameterKey } from '@/lib/chat/state-machine'
```

## State Patterns

**Local state:** `useState` for all ephemeral UI state. `useRef` used for values that must be stable across re-renders without triggering re-renders (assessment ID, collected params map, one-time-fire flags).

**Avoiding stale closures:** Pattern used in `src/components/chat/AssessmentChat.tsx` — keep a `Ref` in sync with state when the current value is needed inside an async callback:
```tsx
const collectedRef = useRef(collected);
collectedRef.current = collected; // kept in sync every render
```

**Server-side data:** Fetched directly in React Server Components via `await supabase...`. No SWR, no TanStack Query.

**Optimistic UI:** Implemented manually — input cleared immediately on send, restored on error (`src/components/chat/AssessmentChat.tsx:225-236`).

**Form state:** React 19 `useActionState` + `useFormStatus` for auth forms. No form library.

**AI chat state:** Managed by `useChat` from `@ai-sdk/react`. Collected parameters tracked in both `useState` (for rendering) and a `useRef` (for callbacks).

**Global state:** None. No Zustand, Context API, or Redux. All state is either local or server-resident (Supabase).

## Error Handling

**Server Actions return discriminated unions:**
```ts
// Success branch
return { id: data.id }
// or
return { success: true }

// Error branch
return { error: error.message }

// Caller pattern
if ('error' in result) { /* handle */ }
```

**Never throw in Server Actions:** Errors are always returned. Exceptions: `redirect()` and `revalidatePath()` from Next.js (which throw internally as control flow).

**API route fallback:** `src/app/(chat)/assessment/actions.ts:151-153` — AI narrative generation wraps `generateText` in `try/catch {}`, falling back to `getFallbackNarrative()` so the assessment always completes.

**Client error display:** Local `useState<string | null>` for error messages, rendered as `<p className="text-sm text-red-600">`. Two `console.error` calls remain in `src/components/chat/AssessmentChat.tsx` for async effect failures.

**No error boundaries:** No `ErrorBoundary` components present.

## Code Style

**Linting:** ESLint v9 flat config (`eslint.config.mjs`). Uses `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`. No custom rule overrides. Run: `pnpm lint` (no `--fix`).

**Formatting:** No Prettier config (`package.json` has no `prettier` dependency). Code is consistently formatted by hand / editor.

**Semicolons:** Inconsistent between files — not enforced by a rule. Lib and action files consistently use semicolons; some component files omit them.

**CSS approach:** Tailwind CSS v4 utility classes for layout/spacing. Design tokens as CSS custom properties in `src/app/globals.css`, bridged into Tailwind via `@theme inline {}`. Token values use `oklch()` color format. Inline `style` props used only when referencing CSS variables not expressible as Tailwind utilities (e.g., `style={{ color: 'var(--text-3)' }}`).

**Comments:** Inline comments for architectural decisions and locked choices (`// LOCKED DECISION: ...`). Chinese for domain-specific notes, English for technical notes. No JSDoc.

---

*Convention analysis: 2026-05-17*

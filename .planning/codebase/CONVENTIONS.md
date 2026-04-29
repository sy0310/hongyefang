# Code Conventions

**Last updated:** 2026-04-29

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `AssessmentChat`, `MessageBubble` |
| Regular functions | camelCase | `getNextMockResponse`, `detectCollectedParameters` |
| Types/Interfaces | PascalCase | `ConversationState`, `ParameterKey` |
| Files (components) | PascalCase | `ParameterCard.tsx` |
| Files (utilities) | camelCase | `state-machine.ts`, `mock-responses.ts` |
| Files (pages) | kebab-case | `page.tsx`, `layout.tsx` (Next.js conventions) |
| Constants | UPPER_SNAKE_CASE | `PARAMETER_ORDER`, `WELCOME_MESSAGE` |
| CSS variables | kebab-case | `--font-geist-sans`, `--background` |

## File Organization

- Components grouped by feature domain: `auth/`, `chat/`, `dashboard/`, `ui/`
- One component per file
- Library code grouped by concern: `chat/`, `supabase/`
- Route files follow Next.js App Router conventions

## Component Patterns

- Server Components by default (pages in `src/app/`)
- Client Components explicitly marked with `'use client'`
- Props typed via interface or inline type annotation
- Form state managed via direct `useState` (no form library)
- Chat state managed via `useReducer` for complex state machines
- Session resume prompt uses inline conditional rendering

```tsx
// Example: typed props
interface ParameterCardProps {
  parameterKey: ParameterKey;
  value: number | null;
  onSubmit: (value: number) => void;
}

export function ParameterCard({ parameterKey, value, onSubmit }: ParameterCardProps) { ... }
```

## Styling

- **Tailwind CSS v4** with CSS-first configuration (`@import "tailwindcss"` in `globals.css`)
- No `tailwind.config.js` — Tailwind v4 uses `@theme inline {}` blocks for token customization
- CSS custom properties for theme tokens (`--background`, `--foreground`)
- Utility classes used inline on JSX elements
- No CSS modules or styled-components

## Supabase Client Pattern

```tsx
// Server Component / Server Action
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

// Client Component
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
await supabase.from('assessments').update(...)
```

## Error Handling

- **Server Actions**: return `{ error: string }` or `{ success: true }` / `{ id: string }` — no exceptions
- **Client components**: `console.error` for logging (temp), UI-level error display via state
- **Zod validation**: `safeParse()` used in ParameterCard, errors displayed inline
- **Supabase calls**: `error` object checked after every operation, with early return on failure
- **No try/catch** in most handlers — errors end up returned as error objects for the UI to handle

## Imports

- Absolute imports using `@/` alias mapping to `src/`
- Relative imports only within same component group
- Type imports use `import type { ... }` for type-only imports
- React imports: `import { useState, useEffect, useCallback, useRef } from 'react'`

## Immutability

- Spread operator for state updates in the reducer
- No direct mutation of state objects
- `Readonly<>` used in experimental areas but not consistently

## Auth Pattern

- Server Actions for auth operations (login, register, logout)
- Middleware for route protection and session refresh
- Page-level auth check via `getSession()` or `getUser()` at top of Server Components

## Current Gaps

- No ESLint configuration file present (project has `eslint` + `eslint-config-next` in dependencies but no config)
- No Prettier configuration
- No formatters, linters, or pre-commit hooks configured
- No test framework installed
- `console.error` used in production code paths (should use a proper logger)

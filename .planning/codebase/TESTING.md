# Testing

**Last updated:** 2026-04-29

## Status: No Testing Infrastructure

No test framework is currently installed or configured in the project. This is a known gap across all phases.

## Dependencies

The project's `package.json` does not include any testing dependencies:
- No Vitest
- No Jest
- No Playwright
- No Testing Library

## What Should Be Tested

Based on the codebase analysis, these areas are testable:

### Unit Tests (candidates)
| Module | What to Test | Framework Needed |
|--------|-------------|-----------------|
| `src/lib/chat/state-machine.ts` | State transitions, follow-up guard, completion detection | Vitest or Jest |
| `src/lib/chat/mock-responses.ts` | Response selection logic per collected count | Vitest or Jest |
| `src/lib/chat/validation.ts` | Zod schema boundaries (min/max) | Vitest or Jest |
| `src/app/api/chat/route.ts` | Parameter detection, response routing | Vitest or Jest |

### Integration Tests (candidates)
| Flow | What to Test | Framework Needed |
|------|-------------|-----------------|
| Auth Server Actions | login, register, logout flow | Playwright or Vitest + MSW |
| Assessment creation | Server Action creates record with correct user_id | Playwright or Vitest |
| Parameter real-time save | Browser client updates Supabase correctly | Playwright |

### E2E Tests (candidates)
| Flow | What to Test | Framework Needed |
|------|-------------|-----------------|
| Login → Dashboard | Auth flow end-to-end | Playwright |
| Dashboard → Assessment | Entry button navigates to chat | Playwright |
| Assessment completion | All 4 params → redirect to /result | Playwright |
| Session resume | Return to incomplete assessment | Playwright |

## Recommended Test Setup

- **Unit tests**: Vitest (fast, native TypeScript, Vite-compatible)
- **E2E tests**: Playwright (project's standard per TypeScript testing rules)
- **Test configuration**: Vitest config parallel to `tsconfig.json`

## Coverage Goal

Per project rules: minimum **80% coverage** for library code (`src/lib/`) and Server Actions.

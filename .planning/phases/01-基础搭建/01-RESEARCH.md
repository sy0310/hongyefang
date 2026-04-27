# Phase 1: 基础搭建 — 项目脚手架 + 用户认证 - Research

**Researched:** 2026-04-27
**Domain:** Next.js 15 + Supabase Auth + Tailwind CSS 4
**Confidence:** HIGH

## Summary

This phase creates a greenfield Next.js 15 (App Router) application with Supabase authentication infrastructure. The core technical challenge is setting up the Supabase SSR cookie-based session pattern correctly from day one, because misconfigured middleware cookies cause silent session loss on page refresh.

The recommended stack uses `@supabase/ssr` (v0.10.2) with `createServerClient` in middleware and `createBrowserClient` in client components. Session persistence uses httpOnly cookies managed automatically by Supabase SSR. Auth flows (sign up, sign in, sign out, password reset) are implemented via Server Actions that delegate to the browser Supabase client.

Tailwind CSS 4 uses the new `@tailwindcss/postcss` PostCSS plugin instead of `tailwind.config.js` -- this is a breaking change from v3.

**Primary recommendation:** Use `create-next-app` with Tailwind CSS 4 template, add Supabase SSR packages, implement the three-file pattern (`lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`) as the foundational architecture.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **邮箱+密码注册**：注册即可直接使用，无需邮箱验证邮件。MVP 先跑通流程。
- **手机号+验证码**：MVP 阶段暂时不做，后续阶段加入。AUTH-02 标记为 deferred。
- **密码重置**：使用 Supabase 内置的 forgot password 流程（邮件发送重置链接）。
- **统一登录页**：一个页面同时支持登录和注册，Tab 切换模式。
- **视觉风格**：简约实用风格，简洁表单+按钮，功能清晰。国内产品实用主义风格。MVP 阶段不投入过多设计资源。
- **路由组织**：`(auth)/` 路由分组，不影响 URL 路径。`/login`、`/register`、`/reset-password` 等页面放在 auth 分组下。
- **Supabase 集成**：`lib/supabase/` 模块 + Server Actions 方式。Next.js 官方推荐的 App Router 集成模式。
- **Session 持久化**：使用 Supabase 内置的 httpOnly cookie 存储 session。安全，XSS 防护，刷新页面自动恢复。
- **路由保护**：Next.js middleware 拦截未登录的受保护路由，重定向到 /login。Phase 1 阶段先把 middleware 框架搭好，后续阶段按需添加 protected 路由。

### Claude's Discretion
- (None explicitly marked -- all key decisions are locked)

### Deferred Ideas (OUT OF SCOPE)
- **手机号+验证码注册**：MVP 阶段不实现，等 Phase 2 或之后加入（需要阿里云短信等第三方服务）
- **品牌引导式登录页设计**：MVP 阶段用简约风格，后续可迭代为更有品牌感的设计
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | 用户可以用邮箱+密码注册账号 | `supabase.auth.signUp()` with email+password. When email confirmation is disabled in Supabase dashboard, signUp returns active session immediately. Client component form calls createBrowserClient().signUp() with error handling. |
| AUTH-02 | 用户可以用手机号+验证码注册账号 | DEFERRED per CONTEXT.md. Not in scope for Phase 1. |
| AUTH-03 | 用户登录后 session 在刷新后保持 | Supabase SSR httpOnly cookie pattern. Middleware calls `getUser()` on every request to refresh expired access tokens. createServerClient with getAll/setAll cookie handlers ensures session persists across page refresh. |
| AUTH-04 | 用户可以登出 | `supabase.auth.signOut()` via Server Action or browser client. Clears session cookies. Router redirect to /login after sign out. |
| AUTH-05 | 用户可以重置密码 | `supabase.auth.resetPasswordForEmail()` sends recovery email with link. User clicks link, redirected to `/update-password` page. New password set via Server Action with re-verified auth. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Email/password registration | Browser (client component) | API / Supabase Auth | signUp() runs in browser, Supabase Auth server validates and creates user |
| Email/password login | Browser (client component) | API / Supabase Auth | signInWithPassword() runs in browser, Supabase issues JWT session |
| Session persistence (cookies) | Frontend Server (middleware) | Browser | Middleware refreshes session via createServerClient, sets httpOnly cookies |
| Route protection | Frontend Server (middleware) | -- | middleware.ts intercepts requests before rendering, redirects unauthenticated |
| Password reset initiation | Browser (Server Action) | API / Supabase Auth | resetPasswordForEmail() triggered from client, Supabase sends email |
| Password reset completion | Browser (client component) | API / Supabase Auth | User clicks email link, Supabase redirects to update-password page |
| Sign out | Browser (client component) | Frontend Server | signOut() clears session in browser, middleware confirms cookie removal |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.5.15 | Full-stack React framework | Project locked decision; latest stable v15 |
| react | 19.2.5 | UI library | Paired with Next.js 15 |
| react-dom | 19.2.5 | React DOM renderer | Required for Next.js App Router |
| @supabase/ssr | 0.10.2 | SSR auth with cookie sessions | Official Supabase package for Next.js App Router; handles cookie chunking, Base64-URL encoding, session refresh |
| @supabase/supabase-js | 2.105.0 | Supabase client SDK | Core JS SDK; required by @supabase/ssr |
| tailwindcss | 4.2.4 | Utility-first CSS framework | Project locked decision; v4 uses @tailwindcss/postcss |
| @tailwindcss/postcss | 4.2.4 | Tailwind v4 PostCSS plugin | Required for Tailwind v4 in Next.js (replaces tailwind.config.js) |
| typescript | 5.x (bundled) | Type safety | Project locked decision |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| eslint-config-next | 15.5.15 | Next.js ESLint rules | Always -- linting for Next.js-specific patterns |
| @types/react | 19.x | React type definitions | Always -- TypeScript support |
| @types/react-dom | 19.x | React DOM type definitions | Always -- TypeScript support |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @supabase/ssr | Custom cookie middleware | @supabase/ssr handles cookie chunking for large sessions (>4KB), Base64 encoding, automatic refresh -- custom would be error-prone |
| Server Actions | API routes (/api/auth/*) | Server Actions are simpler for form submissions; API routes needed only for webhook callbacks |
| (auth)/ route group | Flat /app/login, /app/register | Route group keeps auth pages organized without affecting URL; flat is equivalent but less maintainable |

**Installation:**
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
npm install @supabase/ssr @supabase/supabase-js
```

**Version verification:**
- `next@15.5.15` -- published 2026-04, verified via `npm view next@15 version`
- `@supabase/ssr@0.10.2` -- verified via `npm view @supabase/ssr version`
- `@supabase/supabase-js@2.105.0` -- verified via `npm view @supabase/supabase-js version`
- `tailwindcss@4.2.4` -- verified via `npm view tailwindcss version`
- `@tailwindcss/postcss@4.2.4` -- verified via `npm view @tailwindcss/postcss version`
- `react@19.2.5` -- verified via `npm view react version`

## Architecture Patterns

### System Architecture Diagram

```
                    +-----------------------------------------------------+
                    |                    Browser                          |
                    |                                                     |
  User ----------->  |  (auth)/login page  <-- createBrowserClient        |
                    |  (Client Component)   --> signUp / signIn / signOut |
                    |                            |                        |
                    |                            v                        |
                    |  +------------------------------------------+       |
                    |  |  document.cookie (httpOnly, managed by   |       |
                    |  |  @supabase/ssr createBrowserClient)      |       |
                    |  +------------------------------------------+       |
                    +-----------------------------------------------------+
                                        |
                                        v (HTTP request with cookies)
                    +-----------------------------------------------------+
                    |              Next.js Middleware (Edge)               |
                    |                                                     |
                    |  createServerClient --> getAll cookies              |
                    |  supabase.auth.getUser() --> verify session         |
                    |  If unauthenticated + protected route --> redirect  |
                    |  setAll cookies on response (session refresh)       |
                    +-----------------------------------------------------+
                                        |
                                        v
                    +-----------------------------------------------------+
                    |              Next.js Server Components              |
                    |                                                     |
                    |  createServerClient (read cookies only, no set)     |
                    |  supabase.auth.getUser() --> display user info      |
                    +-----------------------------------------------------+
                                        |
                                        v
                    +-----------------------------------------------------+
                    |              Supabase Auth Server                   |
                    |                                                     |
                    |  JWT verification, session management,              |
                    |  email/password auth, password reset emails         |
                    +-----------------------------------------------------+
```

### Recommended Project Structure

```
hongyefang-mvp/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Auth route group (URL: /login, not /auth/login)
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Unified login/register page (Tab switch)
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx        # Password reset request page
│   │   │   └── update-password/
│   │   │       └── page.tsx        # Password update page (after email link)
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts        # Auth callback handler (email confirm, OAuth)
│   │   ├── dashboard/              # Protected route (Phase 2+)
│   │   │   └── page.tsx
│   │   ├── layout.tsx              # Root layout with font, metadata, Tailwind import
│   │   ├── page.tsx                # Landing page (redirects to /login or /dashboard)
│   │   └── globals.css             # Tailwind v4 directives + custom styles
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthTabs.tsx        # Tab switcher: Login / Register
│   │   │   ├── LoginForm.tsx       # Login form (email + password)
│   │   │   ├── RegisterForm.tsx    # Registration form (email + password)
│   │   │   ├── ResetPasswordForm.tsx  # Forgot password form
│   │   │   └── UpdatePasswordForm.tsx # New password form
│   │   └── ui/
│   │       ├── Button.tsx          # Reusable button component
│   │       ├── Input.tsx           # Reusable input component
│   │       └── Tabs.tsx            # Tab navigation component
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts           # createBrowserClient (client-side only)
│   │       ├── server.ts           # createServerClient (Server Components, Route Handlers)
│   │       └── middleware.ts       # createServerClient for middleware.ts
│   ├── hooks/
│   │   └── useAuth.ts              # Auth state hook (optional convenience)
│   └── middleware.ts               # Next.js middleware (route protection + session refresh)
├── .env.local                      # Environment variables (gitignored)
├── .env.local.example              # Template for required env vars
├── next.config.ts                  # Next.js configuration
├── postcss.config.mjs              # PostCSS config (Tailwind v4)
├── tsconfig.json                   # TypeScript configuration
└── package.json
```

### Pattern 1: Three-File Supabase SSR Setup

**What:** The canonical pattern for Supabase + Next.js App Router uses three client factories, each optimized for its runtime context.

**When to use:** Always for Next.js App Router + Supabase Auth with cookie-based sessions.

**Source:** [Context7 /supabase/ssr - createServerClient](https://context7.com/supabase/ssr/llms.txt)

```typescript
// lib/supabase/middleware.ts -- for middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session -- REQUIRED for Server Components to see valid session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user }
}
```

```typescript
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)

  // Protected routes (extend as phases progress)
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/login') ||
     request.nextUrl.pathname.startsWith('/reset-password'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

```typescript
// lib/supabase/server.ts -- for Server Components and Route Handlers
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Components cannot set cookies -- this is expected
            // Middleware handles cookie setting instead
          }
        },
      },
    }
  )
}
```

### Pattern 2: Server Actions for Auth Operations

**What:** Auth operations (sign in, sign out, reset password) run as Server Actions that re-verify auth before executing.

**Source:** [Context7 /vercel/next.js - data security](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/data-security.mdx)

```typescript
// app/(auth)/login/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
```

### Pattern 3: Browser Client for Interactive Forms

**What:** Client-side Supabase client for forms that need real-time feedback (register, login).

**Source:** [Context7 /supabase/ssr - Client-Side Authentication](https://context7.com/supabase/ssr/llms.txt)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// components/auth/RegisterForm.tsx (Client Component)
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      return
    }

    // With email confirmation disabled in Supabase dashboard,
    // signUp returns an active session -- redirect to dashboard
    router.push('/dashboard')
    router.refresh()
  }

  // ... render form
}
```

### Anti-Patterns to Avoid

- **Calling `getUser()` in Server Components without middleware session refresh:** Server Components can read cookies but cannot set them. If the session token is expired, `getUser()` returns null even though a valid refresh token exists. The middleware MUST call `getUser()` first to refresh the session, then the Server Component's `getUser()` succeeds.

- **Using `getSession()` for authorization decisions:** `getSession()` reads unverified data directly from cookies. The user object could be spoofed. Always use `getUser()` for authorization -- it contacts the Supabase Auth server to verify the JWT.

- **Server Actions without re-verifying auth:** Page-level auth checks do NOT extend to Server Actions. Each Server Action is a separate entry point and must independently verify authentication.

- **Tailwind v3 config pattern with Tailwind v4:** Tailwind v4 does NOT use `tailwind.config.js`. It uses CSS-first configuration with `@theme` directives in the CSS file and `@tailwindcss/postcss` as the PostCSS plugin.

- **Hardcoding Supabase URL in client code:** Always use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables. The anon key is safe for client-side use -- it has Row Level Security enforced.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session cookie management | Custom cookie parsing + JWT handling | `@supabase/ssr` createServerClient/createBrowserClient | Handles cookie chunking (>4KB sessions), Base64-URL encoding, automatic token refresh, cross-browser compatibility |
| Email/password auth | Custom auth endpoints + password hashing | Supabase Auth built-in signUp/signInWithPassword | Supabase handles bcrypt hashing, JWT generation, rate limiting, session management, password reset emails |
| Route protection | Client-side route guards or _app level checks | Next.js middleware with createServerClient | Middleware runs before rendering, protects against flash-of-unauthenticated-content, works with SSR |
| Password reset flow | Custom email sending + token generation | `supabase.auth.resetPasswordForEmail()` | Supabase handles secure token generation, email templating, expiration, redirect handling |
| Form validation | Manual DOM manipulation or custom validators | Native HTML5 validation + React state for error display | Keep it simple for MVP; add zod only when form complexity grows |

**Key insight:** Supabase Auth is a fully managed auth server. Building equivalent functionality (password hashing, JWT management, session persistence, email templating, rate limiting) would take weeks and introduce security risks.

## Common Pitfalls

### Pitfall 1: Session Lost on Page Refresh
**What goes wrong:** User logs in successfully, but refreshing the page logs them out.
**Why it happens:** The middleware did not call `getUser()` to refresh the session. Supabase access tokens expire quickly (default 1 hour), and the refresh token is stored in the cookie. Without calling `getUser()` in middleware, the cookie never gets refreshed with a new access token.
**How to avoid:** Always call `await supabase.auth.getUser()` in the middleware's `updateSession` function before returning the response. This triggers the token refresh and sets new cookies on the response.
**Warning signs:** Login works, but navigating to a protected route after refresh redirects to login.

### Pitfall 2: Server Components Cannot Set Cookies
**What goes wrong:** Auth Server Action runs successfully but the session cookie is not updated.
**Why it happens:** Next.js Server Components (including Route Handlers that use `cookies()`) can read cookies but cannot reliably set them in all cases. The cookie-setting must happen in middleware.
**How to avoid:** The middleware's `setAll` handler sets cookies on the response. Server Components use `try/catch` around `setAll` -- it's expected to fail in Server Components. The middleware handles the actual cookie persistence.
**Warning signs:** Auth action returns success, but subsequent requests show unauthenticated.

### Pitfall 3: Email Confirmation Still Enabled
**What goes wrong:** User registers but cannot log in immediately -- Supabase sends a confirmation email first.
**Why it happens:** Supabase dashboard has "Confirm email" enabled by default for email provider. The locked decision says registration should work immediately without email verification.
**How to avoid:** In Supabase Dashboard -> Authentication -> Providers -> Email, disable "Confirm email". This is a dashboard setting, not a code change.
**Warning signs:** signUp returns `user` but `session` is null; user must check email before first login.

### Pitfall 4: Tailwind v4 Config Confusion
**What goes wrong:** Following Tailwind v3 tutorials that use `tailwind.config.js` and `postcss.config.js` -- classes don't work.
**Why it happens:** Tailwind v4 replaced the JS config file with CSS-first configuration. It uses `@tailwindcss/postcss` instead of `tailwindcss` in PostCSS config, and `@import "tailwindcss"` instead of `@tailwind` directives.
**How to avoid:** Use `npx create-next-app` with `--tailwind` flag (automatically sets up v4). Verify `postcss.config.mjs` uses `@tailwindcss/postcss`.
**Warning signs:** `@tailwind base` shows "unknown at rule" error, or utility classes have no effect.

### Pitfall 5: Password Reset Redirect Not Configured
**What goes wrong:** User clicks password reset email link but gets redirected to Supabase default URL instead of your update-password page.
**Why it happens:** `resetPasswordForEmail` needs a `redirectTo` option pointing to your app's update-password route. Also, the redirect URL must be in Supabase's allowed redirect list.
**How to avoid:** Set `redirectTo: \`${window.location.origin}/update-password\`` in the reset call. Add `/update-password` to Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs.
**Warning signs:** Password reset email sends successfully, but clicking link goes to the wrong page.

## Code Examples

Verified patterns from official sources:

### Email/Password Sign In
```typescript
// Source: Context7 /supabase/supabase - Sign In User with Email and Password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password-123',
})
```

### Email/Password Sign Up (with auto-confirm)
```typescript
// Source: Context7 /supabase/ssr - Client-Side Authentication
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

### Sign Out
```typescript
// Source: Context7 /supabase/ssr - Client-Side Authentication
const { error } = await supabase.auth.signOut()
if (error) {
  console.error('Sign out error:', error.message)
}
// Session cookies cleared automatically by createBrowserClient
window.location.href = '/login'
```

### Password Reset
```typescript
// Source: Context7 /supabase/supabase - Initiate Password Reset by Email
const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/update-password`,
})
```

### Auth State Listener
```typescript
// Source: Context7 /supabase/ssr - Client-Side Authentication
supabase.auth.onAuthStateChange((event, session) => {
  switch (event) {
    case 'SIGNED_IN':
      // Navigate to dashboard
      break
    case 'SIGNED_OUT':
      // Navigate to login
      break
    case 'TOKEN_REFRESHED':
      // Session refreshed silently -- no action needed
      break
  }
})
```

### Middleware Route Protection
```typescript
// Source: Context7 /vercel/next.js - Route Protection and Redirection
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` (deprecated) | `@supabase/ssr` | 2024 | auth-helpers is deprecated; @supabase/ssr is the official replacement with better cookie handling |
| `pages/_app.js` with `useSession` | `middleware.ts` + `createServerClient` + Server Components | Next.js 13+ App Router | Server-first auth with cookie-based sessions, no client-side flash |
| `tailwind.config.js` | CSS-first config with `@theme` + `@tailwindcss/postcss` | Tailwind v4 (2024) | No JS config file needed; configuration lives in CSS |
| API routes for auth (`/api/auth/*`) | Server Actions (`'use server'`) | Next.js 14+ | Simpler form handling, no API route boilerplate |
| `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` | Tailwind v4 | Single import replaces three directives |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Deprecated since mid-2024. Do not install. Use `@supabase/ssr`.
- `tailwind.config.js`: Not used in Tailwind v4. Configuration is CSS-first.
- `pages/` directory: App Router (`app/`) is the standard. Avoid Pages Router for new projects.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Next.js `create-next-app --tailwind` sets up Tailwind v4 automatically with `@tailwindcss/postcss` | Standard Stack, Pitfall 4 | [ASSUMED] -- If it still defaults to v3, need manual v4 setup |
| A2 | Supabase dashboard "Confirm email" toggle disables email confirmation for sign-up | Pitfall 3 | [ASSUMED] -- If the setting moved or renamed, need to find current location |
| A3 | `create-next-app` with `--src-dir` creates `src/app/` structure | Project Structure | [ASSUMED] -- Standard behavior but should verify |

## Open Questions (RESOLVED)

1. **Supabase project email confirmation setting** [RESOLVED]
   - What we know: Supabase has a dashboard toggle to disable email confirmation for the Email provider
   - Resolution: Supabase Dashboard -> Authentication -> Providers -> Email -> toggle off "Confirm email". This is confirmed in the current Supabase docs. Plan 01 user_setup includes this step explicitly.
   - Action: Executor will follow the user_setup steps in Plan 01 to disable this during project setup.

2. **Supabase redirect URL allowlist** [RESOLVED]
   - What we know: Password reset `redirectTo` URLs must be in Supabase's allowed redirect list
   - Resolution: By default, Supabase allows `http://localhost:*` and `https://localhost:*` for development. Production URLs must be explicitly added in Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs. For MVP, add the Vercel production URL after deployment.
   - Action: Plan 01 user_setup includes adding redirect URLs; executor will guide user through this during setup.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js runtime | ✓ | v25.8.2 | -- |
| npm | Package management | ✓ | 11.11.1 | -- |
| Supabase project | Auth backend | ✗ | -- | Must create at supabase.com before running app |
| Vercel account | Production deploy | ✗ | -- | Can run locally with `npm run dev`; deploy later |
| PostgreSQL (local) | NOT required | -- | -- | Supabase provides managed Postgres |

**Missing dependencies with no fallback:**
- **Supabase project**: Must create a Supabase project at supabase.com before the app can function. Need `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. No local fallback for Supabase Auth.

**Missing dependencies with fallback:**
- **Vercel deployment**: Not needed for development. `npm run dev` works locally. Deploy when Phase 1 is verified.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Not yet installed -- see Wave 0 Gaps |
| Config file | none -- see Wave 0 |
| Quick run command | TBD after framework selection |
| Full suite command | TBD after framework selection |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | User can register with email+password | E2E | TBD | ❌ Wave 0 |
| AUTH-02 | Phone auth | N/A (deferred) | -- | -- |
| AUTH-03 | Session persists after refresh | E2E | TBD | ❌ Wave 0 |
| AUTH-04 | User can sign out | E2E | TBD | ❌ Wave 0 |
| AUTH-05 | User can reset password | E2E | TBD | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** TBD
- **Per wave merge:** TBD
- **Phase gate:** Manual verification of auth flows (sign up -> sign in -> session persists -> sign out -> reset password)

### Wave 0 Gaps
- [ ] Test framework selection and installation (Playwright recommended for E2E auth flows)
- [ ] E2E test: AUTH-01 registration flow
- [ ] E2E test: AUTH-03 session persistence
- [ ] E2E test: AUTH-04 sign out
- [ ] E2E test: AUTH-05 password reset (requires Supabase test email handling)

**Note:** This is a greenfield Phase 1 scaffolding phase. Test infrastructure should be set up in Wave 0 before implementing auth features. Given the auth-heavy nature of this phase, E2E tests (Playwright) carry more signal than unit tests for the core user flows.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Supabase Auth (email/password) |
| V3 Session Management | yes | Supabase httpOnly cookies via @supabase/ssr |
| V4 Access Control | yes | Next.js middleware route protection |
| V5 Input Validation | yes | HTML5 form validation + React state for error messages |
| V6 Cryptography | yes | Supabase handles bcrypt hashing, JWT signing -- never hand-roll |

### Known Threat Patterns for Next.js + Supabase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via user input rendering | Spoofing | React auto-escapes JSX; avoid dangerouslySetInnerHTML |
| Session cookie theft | Information Disclosure | httpOnly, Secure, SameSite cookies -- Supabase SSR handles this |
| CSRF on form submissions | Tampering | Supabase uses JWT tokens, not cookie-only auth; SameSite=lax by default |
| Unauthorized Server Action execution | Tampering | Re-verify auth in each Server Action body (not just page level) |
| Session fixation | Spoofing | Supabase generates new session on sign in, invalidates old |
| Password brute force | Tampering | Supabase Auth has built-in rate limiting on sign-in attempts |

## Sources

### Primary (HIGH confidence)
- Context7 `/supabase/ssr` -- createServerClient, createBrowserClient, cookie management, session refresh patterns
- Context7 `/supabase/supabase` -- signUp, signInWithPassword, resetPasswordForEmail, signOut API patterns
- Context7 `/vercel/next.js` -- App Router middleware, Server Actions, route protection, environment variables, Tailwind CSS setup
- Context7 `/supabase/auth` -- Auth API reference, /verify endpoint, OAuth callback handling
- npm registry -- Package versions verified via `npm view`

### Secondary (MEDIUM confidence)
- Supabase SSR design document (GitHub: supabase/ssr/docs/design.md) -- setAll behavior, SSR pattern rationale

### Tertiary (LOW confidence)
- Supabase dashboard UI paths for email confirmation toggle -- [ASSUMED A2] based on training data; dashboard may have changed

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified via npm registry, patterns verified via Context7
- Architecture: HIGH -- patterns from official Supabase SSR docs and Next.js official docs
- Pitfalls: HIGH-MEDIUM -- cookie/session pitfalls verified via Supabase SSR design docs; email confirmation dashboard path is ASSUMED

**Research date:** 2026-04-27
**Valid until:** 2026-05-27 (30 days -- Next.js 15 and Supabase SSR are stable; Tailwind v4 API is stable)

# Phase 1 Context: 基础搭建 — 项目脚手架 + 用户认证

**Date:** 2026-04-27
**Phase:** 1
**Status:** Context gathered

## Domain

搭建 Next.js + Supabase 项目脚手架，实现用户注册登录能力（邮箱+密码），为后续阶段提供认证基础设施。

## Decisions

### 认证策略

- **邮箱+密码注册**：注册即可直接使用，无需邮箱验证邮件。MVP 先跑通流程。
- **手机号+验证码**：MVP 阶段暂时不做，后续阶段加入。AUTH-02 标记为 deferred。
- **密码重置**：使用 Supabase 内置的 forgot password 流程（邮件发送重置链接）。
- **手机号 AUTH-02 延期原因**：Supabase Phone OTP 在中国不可用，需要第三方短信服务，MVP 阶段成本不值得。

### 登录 UI

- **统一登录页**：一个页面同时支持登录和注册，Tab 切换模式。
- **视觉风格**：简约实用风格，简洁表单+按钮，功能清晰。国内产品实用主义风格。MVP 阶段不投入过多设计资源。

### 项目目录结构

- **路由组织**：`(auth)/` 路由分组，不影响 URL 路径。`/login`、`/register`、`/reset-password` 等页面放在 auth 分组下。
- **Supabase 集成**：`lib/supabase/` 模块 + Server Actions 方式。Next.js 官方推荐的 App Router 集成模式。

### Session 与安全策略

- **Session 持久化**：使用 Supabase 内置的 httpOnly cookie 存储 session。安全，XSS 防护，刷新页面自动恢复。
- **路由保护**：Next.js middleware 拦截未登录的受保护路由，重定向到 /login。Phase 1 阶段先把 middleware 框架搭好，后续阶段按需添加 protected 路由。

## Canonical Refs

- `.planning/ROADMAP.md` — Phase 1 目标和成功标准
- `.planning/REQUIREMENTS.md` — AUTH-01 至 AUTH-05 需求定义
- `.planning/PROJECT.md` — 项目上下文和技术栈约束

## Code Context

- **Greenfield project** — 无现有代码，仅 CLAUDE.md 和 .planning/ 存在
- **Tech stack locked**：Next.js 15 (App Router), React 19, Tailwind CSS 4, TypeScript, Supabase

## Deferred Ideas

- **手机号+验证码注册**：MVP 阶段不实现，等 Phase 2 或之后加入（需要阿里云短信等第三方服务）
- **品牌引导式登录页设计**：MVP 阶段用简约风格，后续可迭代为更有品牌感的设计
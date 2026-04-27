# Phase 1 Discussion Log: 基础搭建 — 项目脚手架 + 用户认证

**Date:** 2026-04-27

## Area: Supabase 认证策略

### Q1: 邮箱认证
- Options: 直接邮箱+密码（无需验证） / 邮箱+密码 + 邮件验证 / 不做邮箱，只做手机
- Selected: **直接邮箱+密码（无需验证邮件）**
- Rationale: MVP 先跑通流程，国内邮箱验证邮件送达率低

### Q2: 手机认证
- Options: 阿里云短信服务 / Supabase Phone OTP / 暂时不做，后续再加
- Selected: **暂时不做，后续再加**
- Rationale: Supabase Phone OTP 在中国不可用，第三方短信需要额外开发和成本

### Q3: 密码重置
- Options: Supabase 内置密码重置 / 通过手机号验证码重置
- Selected: **Supabase 内置密码重置**
- Rationale: Supabase 内置支持，邮箱虽然送达率可能有问题但功能现成

## Area: 登录 UI 风格

### Q1: 登录页面布局
- Options: 统一登录页 / 分开的登录和注册页 / 极简式一键登录入口
- Selected: **统一登录页**
- Rationale: 简洁、统一入口，用户认知负担最小

### Q2: 视觉风格
- Options: 实用主义，简约风格 / 品牌引导式（带文案+品牌色） / 现代玻璃拟风（高设计感）
- Selected: **实用主义，简约风格**
- Rationale: MVP 阶段功能优先，不投入过多设计资源

## Area: 项目目录结构

### Q1: 路由结构
- Options: (auth)/ 路由分组 / /auth/login 等独立路径 / 扁平结构，/login 在根目录
- Selected: **(auth)/ 路由分组**
- Rationale: Next.js App Router 推荐模式，不影响 URL

### Q2: Supabase 集成
- Options: lib/supabase/ 模块 / api/ 路由层直接调用 / 直接写 ORM 层
- Selected: **lib/supabase/ 模块**
- Rationale: Next.js + Supabase 官方推荐的 App Router 集成方式

## Area: Session 与安全策略

### Q1: Session 持久化
- Options: Supabase 内置 Cookie / 自定义 client-side state
- Selected: **Supabase 内置 Cookie**
- Rationale: httpOnly cookie 安全，XSS 防护，刷新自动恢复

### Q2: 安全防护
- Options: Next.js middleware 路由保护 / 页面级 client-side 检查
- Selected: **Next.js middleware 路由保护**
- Rationale: 服务端防护，Phase 1 先搭框架，后续阶段按需添加

## Deferred Ideas

- 手机号+验证码注册：MVP 阶段不实现，等后续阶段加入
- 品牌引导式登录页设计：后续可迭代为更有品牌感的设计
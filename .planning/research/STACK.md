# Stack Research: AI 创业咨询平台

## Recommended Stack

### Frontend
- **Next.js 15** (App Router) — SSR + API routes, 单一框架覆盖全栈需求
- **React 19** — 最新稳定版
- **Tailwind CSS 4** — 快速迭代 UI，MVP 阶段实用优先
- **TypeScript** — 类型安全

### Backend / BaaS
- **Supabase** — PostgreSQL + Auth + Storage + Realtime
  - Auth: 邮箱+密码 + 手机+验证码（通过第三方或自建）
  - Database: PostgreSQL 关系型存储（用户、咨询订单、评估结果）
  - Storage: 用户头像、资料文档

### AI Integration
- **OpenAI API (GPT-4o-mini)** 或 **Claude API** — 成本可控的对话式 AI
- 使用 Server Actions 或 API Route 封装 AI 调用逻辑
- System Prompt 中定义创业体检角色和参数收集逻辑

### Payment
- **微信支付 Native** — 扫码支付
- **支付宝当面付** — 扫码支付
- MVP 可先用支付沙箱环境测试

### Deployment
- **Vercel** — Next.js 原生部署
- **Supabase Cloud** — 数据库和认证托管

## What NOT to Use
- 自建 auth 系统 — Supabase 已覆盖
- 自建支付系统 — 接入现成 SDK
- GraphQL/Apollo — MVP 阶段过重，REST + Supabase 足够

## Confidence Levels
- Stack choice: HIGH — 当前最成熟的快速验证方案
- AI integration: HIGH — LLM API 是行业标准做法
- Payment: MEDIUM — 具体支付通道选择需根据商户资质调整

---
*Research: 2026-04-27*

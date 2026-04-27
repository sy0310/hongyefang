# Research Summary: 红叶坊 创业咨询平台

## Stack
Next.js 15 + Supabase (PostgreSQL + Auth + Storage) + OpenAI/Claude API + 微信/支付宝支付。Vercel 部署。

## Table Stakes
- 用户注册登录（手机+验证码、邮箱+密码）
- AI 对话式创业体检（4项核心参数收集）
- AI 评估结果展示
- 咨询价格展示 + 支付入口
- 支付成功后转接流程

## Watch Out For
- AI 对话不要过度追问（限≤3轮）
- 支付资质审批可能耗时，先用沙箱
- Supabase 短信中国区支持有限
- AI 不给具体创业建议，只做评估
- 从第一天开始埋点追踪漏斗转化

---
*Synthesized: 2026-04-27*

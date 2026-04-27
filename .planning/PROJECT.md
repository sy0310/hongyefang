# 红叶坊 (hongyefang) — 创业咨询平台

## What This Is

一个面向个人创业者（ToC）的创业咨询服务漏斗平台。通过 AI 对话系统收集用户画像、评估创业适配度，筛选出优质客户后引导至人工咨询服务。平台同时整合服务商（To Small B）和品牌方（To Big B），形成从评估、咨询到落地的全链路服务体系。

## Core Value

AI 精准筛选优质创业用户，降低无效沟通成本，让有价值的创业咨询高效匹配。

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 用户注册登录（手机+验证码、邮箱+密码）
- [ ] AI 创业体检对话系统 — 收集用户画像（弹性资金、投入时间、预期回报、投入金额）
- [ ] AI 筛选逻辑 — 识别过滤"许愿型"用户（资金少但预期高）
- [ ] 用户画像结果展示 — 呈现评估结论
- [ ] 人工咨询服务展示 — 价格展示（2999 元至数万元）
- [ ] 付费咨询入口 — 微信支付 + 支付宝集成
- [ ] 支付完成转接流程 — 用户付费后专员对接

### Out of Scope

- DIY 资料交付（阶段3） — MVP 先验证漏斗前两层
- 全权托管服务（阶段4） — 需要人工运营能力，后期接入
- 代运营服务（阶段5） — 依赖托管服务先跑通
- 股东匹配拼单功能 — 需要更多用户基数，后期迭代
- 服务商入驻平台（To Small B） — 需要 C 端验证后再拓展
- 品牌推荐分成（To Big B） — 需要项目落地数据

## Context

- 目标市场：中国境内个人创业者
- 服务漏斗模型：五级漏斗（AI 体检 → 人工咨询 → DIY 资料 → 全权托管 → 代运营）
- MVP 聚焦前两层：验证 AI 筛选 + 付费咨询转化
- 支付：微信支付 + 支付宝双通道
- 产品策略：功能优先，实用为先，"Learning by doing" 迭代优化

## Constraints

- **[Tech Stack]**: Next.js + Supabase — 快速验证，全栈一体化
- **[Platform]**: Web 端 — 优先浏览器访问
- **[AI]**: LLM API 集成（Claude/OpenAI） — 自定义 system prompt 实现创业体检逻辑
- **[Auth]**: 手机+验证码 + 邮箱+密码 — 兼顾国内用户习惯和灵活性
- **[Payment]**: 微信支付 + 支付宝 — MVP 需要接入真实支付验证转化路径

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| MVP 仅做阶段1+2（AI体检+咨询付费） | 先验证漏斗效率和用户筛选逻辑 | — Pending |
| 真实支付接入 MVP | 验证付费转化率和商业模式可行性 | — Pending |
| Next.js + Supabase 技术栈 | 全栈框架 + BaaS，最小开发量快速上线 | — Pending |
| AI 交互控制对话深度 | 预设参数追问但避免过度追问导致用户流失 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-27 after initialization*

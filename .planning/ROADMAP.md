# Roadmap: 红叶坊 (hongyefang)

## Phase 1: 基础搭建 — 项目脚手架 + 用户认证

**Goal:** 搭建 Next.js + Supabase 项目，实现用户注册登录能力。
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Plans:** 4/4 plans complete

Plans:
- [x] 01-01-PLAN.md — Project scaffold + Supabase SSR three-file infrastructure
- [x] 01-02-PLAN.md — Auth Server Actions (login, register, logout) + callback route
- [x] 01-03-PLAN.md — Auth UI components + pages (/login, /reset-password, /update-password, /dashboard)
- [x] 01-04-PLAN.md — Root layout metadata + home page auth-based redirect

### Success Criteria
1. 用户可以用邮箱+密码注册并登录
2. 用户可以用手机号+验证码注册并登录 (DEFERRED to later phase)
3. 登录后刷新页面 session 保持
4. 用户可以正常登出
5. 项目可以在本地和 Vercel 上运行

---

## Phase 2: AI 创业体检 — 对话系统

**Goal:** 实现 AI 对话式创业体检，收集用户四项核心参数。
**Requirements:** CHAT-01, CHAT-02, CHAT-03, CHAT-04
**Plans:** 5 plans

Plans:
- [ ] 02-01-PLAN.md — Supabase database tables (assessments + chat_messages) with RLS policies
- [ ] 02-02-PLAN.md — Core library: types, state machine with follow-up guard, Zod validation, mock AI responses
- [ ] 02-03-PLAN.md — Chat UI components (MessageBubble, ParameterCard, ChatInput) + dashboard entry button
- [ ] 02-04-PLAN.md — Streaming API route handler with mock responses and follow-up limit awareness
- [ ] 02-05-PLAN.md — AssessmentChat container + pages + session resume + chat_messages batch save

### Success Criteria
1. 用户可以从登录页进入 AI 对话体检
2. 对话界面流畅，消息发送/接收无延迟
3. AI 成功收集四项参数（弹性资金、投入时间、预期回报、投入金额）
4. 对话追问不超过 3 轮
5. 对话过程中用户可以随时退出

---

## Phase 3: 评估引擎 — 画像生成 + 结果展示

**Goal:** 实现筛选逻辑和评估结果展示页面。
**Requirements:** EVAL-01, EVAL-02, EVAL-03, RESULT-01, RESULT-02
**Plans:** 3 plans in 2 waves

Plans:
- [x] 03-01-PLAN.md — Foundation: migration, deps, types, scoring engine + unit tests (Wave 1)
- [x] 03-02-PLAN.md — Backend: extended completeAssessment + DeepSeek narrative (Wave 2)
- [x] 03-03-PLAN.md — UI: result page components + page + loading skeleton (Wave 2)

### Success Criteria
1. AI 根据参数生成适配度评分
2. "许愿型"用户被自动识别标记
3. 用户画像数据保存到 Supabase
4. 用户能看到评估结果页
5. 评估结果使用正面话术包装

---

## Phase 4: 付费转化 — 咨询展示 + 支付集成

**Goal:** 实现咨询套餐展示、模拟支付流程、支付后转接流程。（微信支付/支付宝真实接入延后至后续 Phase，见 D-03）
**Requirements:** CONSULT-01, CONSULT-02, PAY-03, PAY-04
**Plans:** 3 plans in 2 waves

Plans:
- [x] 04-01-PLAN.md — Foundation: orders migration, types, createOrder/getOrder Server Actions (Wave 1)
- [x] 04-02-PLAN.md — ResultCTA tier-based differentiation + /payment-success confirmation page (Wave 2)
- [x] 04-03-PLAN.md — /consult pricing page: PricingCard, PaymentModal, simulated payment flow (Wave 2)

### Success Criteria
1. 评估结果页清晰展示咨询套餐和价格
2. 用户可以选择套餐并通过模拟支付完成下单（微信/支付宝真实接入延后）
3. 支付成功后展示专员对接页面
4. 后台可查询支付订单状态

---

## Phase 5: 合伙人智能匹配 — 互补资源配对系统

**Goal:** 用户完成体检后可主动进入合伙人匹配池，系统基于六维评估数据计算互补度，为用户推荐互补型合伙人，用户可提交合作意向，由管理员人工审核后牵线。
**Requirements:** MATCH-01, MATCH-02, MATCH-03, MATCH-04, MATCH-05
**Plans:** Complete

### Requirements

- MATCH-01: 用户可选择加入或退出合伙人匹配池，并填写项目描述（≤200字）
- MATCH-02: 匹配池展示脱敏合伙人资料（无姓名/邮箱，显示评级+资源标签+项目简介）
- MATCH-03: 系统使用资源互补算法排序（资金互补 40%、时间互补 40%、经验协同 20%）
- MATCH-04: 用户可对感兴趣的合伙人提交"发起连接"，状态进入 pending 等待管理员处理
- MATCH-05: 同一对用户只能提交一次连接申请（唯一约束）

### Success Criteria

1. 用户从 /result 页面可一键进入合伙人匹配池（填写项目描述后确认加入）
2. /match 页面展示最多 10 个互补型合伙人卡片，按互补度排序
3. 卡片不显示任何 PII，只显示评级、资源标签、项目简介片段
4. 点击"发起连接"后按钮变为"已申请"，不可重复提交
5. 退出匹配池后从候选列表中消失（is_active = false）

# Roadmap: 红叶坊 (hongyefang)

## Phase 1: 基础搭建 — 项目脚手架 + 用户认证

**Goal:** 搭建 Next.js + Supabase 项目，实现用户注册登录能力。
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Plans:** 4 plans

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

### Success Criteria
1. AI 根据参数生成适配度评分
2. "许愿型"用户被自动识别标记
3. 用户画像数据保存到 Supabase
4. 用户能看到评估结果页
5. 评估结果使用正面话术包装

---

## Phase 4: 付费转化 — 咨询展示 + 支付集成

**Goal:** 实现咨询套餐展示、微信支付/支付宝接入、支付后转接流程。
**Requirements:** CONSULT-01, CONSULT-02, PAY-01, PAY-02, PAY-03, PAY-04

### Success Criteria
1. 评估结果页清晰展示咨询套餐和价格
2. 用户可以选择套餐并通过微信支付完成付款
3. 用户可以选择套餐并通过支付宝完成付款
4. 支付成功后展示专员对接页面
5. 后台可查询支付订单状态

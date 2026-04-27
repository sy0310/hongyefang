# Phase 2: AI 创业体检 — 对话系统 - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

实现 AI 对话式创业体检，收集用户四项核心参数（年度弹性资金、每周投入时间、预期年化回报、投入金额）。用户可以从 Dashboard 入口进入，对话完成后跳转到结果页。成功标准：用户可从登录页进入体检、对话流畅无延迟、AI 成功收集四项参数、追问不超过 3 轮、用户可随时退出并保留进度。

</domain>

<decisions>
## Implementation Decisions

### AI Provider
- AI 模型接入**暂不实现**，Phase 2 先搭建对话系统基础设施（聊天 UI、状态管理、数据持久化、流式框架），AI Provider 接入留到后续阶段添加
- Phase 2 可以使用模拟/mock AI 回复来跑通完整流程
- Claude's Discretion：AI Provider SDK 选型、API 路由结构设计、prompt 编写

### Chat UI — 混合模式
- 整体聊天风格，关键参数用结构化卡片展示，兼顾自然对话和参数清晰度
- 参数卡片**内嵌在消息流中**，AI 消息后紧跟当前待填参数卡片，用户填写后卡片收起变为已填状态，继续下一项
- AI 回复使用**流式逐字显示**（打字动画）
- Claude's Discretion：具体卡片样式、颜色、动画细节

### Flow Control — 状态机 + AI 自动引导
- 使用状态机定义 4 个参数收集状态，AI 在每个状态下负责追问和话术润色
- AI 根据用户回答**灵活调整**提问顺序，但保证 4 项都收集完
- **轮数计数规则**：仅额外追问计入轮数限制（最多一次追问），4 项参数的主要提问不计入
- Claude's Discretion：状态机具体实现细节、system prompt 内容、追问话术

### Data Storage — 实时 + 结束统一保存
- 新建 `assessments` Supabase 表，每次体检创建一条记录
- **参数实时保存**：每收集一个参数就更新 assessment 记录，防止用户中断导致数据丢失
- **对话历史**：前端暂存，对话结束时统一保存到 `chat_messages` 表（message, role, timestamp）
- Claude's Discretion：表结构详细字段名、索引设计

### Entry/Exit
- Dashboard 增加「开始创业体检」入口按钮，点击跳转到评估页面
- 收集完成自动**跳转到结果页**（/assessment/result），Phase 2 先做简单完成页/placeholder
- **随时退出**：支持浏览器返回 + 自动保存已填参数到 Supabase，下次可以恢复对话
- Claude's Discretion：返回按钮 UI 位置、恢复对话的交互提示

### Streaming
- AI 流式回复使用 **API Route + Edge streaming** 方式
- API route 调用 AI SDK，Edge runtime + ReadableStream 实现流式响应，前端逐块读取显示
- Claude's Discretion：Edge runtime 具体配置、前端 streaming 客户端实现

</decisions>

<specifics>
## Specific Ideas

- 对话界面整体风格参考微信/WhatsApp，但关键参数用结构化卡片展示
- 参数卡片在消息流中内联显示，不是侧边面板
- 支持中断恢复，类似填表单到一半关掉再打开继续
- AI 提问顺序灵活，类似真人对话的自然流程
</specifics>

<canonical_refs>
## Canonical References

### Phase requirements
- `.planning/ROADMAP.md` §Phase 2 — Phase 2 目标和成功标准
- `.planning/REQUIREMENTS.md` — CHAT-01 至 CHAT-04 需求定义
- `.planning/phases/01-基础搭建/01-CONTEXT.md` — Phase 1 决策（Supabase SSR、项目结构、认证策略）

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/Button.tsx` — Button 组件（primary/secondary/ghost variants），可用于聊天输入框发送按钮、退出按钮等
- `src/components/ui/Input.tsx` — Input 组件，可用于参数卡片的表单字段
- `src/components/ui/Tabs.tsx` — Tabs 组件，Phase 1 登录页使用，聊天页面可能不需要
- `src/lib/supabase/server.ts` — Supabase SSR server client，用于 Server Actions 和 API Routes
- `src/lib/supabase/client.ts` — Supabase SSR browser client，用于客户端数据库操作（参数实时保存）

### Established Patterns
- Next.js 16 App Router + Supabase SSR 三文件模式已建立
- 组件风格：简约实用，Tailwind CSS 4
- Dashboard 页面已有占位文本，需要替换为实际入口

### Integration Points
- `src/app/dashboard/page.tsx` — 需要添加「开始创业体检」按钮
- `src/app/layout.tsx` — 根布局，新页面将共享
- Supabase 需要新建 `assessments` 和 `chat_messages` 表（Phase 3 前完成）

</code_context>

<deferred>
## Deferred Ideas

- **AI Provider 接入**（OpenAI/Claude/国内模型）— 后续阶段添加，Phase 2 用 mock 回复
- **手机号+验证码注册** — Phase 1 已延期，等后续加入
- **评估结果页完整实现** — Phase 3 负责
- **咨询套餐展示和支付** — Phase 4 负责

</deferred>

---

*Phase: 02-ai*
*Context gathered: 2026-04-27*

# Phase 4: 付费转化 — 咨询展示 + 支付集成 - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 在 Phase 3 结果页基础上，增加咨询套餐展示、模拟支付流程、支付后对接页，以及简化订单记录。MVP 阶段支付先做 UI 占位（模拟支付），后续接入真实微信支付/支付宝。

交付物：
1. 三档咨询套餐内容定义（标准版/专业版/旗舰版）
2. `/consult` 独立套餐展示页面
3. 模拟支付弹窗 + Supabase orders 表
4. `/payment-success` 对接确认页
5. ResultCTA 按钮按等级差异化（取代 mailto 占位符）

</domain>

<decisions>
## Implementation Decisions

### 套餐设计

- **D-01:** 三档套餐，按问题复杂度区分。价格梯度：标准版 ~2999元 / 专业版 ~6999元 / 旗舰版 ~14999元。
- **D-02:** 标准版 = 基础诊断（适合初创想法验证），专业版 = 深度方案（适合有方向的创业者），旗舰版 = 全流程陪跑（适合需要全面辅导的创业者）。具体服务内容由 Claude 设计，用户 review。

### 支付策略

- **D-03:** MVP 阶段支付先做 **UI 占位（模拟支付）**，不接入真实微信支付/支付宝。后续 Phase 再替换为聚合支付（Ping++/Stripe）。
- **D-04:** 模拟支付流程：用户选择套餐 → 点击支付 → 模拟支付确认弹窗 → 写入 orders 表 → 跳转 `/payment-success`。

### 套餐展示位置

- **D-05:** 咨询套餐在**独立页面 `/consult`** 展示（不在结果页内嵌）。Phase 3 的 ResultCTA 按钮点击后跳转到 `/consult`。

### CTA 按钮差异化

- **D-06:** 结果页 CTA 按钮按等级变更：
  - **高度适配 / 中度适配**：「查看咨询方案」→ 跳转 `/consult`，正面引导。
  - **需要准备**（含许愿型）：「当前阶段您可能需要更多准备，但我们仍可提供付费咨询服务」→ 温和告知，不强制推荐，但仍可跳转 `/consult`。
  - 许愿型额外附注：告知当前判定不适合创业，但咨询仍然开放。

### 支付后对接页

- **D-07:** `/payment-success` 为**简洁确认式静态页**：支付成功图标 + 订单编号 + 套餐名称 + 金额 + "我们将在24小时内联系您" + 专员微信二维码。

### 订单管理

- **D-08:** 创建简化 `orders` 表（Supabase migration），字段：`id`, `user_id`, `plan_name` (text), `amount` (integer), `status` (text, 默认 'completed'), `created_at`。通过 Supabase Dashboard 直接查看订单。模拟支付也写入记录。

### Claude's Discretion

- 三档套餐具体名称、描述、服务内容设计
- `/consult` 页面布局和套餐卡片 UI
- 模拟支付弹窗 UI 设计
- `/payment-success` 页面具体视觉呈现
- `orders` 表完整 schema 和 RLS 策略
- ResultCTA 组件修改方式（保留现有组件 vs 重写）
- 许愿型/需要准备等级的 CTA 精确文案

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 需求与目标
- `.planning/ROADMAP.md` §Phase 4 — Phase 4 目标、成功标准（CONSULT-01 → PAY-04）
- `.planning/REQUIREMENTS.md` — CONSULT-01、CONSULT-02、PAY-01、PAY-02、PAY-03、PAY-04 需求定义

### 先前阶段决策
- `.planning/phases/03-评估引擎/03-CONTEXT.md` — Phase 3 结果页 3-band 布局、ResultCTA 组件、CTA 文案策略（D-06/D-07/D-08）
- `.planning/phases/03-评估引擎/03-RESEARCH.md` — Next.js 16 Server Component 模式、Supabase migration 模式
- `.planning/phases/02-ai/02-CONTEXT.md` — Phase 2 assessments 表结构、Server Action 模式
- `.planning/phases/01-基础搭建/01-CONTEXT.md` — Phase 1 Supabase SSR 三文件模式、认证策略

### UI 设计合约
- `.planning/phases/03-评估引擎/03-UI-SPEC.md` — Phase 3 设计系统（间距、颜色、字体、组件模式），Phase 4 需保持一致

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/result/ResultCTA.tsx` — Phase 3 CTA 按钮组件（mailto 占位），Phase 4 需修改为跳转 `/consult` 并实现等级差异化文案
- `src/app/(chat)/result/page.tsx` — Phase 3 结果页 Server Component（3-band 布局），Phase 4 需修改 CTA 行为
- `src/components/ui/Button.tsx` — Button 组件（primary/secondary/ghost variants），用于套餐卡片和支付按钮
- `src/lib/supabase/server.ts` — Supabase SSR server client，用于 `/consult` Server Component
- `src/types/assessment.ts` — Tier 类型定义（高度适配/中度适配/需要准备），Phase 4 CTA 差异化依据

### Established Patterns
- **Next.js 16 App Router + Supabase SSR 三文件模式**已建立
- **Server Actions** 模式已用于 `completeAssessment`，Phase 4 可复用同一模式写订单
- **Tailwind CSS 4** — 无额外 UI 库，纯 utility class 方案
- **Supabase Migration** — 已有 004 号 migration 模式，Phase 4 新增 005

### Integration Points
- `src/app/(chat)/result/page.tsx` — 结果页 CTA 按钮是 Phase 4 的入口
- `src/components/result/ResultCTA.tsx` — CTA 组件需修改 props 和跳转逻辑
- `/consult` — Phase 4 新增路由
- `/payment-success` — Phase 4 新增路由

</code_context>

<specifics>
## Specific Ideas

- 套餐卡片可参考常见 SaaS 定价页三列布局，突出推荐方案（专业版）
- 模拟支付弹窗：简单的确认对话框，显示套餐名 + 金额 + 确认按钮
- 对接页参考：微信支付成功页风格 —— 绿色勾号 + 金额 + 订单号
- 许愿型 CTA 文案温和但不失诚实，参考 Phase 3 的 D-07 话术策略

</specifics>

<deferred>
## Deferred Ideas

- **微信支付/支付宝真实接入** — 后续 Phase，需要商户资质和聚合支付平台集成
- **后台订单管理系统** — 后续 Phase，目前用 Supabase Dashboard 直接查看
- **支付退款流程** — 后续 Phase
- **自动拉群（企业微信）** — 后续 Phase，需要企微 API

</deferred>

---

*Phase: 04-付费转化*
*Context gathered: 2026-05-01*

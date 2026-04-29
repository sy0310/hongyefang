# Phase 3: 评估引擎 — 画像生成 + 结果展示 - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 接收 Phase 2 对话系统收集到的四项参数（年度弹性资金、每周投入时间、预期年化回报率、投入金额），运行规则评分和许愿型分类逻辑，将结果持久化到 Supabase，并展示包含 AI 生成叙述文字的结果页。

交付物：
1. 评分引擎（规则加权，0–1000 分，三等级）
2. 许愿型自动识别与强制分级
3. `assessments` 表扩展（新增 score、tier、is_wishing_type、ai_narrative 字段）
4. 完整结果展示页（替换 Phase 2 占位页）

</domain>

<decisions>
## Implementation Decisions

### 评分机制

- **D-01:** 评分方式为**规则加权计算**，不使用 AI 生成评分，0–1000 分范围。
- **D-02:** 四项参数权重：年度弹性资金 **40%** + 投入金额 **30%** + 每周投入时间 **20%** + 预期年化回报率 **10%**。
- **D-03:** 三个等级标签：**高度适配 / 中度适配 / 需要准备**（具体分数阈值由 planner 决定，如 700+ / 400–699 / <400）。

### 许愿型识别逻辑

- **D-04:** 许愿型判断规则：**预期年化回报率 > 500%** 即标记为许愿型。
- **D-05:** 被标记为许愿型的用户**直接强制评为「需要准备」**，绕过加权分数计算，最终等级不受其他参数影响。

### 结果页设计

- **D-06:** 布局方案：**维度拆解卡片**（方案B）。顶部横栏：综合分数 + 等级标签；中部：四项维度各自独立进度条 + 文字评价；底部：AI 生成的叙述建议段落 + CTA 按钮。
- **D-07:** 话术策略按等级分：
  - **许愿型（强制「需要准备」）**：温和劝退话术，承认热情，指出现阶段不匹配，鼓励准备后再来。
  - **高度适配 / 中度适配**：正面肯定话术，引导用户进入人工顾问咨询阶段。
- **D-08:** 底部 CTA 按钮**所有用户可见**，但措辞不同：许愿型用「准备好后预约顾问」，适配型用「立即预约专属顾问」。

### AI 接入（结果叙述生成）

- **D-09:** 使用 **DeepSeek API** 生成结果页个性化叙述段落（非评分逻辑）。
- **D-10:** 实现方式：**Server Component 后台生成**，页面加载时调用 DeepSeek，完成后整段文字渲染，不使用流式输出。
- **D-11:** 新增环境变量 `DEEPSEEK_API_KEY`（需加入 `.env.local` 和 `.env.local.example`）。

### Claude's Discretion

- 各等级的具体分数边界值（如 700+ = 高度适配，400–699 = 中度适配，<400 = 需要准备）
- 各参数映射到子分数的具体公式（如弹性资金如何从万元换算为 0–400 的子分）
- `assessments` 表新字段的具体命名和类型（score integer, tier text, is_wishing_type boolean, ai_narrative text）
- DeepSeek prompt 设计（须包含四项参数值、等级、是否许愿型，并遵守 D-07 话术策略）
- 进度条视觉实现（颜色、宽度计算、文字标签样式）

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 需求与目标
- `.planning/ROADMAP.md` §Phase 3 — Phase 3 目标、成功标准（EVAL-01 → RESULT-02）
- `.planning/REQUIREMENTS.md` — EVAL-01、EVAL-02、EVAL-03、RESULT-01、RESULT-02 需求定义

### 先前阶段决策
- `.planning/phases/02-ai/02-CONTEXT.md` — Phase 2 数据持久化策略（assessments 表结构、实时保存逻辑、chat_messages 批量保存）
- `.planning/phases/01-基础搭建/01-CONTEXT.md` — Phase 1 Supabase SSR 三文件模式、项目结构、认证策略

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/assessment.ts` — Assessment 类型定义，Phase 3 需扩展新增 `score`、`tier`、`is_wishing_type`、`ai_narrative` 字段
- `src/app/(chat)/result/page.tsx` — 现有占位页，Phase 3 完整替换
- `src/components/ui/Button.tsx` — Button 组件（primary/secondary/ghost variants），用于 CTA 按钮
- `src/lib/supabase/server.ts` — Supabase SSR server client，用于 Server Component 读取已完成的 assessment
- `src/lib/supabase/client.ts` — Phase 2 已用于参数实时保存，Phase 3 评分结果写回同样可用

### Established Patterns
- **Next.js 16 App Router + Supabase SSR 三文件模式**已建立，新 Server Component 遵循同一模式
- **route group `(chat)/`** 已存在，result 页在此 group 下
- **组件风格**：简约实用，Tailwind CSS 4，无额外 UI 库
- **Server Actions** 已用于 Phase 2 的 `completeAssessment`，Phase 3 评分写回可复用同一模式

### Integration Points
- `src/app/(chat)/assessment/page.tsx` — 对话完成后跳转到 `/result`，Phase 3 结果页是这条跳转的终点
- `src/app/(chat)/assessment/actions.ts` — 已有 `completeAssessment` Server Action，Phase 3 可在此处或新增 Action 中触发评分计算并写回
- Supabase `assessments` 表 — 需要 migration 新增评分相关字段
- DeepSeek API — 新外部依赖，需要 `DEEPSEEK_API_KEY`

</code_context>

<specifics>
## Specific Ideas

- 结果页维度进度条参考（方案B 的具体呈现）：
  ```
  弹性资金    ████████ 良好
  投入时间    ██████   中等
  预期回报    ████     偏高
  投入金额    ████████ 充足
  ```
- 许愿型用户的劝退话术应温和而不冒犯（避免 RESULT-02 要求的冒犯感），可参考医生"当前时机不成熟，建议先准备"的语调
- DeepSeek 生成的叙述段落应包含用户具体数据（"您每年有 X 万的弹性资金..."），而非通用模板语言

</specifics>

<deferred>
## Deferred Ideas

- **咨询套餐详情展示** — Phase 4 负责（价格梯度、服务分级说明）
- **支付入口** — Phase 4 负责
- **手机号+验证码注册** — 已延期，待后续阶段加入

</deferred>

---

*Phase: 03-评估引擎*
*Context gathered: 2026-04-29*

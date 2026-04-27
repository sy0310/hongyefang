# Pitfalls Research: 创业咨询平台

## Specific Pitfalls

### 1. AI 对话过度追问
**Warning:** 为了收集完整参数，AI 反复追问细节，用户感到疲惫而流失
**Prevention:** 系统 prompt 中限制追问轮次（≤3轮），参数收集采用默认值+确认模式
**Phase:** Phase 3 (AI 对话实现)

### 2. 支付通道资质审批周期长
**Warning:** 微信支付/支付宝商户资质审批可能耗时数周，阻塞 MVP 上线
**Prevention:** MVP 先用沙箱/模拟支付验证流程，资质下来后替换
**Phase:** Phase 5 (支付流程)

### 3. 评估标准不透明引发信任问题
**Warning:** 用户不理解为什么 AI 判定他们"不适合创业"，可能觉得被冒犯
**Prevention:** 评估结果用正面话术包装，强调"需要更多准备"而非"不适合"；即使评估不佳也提供付费咨询入口
**Phase:** Phase 4 (评估引擎)

### 4. Supabase Auth 手机验证不支持中国区
**Warning:** Supabase 的短信服务对中国手机号支持有限
**Prevention:** 使用第三方 SMS 服务（如阿里云短信）接入 Supabase Auth Edge Function，或 MVP 先用邮箱+密码
**Phase:** Phase 2 (用户系统)

### 5. AI 幻觉导致错误建议
**Warning:** LLM 可能给出不准确的创业建议（如错误的行业数据）
**Prevention:** System prompt 中明确边界（只做画像收集+适配度评估，不给具体创业建议），限制回复范围
**Phase:** Phase 3 (AI 对话实现)

### 6. 漏斗数据追踪缺失
**Warning:** 不知道用户在哪个阶段流失，无法优化转化
**Prevention:** 从第一天开始记录用户行为埋点（开始体检、完成体检、查看价格、发起支付）
**Phase:** Phase 2 (用户系统)

### 7. 定价策略不清晰
**Warning:** 2999 - 数万元的价格跨度太大，用户不知道选哪个
**Prevention:** 提供清晰的套餐分级（基础包/标准包/尊享包），每级有明确的服务内容差异
**Phase:** Phase 4 (评估引擎)

---
*Research: 2026-04-27*

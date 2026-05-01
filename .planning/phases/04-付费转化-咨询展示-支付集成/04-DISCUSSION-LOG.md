# Phase 4 Discussion Log

**Date:** 2026-05-01
**Mode:** Default (interactive, no flags)
**Areas discussed:** 4

## Area 1: Consult Plans (咨询套餐设计)

### Q1: 套餐分层
- **Options:** 3 档套餐 / 2 档套餐 / 单一咨询
- **Selected:** 3 档套餐 — 标准版 (~2999元) / 专业版 (~6999元) / 旗舰版 (~14999元)

### Q2: 套餐差异维度
- **Options:** 按问题复杂度 / 按服务时长 / 按交付物
- **Selected:** 按问题复杂度 — 标准版=基础诊断，专业版=深度方案，旗舰版=全流程陪跑

### Q3: 套餐内容设计
- **Selected:** Claude 设计，用户 review

## Area 2: Payment Strategy (支付集成)

### Q1: 支付集成方式
- **Options:** 第三方聚合支付 / 原生直连接入 / H5 收银台
- **Selected:** 第三方聚合支付

### Q2: 平台选择
- **Options:** Stripe / Ping++ / 先做 UI 占位
- **Selected:** 先做 UI 占位 — MVP 阶段不接入真实支付

### Q3: 支付占位流程
- **Options:** 模拟支付→跳转对接页 / 点击直接跳转 / 占位提示
- **Selected:** 模拟支付→跳转对接页

## Area 3: Post-Payment Flow (支付后流程)

### Q1: 支付成功后展示
- **Options:** 专属对接页 / 弹窗提示 / 自动拉群
- **Selected:** 专属对接页

### Q2: 对接页内容范围
- **Options:** 静态信息页 / 动态查询页 / 含问卷表单
- **Selected:** 静态确认式 — 订单号 + 套餐名 + 金额 + "24小时内联系" + 微信二维码

## Area 4: Order Management (订单管理)

### Q1: 后台管理程度
- **Options:** Supabase Table View / 简单管理页 / 完整订单系统
- **Selected:** Supabase Table View

### Q2: 是否建 orders 表
- **Options:** 创建简化订单表 / 暂不建表
- **Selected:** 创建简化 orders 表

## Cross-Area Decisions

### 套餐展示位置
- **Selected:** 独立 /consult 页面

### CTA 按钮差异化
- **Selected:** 按等级差异化 — 高度适配/中度适配→"查看咨询方案"；需要准备→温和告知但仍可付费

## Deferred Ideas

- 微信支付/支付宝真实接入 — 后续 Phase
- 后台订单管理系统 — 后续 Phase
- 支付退款流程 — 后续 Phase
- 自动拉群（企业微信） — 后续 Phase

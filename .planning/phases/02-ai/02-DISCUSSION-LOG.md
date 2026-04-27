# Phase 2 Discussion Log

**Date:** 2026-04-27
**Phase:** 02 — AI 创业体检 — 对话系统

---

## AI Provider
- **Q:** AI 创业体检需要接入大语言模型。你倾向用哪个 AI 提供商？
- **A:** 先保留，后续添加
- **Note:** Phase 2 暂不接入真实 AI，用 mock 回复跑通流程

## Chat UI — 混合模式
- **Q:** 混合模式下，结构化参数卡片应该放在聊天界面的什么位置？
- **A:** 卡片在消息流中内联
- **Q:** AI 回复的消息动画偏好是？
- **A:** 流式逐字显示

## Flow Control — 状态机 + AI 自动引导
- **Q:** 4 项参数的收集顺序偏好？
- **A:** AI 灵活调整
- **Q:** 「不超过3轮」的计数方式？
- **A:** 仅追问计入轮数

## Data Storage
- **Q:** Supabase 数据库表结构偏好？
- **A:** Supabase assessments 表
- **Q:** 对话历史的保存策略？
- **A:** 参数实时+对话结束保存

## Entry/Exit
- **Q:** 用户从 Dashboard 如何进入 AI 创业体检？
- **A:** Dashboard 入口按钮
- **Q:** 4 项参数收集完成后用户看到什么？
- **A:** 跳转到结果页

## Streaming
- **Q:** AI 流式回复的技术实现偏好？
- **A:** API Route + Edge streaming

## Exit Strategy
- **Q:** 「随时退出」的交互方式？
- **A:** 返回 + 可恢复

---

*Phase: 02-ai*
*Date: 2026-04-27*

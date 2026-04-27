# Requirements: 红叶坊 (hongyefang)

**Defined:** 2026-04-27
**Core Value:** AI 精准筛选优质创业用户，降低无效沟通成本，让有价值的创业咨询高效匹配。

## v1 Requirements

### Authentication

- [x] **AUTH-01**: 用户可以用邮箱+密码注册账号
- [x] **AUTH-02**: 用户可以用手机号+验证码注册账号
- [x] **AUTH-03**: 用户登录后 session 在刷新后保持
- [x] **AUTH-04**: 用户可以登出
- [x] **AUTH-05**: 用户可以重置密码

### AI 创业体检

- [ ] **CHAT-01**: 用户可以开始 AI 创业体检对话
- [ ] **CHAT-02**: AI 对话收集四项核心参数（年度弹性资金、每周投入时间、预期年化回报、投入金额）
- [ ] **CHAT-03**: AI 对话追问不超过 3 轮，避免用户流失
- [ ] **CHAT-04**: 对话界面提供流畅的聊天交互体验

### 评估引擎

- [ ] **EVAL-01**: AI 根据收集的参数生成创业适配度评分
- [ ] **EVAL-02**: 系统自动识别并标记"许愿型"用户（资金少但预期高）
- [ ] **EVAL-03**: 用户画像数据保存到数据库

### 结果展示

- [ ] **RESULT-01**: 用户查看评估结果页面（适配度评分 + 建议）
- [ ] **RESULT-02**: 评估结果使用正面话术包装，避免用户被冒犯感

### 人工咨询转化

- [ ] **CONSULT-01**: 结果页展示人工咨询套餐和价格梯度（2999 元至数万元）
- [ ] **CONSULT-02**: 咨询套餐有清晰的服务内容分级说明

### 支付流程

- [ ] **PAY-01**: 用户可以选择咨询套餐并通过微信支付
- [ ] **PAY-02**: 用户可以选择咨询套餐并通过支付宝支付
- [ ] **PAY-03**: 支付成功后展示专员对接转接页面
- [ ] **PAY-04**: 支付订单状态可追踪

## v2 Requirements

### 用户管理
- **USER-01**: 用户可以查看自己的用户画像历史
- **USER-02**: 用户档案页面展示个人信息

### 漏斗追踪
- **TRACK-01**: 后台仪表盘展示漏斗转化率数据
- **TRACK-02**: 用户行为埋点记录（开始体检、完成体检、查看价格、发起支付）

### 行业数据
- **DATA-01**: 行业参考数据展示（装修价格、物料成本等）
- **DATA-02**: 行业数据搜索和筛选

## Out of Scope

| Feature | Reason |
|---------|--------|
| DIY 资料交付 | MVP 先验证漏斗前两层，阶段3后做 |
| 全权托管服务 | 需要人工运营能力，后期接入 |
| 代运营服务 | 依赖托管服务先跑通 |
| 股东匹配拼单 | 需要更多用户基数 |
| 服务商入驻平台 | 需要 C 端验证后再拓展 |
| 品牌推荐分成 | 需要项目落地数据 |
| 实时聊天/IM | 复杂性高，MVP 不需要 |
| 移动端原生 App | Web 优先 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| CHAT-01 | Phase 2 | Pending |
| CHAT-02 | Phase 2 | Pending |
| CHAT-03 | Phase 2 | Pending |
| CHAT-04 | Phase 2 | Pending |
| EVAL-01 | Phase 3 | Pending |
| EVAL-02 | Phase 3 | Pending |
| EVAL-03 | Phase 3 | Pending |
| RESULT-01 | Phase 3 | Pending |
| RESULT-02 | Phase 3 | Pending |
| CONSULT-01 | Phase 4 | Pending |
| CONSULT-02 | Phase 4 | Pending |
| PAY-01 | Phase 4 | Pending |
| PAY-02 | Phase 4 | Pending |
| PAY-03 | Phase 4 | Pending |
| PAY-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-27*
*Last updated: 2026-04-27 after initial definition*

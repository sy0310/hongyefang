import { PARAMETER_LABELS, PARAMETER_UNITS, type ParameterKey } from '@/types/assessment';

const WELCOME_MESSAGE = '你好！我是弘业坊AI创业顾问。我将通过几个简单问题，帮你梳理创业条件。请随时回答，我会根据你的回答调整建议。';

const PARAMETER_PROMPTS: Record<ParameterKey, string> = {
  annualCapital: '首先，请问你每年大概有多少可以灵活支配的创业资金？（单位：万元）',
  weeklyTime: '好的。接下来想了解，你每周大概能投入多少时间到这个创业项目上？（单位：小时）',
  expectedReturn: '明白了。你期望的年化回报率大概是多少？（单位：百分比）',
  investmentAmount: '你计划初期投入多少资金？（单位：万元）',
  industryExperience: '你在计划进入的行业中有多少年的相关工作经验？（无经验填 0）',
  debtPressure: '最后，你目前每月需要偿还的贷款或债务大概是多少万元？（无债务填 0）',
};

const FOLLOW_UP_PROMPTS: Record<ParameterKey, string> = {
  annualCapital: '关于年度弹性资金，能再具体一点吗？比如你目前手头可用的流动资金大概多少？',
  weeklyTime: '关于时间投入，请问你是全职创业还是兼职？具体每周能保障的时间大概多少？',
  expectedReturn: '关于回报预期，这个预期是基于什么考虑的？是行业平均水平还是个人目标？',
  investmentAmount: '关于初期投入，这些资金是自有资金还是需要融资？能再确认一下具体数额吗？',
  industryExperience: '关于行业经验，能描述一下是哪类工作经历吗？请用年数表示。',
  debtPressure: '关于月均债务，包含所有需要定期偿还的款项（房贷、车贷等），能再确认一下数额吗？',
};

export function getNextMockResponse(
  collectedCount: number,
  currentParameter: ParameterKey | null,
  isFollowUp: boolean,
  followUpLimitReached: boolean = false,
): string {
  if (collectedCount === 0 && !currentParameter) {
    return WELCOME_MESSAGE;
  }

  // CHAT-03 guard: if follow-up requested but limit reached, fall through to normal prompt
  if (isFollowUp && currentParameter && !followUpLimitReached) {
    return FOLLOW_UP_PROMPTS[currentParameter] || '能再多说一点吗？';
  }

  if (currentParameter) {
    return PARAMETER_PROMPTS[currentParameter];
  }

  return getCompletionMessage();
}

export function getCompletionMessage(): string {
  return '好的，四项核心信息已收集完毕。现在我将为你生成创业适配度分析报告...';
}

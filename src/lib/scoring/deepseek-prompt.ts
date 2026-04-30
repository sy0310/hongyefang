import type { Tier } from '@/types/assessment';

export interface DeepSeekPromptInput {
  annualCapital: number | null;
  weeklyTime: number | null;
  expectedReturn: number | null;
  investmentAmount: number | null;
}

/**
 * Builds system and user prompts for DeepSeek narrative generation.
 * D-07: Tone varies by tier and wishing-type status.
 * D-10: Non-streaming text generation (generateText, not streamText).
 */
export function buildDeepSeekPrompt(
  params: DeepSeekPromptInput,
  tier: Tier,
  isWishingType: boolean
): { system: string; user: string } {
  const annualCapital = params.annualCapital ?? 0;
  const weeklyTime = params.weeklyTime ?? 0;
  const expectedReturn = params.expectedReturn ?? 0;
  const investmentAmount = params.investmentAmount ?? 0;

  // D-07: System prompt varies by tier/wishing-type
  let system: string;

  if (isWishingType) {
    system = '你是一位经验丰富的创业顾问，需要用温和、鼓励但不失诚实的方式向一位创业意愿强烈的用户提供评估反馈。用户预期回报率过高，需要引导其调整预期。请使用友善的措辞，肯定对方的热情，同时指出当前预期与现实之间的差距。不要使用评判性语言，以"目前阶段"、"建议先"等温和措辞为主。';
  } else if (tier === '高度适配') {
    system = '你是一位经验丰富的创业顾问，需要向一位各项条件优秀的用户提供评估反馈。请使用正面肯定的语言，肯定用户的条件配置，引导用户尽快与专业顾问深入交流。语气要积极、专业、有行动导向。';
  } else if (tier === '中度适配') {
    system = '你是一位经验丰富的创业顾问，需要向一位基础良好的用户提供评估反馈。请在肯定的同时给出有针对性的改进建议，引导用户通过顾问咨询来优化薄弱环节。语气要积极、建设性。';
  } else {
    // 需要准备 (non-wishing)
    system = '你是一位经验丰富的创业顾问，需要向一位条件尚不充分的用户提供评估反馈。请诚实但建设性地指出需要准备的方面，避免打击积极性。语气要温和、鼓励，强调"这是更聪明的准备"而不是"你不行"。';
  }

  const user = `请根据以下用户的创业评估数据，生成一段3-5句话的个性化评估叙述段落：

【用户数据】
- 年度弹性资金：${annualCapital}万元
- 每周可投入时间：${weeklyTime}小时
- 预期年化回报率：${expectedReturn}%
- 投入金额：${investmentAmount}万元

要求：
1. 引用至少一项用户的具体数据（如"您每年有${annualCapital}万元的弹性资金"），使叙述个性化
2. 不要直接引用综合评分数字（评分已在页面上方展示）
3. 语言自然流畅，不分点列举
4. 控制在3-5句话`;

  return { system, user };
}

/**
 * Returns hardcoded fallback narrative paragraph for each tier.
 * Used when DeepSeek API is unavailable, times out, or returns an error.
 * D-07: Each variant follows the prescribed tone strategy.
 */
export function getFallbackNarrative(tier: Tier, isWishingType: boolean): string {
  if (isWishingType) {
    // 温和劝退: acknowledge enthusiasm, encourage preparation
    return '创业热情是非常宝贵的资源，但合理的预期同样重要。目前建议您先深入了解所在行业的实际回报数据，调整预期后再做决策，这样创业成功的概率会大大提高。';
  }
  if (tier === '高度适配') {
    // 正面肯定 + 行动引导
    return '您的各项创业条件表现出色，资金储备、时间投入和回报预期都在合理范围内。建议您尽快与我们的专属顾问沟通，制定具体的落地方案。';
  }
  if (tier === '中度适配') {
    // 正面肯定 + 具体建议
    return '您已具备良好的创业基础，部分条件还有进一步优化的空间。我们的顾问可以根据您的具体情况，帮助您找到最适合的创业路径。';
  }
  // 需要准备 (non-wishing): 诚实但建设性
  return '创业是一段需要充分准备的旅程。目前来看，还有一些基础条件可以进一步夯实。建议先与顾问做一次初步沟通，了解您需要为哪些方面做准备。';
}

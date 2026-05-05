import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { PARAMETER_ORDER, type ParameterKey } from '@/lib/chat/state-machine';

const PARAM_LABELS: Record<ParameterKey, string> = {
  annualCapital: '年度弹性资金（万元）',
  weeklyTime: '每周投入时间（小时/周）',
  expectedReturn: '预期年化回报率（%）',
  investmentAmount: '计划投资金额（万元）',
};

function buildSystemPrompt(
  collected: Partial<Record<ParameterKey, number>>,
  currentParameter: ParameterKey | null,
): string {
  const collectedCount = Object.keys(collected).length;
  const total = PARAMETER_ORDER.length;

  const collectedLines = PARAMETER_ORDER
    .filter(k => collected[k] !== undefined)
    .map(k => `  - ${PARAM_LABELS[k]}: ${collected[k]}`)
    .join('\n');

  const currentLabel = currentParameter
    ? PARAM_LABELS[currentParameter]
    : collectedCount >= total
    ? '全部已收集，无需再问'
    : '准备开始';

  return `你是弘业坊的 AI 创业顾问，正在帮助用户完成创业适配度评估。

进度：已收集 ${collectedCount}/${total} 项
${collectedCount > 0 ? `已有数据：\n${collectedLines}\n` : ''}当前阶段：${currentLabel}

【行为规则】
1. 用温暖自然的中文，语气亲切，每次回复只说 1~2 句话
2. 系统界面已为用户提供了数字输入卡片和下一步说明——你的唯一任务是对用户刚提交的数值给出简短、有温度的确认，不要介绍下一个问题
3. 确认时可以适当点评这个数值（例如"50万的弹性资金，底气很足！"），让用户感到被理解
4. 当 4 项数据全部收集完毕时，告知用户报告正在生成中，用鼓励的语气结束
5. 不要重复用户说过的数字，不要啰嗦，不要问任何问题`;
}

export async function POST(req: Request) {
  const body = await req.json() as {
    messages: UIMessage[];
    collected?: Partial<Record<ParameterKey, number>>;
    currentParameter?: ParameterKey | null;
  };

  const messages = body.messages;
  const collected = body.collected ?? {};
  const currentParameter = body.currentParameter ?? null;

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: buildSystemPrompt(collected, currentParameter),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 200,
  });

  return result.toUIMessageStreamResponse();
}

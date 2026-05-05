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
${collectedCount > 0 ? `已有数据：\n${collectedLines}\n` : ''}当前应询问：${currentLabel}

【行为规则】
1. 用温暖自然的中文对话，语气亲切、简洁，每次回复 1~3 句话
2. 系统已提供了数字输入卡片，用户在卡片里填数字提交——你无需让用户在聊天框里输入数字
3. 当用户提交某项数据后，简短表示认可，顺势引出下一个问题（若还有剩余）
4. 当 4 项数据全部收集完毕时，告知用户报告正在生成，不再提问
5. 第一次对话时，简短自我介绍并说明评估目的，然后引出第一个问题
6. 不要重复已经收集到的数据，不要啰嗦`;
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

import { google } from '@ai-sdk/google';
import { streamText, tool, zodSchema, convertToModelMessages, type UIMessage } from 'ai';
import { z } from 'zod';
import { PARAMETER_ORDER, type ParameterKey } from '@/lib/chat/state-machine';

const PARAM_LABELS: Record<ParameterKey, string> = {
  annualCapital: '年度弹性资金（万元）',
  weeklyTime: '每周投入时间（小时/周）',
  expectedReturn: '预期年化回报率（%）',
  investmentAmount: '计划投资金额（万元）',
};

function buildSystemPrompt(collected: Partial<Record<ParameterKey, number>>): string {
  const collectedCount = Object.keys(collected).length;
  const remaining = PARAMETER_ORDER.filter(k => collected[k] === undefined);

  const collectedSection = collectedCount > 0
    ? `\n已收集的信息：\n${PARAMETER_ORDER.filter(k => collected[k] !== undefined).map(k => `  ✓ ${PARAM_LABELS[k]}：${collected[k]}`).join('\n')}\n`
    : '';

  const remainingSection = remaining.length > 0
    ? `待收集：${remaining.map(k => PARAM_LABELS[k]).join('、')}`
    : '全部信息已收集完毕';

  return `你是弘业坊的 AI 创业顾问，正在通过自然对话帮助用户完成创业适配度评估。
${collectedSection}
当前状态：已收集 ${collectedCount}/4 项。${remainingSection}

【你需要收集的 4 项信息（按顺序逐一进行）】
1. 年度弹性资金（万元）：不影响正常生活、可灵活用于创业的年度资金
2. 每周投入时间（小时/周）：每周能专注在项目上的时间
3. 预期年化回报率（%）：对本次创业的年化收益预期
4. 计划投资金额（万元）：准备投入的启动资金

【对话要求】
- 像一位温暖、有经验的创业导师，语气自然、亲切
- 每次只问一个问题，并用 1~2 句话解释为什么这个信息很重要
- 当用户提供数值时，如不够明确则追问澄清；确认后立即调用 collectParameter 工具记录
- 调用工具后继续对话，简短确认并自然引出下一个问题
- 灵活应对追问、闲聊，但始终保持对评估主线的引导
- 全部 4 项收集完成后，给用户一个温暖的总结，告知报告正在生成中

${collectedCount === 0 ? '【本次对话开始时】用 __start__ 触发，请立即以温暖的自我介绍开场，说明评估目的，然后引出第一个问题。' : '【继续收集】根据已有信息，从下一个待收集项继续对话。'}`;
}

export async function POST(req: Request) {
  const body = await req.json() as {
    messages: UIMessage[];
    collected?: Partial<Record<ParameterKey, number>>;
  };

  const collected = body.collected ?? {};

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: buildSystemPrompt(collected),
    messages: await convertToModelMessages(body.messages),
    tools: {
      collectParameter: tool({
        description: '当用户明确提供了某个参数的数值并经确认后，调用此工具记录该值',
        inputSchema: zodSchema(z.object({
          key: z.enum(['annualCapital', 'weeklyTime', 'expectedReturn', 'investmentAmount']),
          value: z.number(),
        })),
      }),
    },
    maxOutputTokens: 500,
  });

  return result.toUIMessageStreamResponse();
}

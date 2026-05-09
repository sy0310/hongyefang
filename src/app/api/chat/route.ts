import { google } from '@ai-sdk/google';
import { streamText, tool, zodSchema, convertToModelMessages, type UIMessage } from 'ai';
import { z } from 'zod';
import { PARAMETER_ORDER, type ParameterKey } from '@/lib/chat/state-machine';

const PARAM_LABELS: Record<ParameterKey, string> = {
  targetIndustry: '意向副业方向',
  annualCapital: '年度弹性资金（万元）',
  weeklyTime: '每周投入时间（小时/周）',
  expectedReturn: '预期年化回报率（%）',
  investmentAmount: '计划投资金额（万元）',
  industryExperience: '行业经验年限（年）',
  debtPressure: '月均债务压力（万元/月）',
  handsOffPreference: '托管意愿度（1-10分）',
  setupAversion: '筹备抗拒度（1-10分）',
};

function buildSystemPrompt(collected: Partial<Record<ParameterKey, number | string>>): string {
  const collectedCount = Object.keys(collected).length;
  const remaining = PARAMETER_ORDER.filter(k => collected[k] === undefined);

  const collectedSection = collectedCount > 0
    ? `\n已收集的信息：\n${PARAMETER_ORDER.filter(k => collected[k] !== undefined).map(k => `  ✓ ${PARAM_LABELS[k]}：${collected[k]}`).join('\n')}\n`
    : '';

  const remainingSection = remaining.length > 0
    ? `待收集：${remaining.map(k => PARAM_LABELS[k]).join('、')}`
    : '全部信息已收集完毕';

  return `你是弘业坊的 AI 副业孵化顾问，正在通过自然对话帮助用户完成副业资源对接和适配度评估。
${collectedSection}
当前状态：已收集 ${collectedCount}/9 项。${remainingSection}

【你需要收集的 9 项信息（按顺序逐一进行）】
1. 意向副业方向：用户感兴趣的副业类型（如：实体店、电商、自媒体等，如无方向填"暂无"）
2. 年度弹性资金（万元）：不影响正常生活、可灵活用于副业的年度资金
3. 每周投入时间（小时/周）：每周能专注在项目上的时间
4. 预期年化回报率（%）：对本次副业的年化收益预期
5. 计划投资金额（万元）：准备投入的启动资金
6. 行业经验年限（年）：在计划进入的行业中的相关工作经验（无经验填 0）
7. 月均债务压力（万元/月）：每月需偿还的贷款或债务总额（无债务填 0）
8. 托管意愿度（1-10分）：倾向于亲力亲为还是做甩手掌柜（1=亲力亲为，10=只想投钱完全托管代运营）
9. 筹备抗拒度（1-10分）：对办执照、找场地、装修等前期繁琐工作的头疼程度（1=喜欢自己折腾，10=极度头疼希望全包）

【对话要求】
- 像一位懂行、有资源的副业合伙人，重点关注用户的需求和痛点，我们的核心卖点是【0-60分全链条代办】及【优质B端资源对接】。
- 每次只问一个问题；提问前先用一句话自然说明这个问题对后续匹配资源的意义，再提问。
- 当收集到用户对“前期筹备非常抗拒”或“高度想要托管”时，自然地顺水推舟告知：“这正是我们的强项，我们能帮您直接对接靠谱的装修和办证资源，省去试错成本”。
- 用户提供信息后立即调用 collectParameter 工具记录。
- 调用工具后，用 2~3 句话有实质性地回应：①引用用户的具体回答并给出一个行业洞见，②然后自然过渡到下一个问题。
- 禁止空洞确认句，如"好的，已记录"、"明白了，我已记下"——每次工具调用后的回应都必须让用户感受到顾问在真正理解和思考他的情况
- 灵活应对追问、闲聊，但始终保持对评估主线的引导
- 全部 9 项收集完成后，给用户一个温暖的总结，告知正在为您生成专属的资源对接及副业诊断报告。

${collectedCount === 0 ? '【本次对话开始时】用 __start__ 触发，请立即以专业懂行的口吻开场，说明我们将帮他跨过0-60分的繁琐阶段，然后引出第一个问题。' : '【继续收集】根据已有信息，从下一个待收集项继续对话。'}`;
}

export async function POST(req: Request) {
  const body = await req.json() as {
    messages: UIMessage[];
    collected?: Partial<Record<ParameterKey, number | string>>;
  };

  const collected = body.collected ?? {};

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: buildSystemPrompt(collected),
    messages: await convertToModelMessages(body.messages),
    tools: {
      collectParameter: tool({
        description: '当用户明确提供了某个参数的值并经确认后，调用此工具记录该值。注意：targetIndustry需要记录为字符串，其他必须为数字。',
        inputSchema: zodSchema(z.object({
          key: z.enum(['targetIndustry', 'annualCapital', 'weeklyTime', 'expectedReturn', 'investmentAmount', 'industryExperience', 'debtPressure', 'handsOffPreference', 'setupAversion']),
          value: z.union([z.number(), z.string()]),
        })),
      }),
    },
    maxOutputTokens: 800,
  });

  return result.toUIMessageStreamResponse();
}

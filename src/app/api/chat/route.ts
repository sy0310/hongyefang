import { streamText, simulateReadableStream, type UIMessage } from 'ai';
import type { LanguageModelV3StreamPart } from '@ai-sdk/provider';
import { MockLanguageModelV3 } from 'ai/test';
import { getNextMockResponse, getCompletionMessage } from '@/lib/chat/mock-responses';
import { PARAMETER_ORDER, type ParameterKey } from '@/lib/chat/state-machine';

export const runtime = 'edge'

const PARAMETER_MAP: Record<string, ParameterKey> = {
  '年度弹性资金': 'annualCapital',
  '弹性资金': 'annualCapital',
  '资金': 'annualCapital',
  '每周投入时间': 'weeklyTime',
  '投入时间': 'weeklyTime',
  '每周时间': 'weeklyTime',
  '时间': 'weeklyTime',
  '预期年化回报': 'expectedReturn',
  '预期回报': 'expectedReturn',
  '回报': 'expectedReturn',
  '年化回报': 'expectedReturn',
  '投入金额': 'investmentAmount',
  '初期投入': 'investmentAmount',
  '金额': 'investmentAmount',
};

function detectCollectedParameters(messages: UIMessage[]): Map<ParameterKey, number> {
  const collected = new Map<ParameterKey, number>();

  for (const msg of messages) {
    if (msg.role !== 'user') continue;

    const text = msg.parts
      .filter(p => p.type === 'text')
      .map(p => p.text)
      .join('');

    const numberMatch = text.match(/(\d+(?:\.\d+)?)/);
    if (!numberMatch) continue;
    const value = parseFloat(numberMatch[1]);

    const msgIndex = messages.indexOf(msg);
    if (msgIndex > 0) {
      const prevMsg = messages[msgIndex - 1];
      if (prevMsg.role === 'assistant') {
        const prevText = prevMsg.parts
          .filter(p => p.type === 'text')
          .map(p => p.text)
          .join('');

        for (const [keyword, key] of Object.entries(PARAMETER_MAP)) {
          if (prevText.includes(keyword)) {
            collected.set(key, value);
            break;
          }
        }
      }
    }
  }

  return collected;
}

function makeStreamParts(text: string): LanguageModelV3StreamPart[] {
  return [
    { type: 'text-start', id: 'msg-1' },
    ...text.split('').map(char => ({
      type: 'text-delta' as const,
      id: 'msg-1',
      delta: char,
    })),
    { type: 'text-end', id: 'msg-1' },
    {
      type: 'finish',
      finishReason: { unified: 'stop' as const, raw: undefined },
      usage: {
        inputTokens: { total: 10, noCache: undefined, cacheRead: undefined, cacheWrite: undefined },
        outputTokens: { total: text.length, text: text.length, reasoning: undefined },
      },
    },
  ];
}

export async function POST(req: Request) {
  const body = await req.json() as { messages: UIMessage[]; body?: { followUpRounds?: Record<string, number>; currentParameter?: string } };
  const messages = body.messages;
  const clientFollowUpRounds = body.body?.followUpRounds ?? {};
  const clientCurrentParam = body.body?.currentParameter ?? null;
  const currentRounds = clientCurrentParam ? (clientFollowUpRounds[clientCurrentParam] ?? 0) : 0;
  const followUpLimitReached = currentRounds >= 1;

  const collected = detectCollectedParameters(messages);
  const collectedCount = collected.size;

  let currentParameter: ParameterKey | null = null;
  for (const param of PARAMETER_ORDER) {
    if (!collected.has(param)) {
      currentParameter = param;
      break;
    }
  }

  const mockResponse = collectedCount >= 4
    ? getCompletionMessage()
    : getNextMockResponse(collectedCount, currentParameter, false, followUpLimitReached);

  const result = streamText({
    model: new MockLanguageModelV3({
      doStream: {
        stream: new ReadableStream({
          start(controller) {
            const parts = makeStreamParts(mockResponse);
            for (const part of parts) {
              controller.enqueue(part);
            }
            controller.close();
          },
        }),
      },
    }),
    messages: [{ role: 'user', content: mockResponse }],
  });

  return result.toUIMessageStreamResponse();
}

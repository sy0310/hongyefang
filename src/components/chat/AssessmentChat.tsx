'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { useRouter } from 'next/navigation';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { PARAMETER_ORDER, type ParameterKey } from '@/lib/chat/state-machine';
import { createClient } from '@/lib/supabase/client';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import {
  createAssessment,
  getInProgressAssessment,
  saveChatMessages,
  completeAssessment,
} from '@/app/(chat)/assessment/actions';
import { Zap } from 'lucide-react';

const PARAMETER_KEY_TO_DB_COLUMN: Record<ParameterKey, string> = {
  annualCapital: 'annual_capital',
  weeklyTime: 'weekly_time',
  expectedReturn: 'expected_return',
  investmentAmount: 'investment_amount',
};

const INIT_TRIGGER = '__start__';

export function AssessmentChat() {
  const router = useRouter();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [initError, setInitError] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [collected, setCollected] = useState<Partial<Record<ParameterKey, number>>>({});
  const [input, setInput] = useState('');
  const [restoredAssessment, setRestoredAssessment] = useState<{
    id: string;
    annual_capital: number | null;
    weekly_time: number | null;
    expected_return: number | null;
    investment_amount: number | null;
  } | null>(null);

  const assessmentIdRef = useRef<string | null>(null);
  assessmentIdRef.current = assessmentId;
  const collectedRef = useRef(collected);
  collectedRef.current = collected;
  const initSentRef = useRef(false);
  const isCompleteRef = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addToolResultRef = useRef<((...args: any[]) => void) | null>(null);

  const transportRef = useRef<DefaultChatTransport<UIMessage> | null>(null);
  if (!transportRef.current) {
    transportRef.current = new DefaultChatTransport<UIMessage>({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ body, messages: msgs, ...req }) => ({
        ...req,
        body: {
          ...body,
          messages: msgs,
          collected: collectedRef.current,
        },
      }),
    });
  }

  const { messages, sendMessage, status, addToolResult } = useChat<UIMessage>({
    transport: transportRef.current,
    maxSteps: 10,
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName === 'collectParameter') {
        const { key, value } = toolCall.input as { key: ParameterKey; value: number };

        const aId = assessmentIdRef.current;
        if (aId) {
          const supabase = createClient();
          const dbCol = PARAMETER_KEY_TO_DB_COLUMN[key];
          await supabase
            .from('assessments')
            .update({ [dbCol]: value, updated_at: new Date().toISOString() })
            .eq('id', aId);
        }

        const newCollected = { ...collectedRef.current, [key]: value };
        setCollected(newCollected);

        if (!isCompleteRef.current && Object.keys(newCollected).length >= PARAMETER_ORDER.length) {
          isCompleteRef.current = true;
          setIsComplete(true);
          setIsGeneratingReport(true);
        }

        addToolResultRef.current?.({ tool: 'collectParameter', toolCallId: toolCall.toolCallId, output: 'recorded' });
      }
    },
  });

  // Keep addToolResult ref up to date
  addToolResultRef.current = addToolResult;

  // Completion effect: save messages + redirect
  useEffect(() => {
    if (!isComplete || !assessmentId) return;

    async function finish() {
      await completeAssessment(assessmentId!);

      const messagesToSave = messages
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.parts.filter(p => p.type === 'text').map(p => p.text).join(''),
        }))
        .filter(m => m.content.trim() && m.role !== 'tool' as string);

      if (messagesToSave.length > 0) {
        await saveChatMessages(assessmentId!, messagesToSave);
      }

      router.push('/result');
    }

    finish();
  }, [isComplete, assessmentId, messages, router]);

  // Session resume check on mount
  useEffect(() => {
    async function checkResume() {
      const result = await getInProgressAssessment();
      if ('error' in result || !result.assessment) {
        const created = await createAssessment();
        if ('id' in created) {
          setAssessmentId(created.id);
        } else {
          setInitError(true);
        }
        return;
      }
      setRestoredAssessment(result.assessment);
      setShowResumePrompt(true);
    }
    checkResume();
  }, []);

  // Send init trigger once session is ready
  useEffect(() => {
    if (assessmentId && !showResumePrompt && !initSentRef.current && messages.length === 0) {
      initSentRef.current = true;
      sendMessage({ text: INIT_TRIGGER });
    }
  }, [assessmentId, showResumePrompt, messages.length, sendMessage]);

  const handleResume = useCallback(() => {
    if (!restoredAssessment) return;
    setAssessmentId(restoredAssessment.id);

    const restored: Partial<Record<ParameterKey, number>> = {};
    if (restoredAssessment.annual_capital !== null) restored.annualCapital = restoredAssessment.annual_capital;
    if (restoredAssessment.weekly_time !== null) restored.weeklyTime = restoredAssessment.weekly_time;
    if (restoredAssessment.expected_return !== null) restored.expectedReturn = restoredAssessment.expected_return;
    if (restoredAssessment.investment_amount !== null) restored.investmentAmount = restoredAssessment.investment_amount;
    setCollected(restored);
    setShowResumePrompt(false);
  }, [restoredAssessment]);

  const handleStartFresh = useCallback(async () => {
    setShowResumePrompt(false);
    setRestoredAssessment(null);
    const created = await createAssessment();
    if ('id' in created) {
      setAssessmentId(created.id);
    }
  }, []);

  const handleSend = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || status === 'streaming') return;
    sendMessage({ text: input });
    setInput('');
  }, [input, status, sendMessage]);

  // Filter messages: hide init trigger and tool-only messages
  const displayMessages = messages.filter(m => {
    if (m.role === 'user') {
      const text = m.parts.filter(p => p.type === 'text').map(p => p.text).join('');
      if (text === INIT_TRIGGER) return false;
    }
    const textContent = m.parts.filter(p => p.type === 'text').map(p => p.text).join('').trim();
    return textContent.length > 0;
  });

  if (initError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg px-4 pb-16 gap-4">
        <p className="text-sm text-text/70 text-center">出现错误，请刷新页面重试</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          刷新页面
        </button>
      </div>
    );
  }

  if (showResumePrompt) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg px-4 pb-16">
        <div className="max-w-md w-full bg-surface rounded-2xl shadow-sm border border-border/50 p-8 text-center">
          <h2 className="text-xl font-bold text-text mb-2">继续上次对话？</h2>
          <p className="text-sm text-text/60 mb-6">
            检测到您之前有一次未完成的创业体检，是否继续？
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleResume}
              className="px-6 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              继续
            </button>
            <button
              onClick={handleStartFresh}
              className="px-6 py-2 bg-text/5 text-text/70 text-sm font-semibold rounded-lg hover:bg-text/10 transition-colors"
            >
              重新开始
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isGeneratingReport) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg px-4 pb-16 gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-7 h-7 text-accent" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-text mb-1">正在生成您的评估报告</p>
          <p className="text-sm text-text-2">AI 顾问正在分析您的创业适配度，请稍候…</p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-accent animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const collectedCount = Object.keys(collected).length;

  return (
    <div className="flex-1 flex flex-col bg-bg relative pb-16">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-border bg-surface flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Zap className="text-accent w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text">AI 创业顾问</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green" />
              <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>在线</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {PARAMETER_ORDER.map((key) => (
            <div
              key={key}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                collected[key] !== undefined ? 'bg-accent' : 'bg-border-light'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth">
        {displayMessages.map((m) => (
          <MessageBubble
            key={m.id}
            role={m.role === 'user' ? 'user' : 'assistant'}
            content={m.parts.filter(p => p.type === 'text').map(p => p.text).join('')}
            isStreaming={status === 'streaming' && m.role === 'assistant'}
          />
        ))}
        {(status === 'streaming' || status === 'submitted') && displayMessages.length === 0 && (
          <MessageBubble role="assistant" content="" isStreaming />
        )}
        {status === 'streaming' && displayMessages.length > 0 && displayMessages[displayMessages.length - 1]?.role === 'user' && (
          <MessageBubble role="assistant" content="" isStreaming />
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 p-4 bg-surface border-t border-border">
        <ChatInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSubmit={handleSend}
          isStreaming={status === 'streaming'}
        />
        <p className="text-[10px] text-text-2 text-center mt-3 italic">
          AI 正在根据您的输入构建创业画像，请确保数据真实性
        </p>
      </div>
    </div>
  );
}

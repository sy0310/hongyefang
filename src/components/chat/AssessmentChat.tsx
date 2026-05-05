'use client';

import { useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { useRouter } from 'next/navigation';
import { DefaultChatTransport, type UIMessage } from 'ai';
import {
  conversationReducer,
  PARAMETER_ORDER,
  type ConversationState,
  type ParameterKey,
} from '@/lib/chat/state-machine';
import { createClient } from '@/lib/supabase/client';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ParameterCard } from '@/components/chat/ParameterCard';
import { ChatInput } from '@/components/chat/ChatInput';
import {
  createAssessment,
  getInProgressAssessment,
  saveChatMessages,
  completeAssessment,
} from '@/app/(chat)/assessment/actions';
import { Zap } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

const PARAMETER_KEY_TO_DB_COLUMN: Record<ParameterKey, string> = {
  annualCapital: 'annual_capital',
  weeklyTime: 'weekly_time',
  expectedReturn: 'expected_return',
  investmentAmount: 'investment_amount',
};

export function AssessmentChat() {
  const router = useRouter();
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [input, setInput] = useState('');
  const [restoredAssessment, setRestoredAssessment] = useState<{
    id: string;
    annual_capital: number | null;
    weekly_time: number | null;
    expected_return: number | null;
    investment_amount: number | null;
  } | null>(null);

  const initialState: ConversationState = {
    collected: {} as Record<ParameterKey, number>,
    currentParameter: null,
    followUpRounds: {} as Record<ParameterKey, number>,
    assessmentId: null,
    isComplete: false,
  };

  const [state, dispatch] = useReducer(conversationReducer, initialState);

  // Use refs so the transport can read current state values on each request
  const followUpRoundsRef = useRef(state.followUpRounds);
  const currentParameterRef = useRef(state.currentParameter);
  followUpRoundsRef.current = state.followUpRounds;
  currentParameterRef.current = state.currentParameter;

  const transportRef = useRef<DefaultChatTransport<UIMessage> | null>(null);
  if (!transportRef.current) {
    transportRef.current = new DefaultChatTransport<UIMessage>({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ body, ...req }) => ({
        ...req,
        body: {
          ...body,
          followUpRounds: followUpRoundsRef.current,
          currentParameter: currentParameterRef.current,
        },
      }),
    });
  }

  const { messages, sendMessage, status } = useChat<UIMessage>({
    transport: transportRef.current,
  });

  // Session resume: on mount, check for in-progress assessment
  useEffect(() => {
    async function checkResume() {
      const result = await getInProgressAssessment();
      if ('error' in result || !result.assessment) {
        const created = await createAssessment();
        if ('id' in created) {
          dispatch({ type: 'SET_ASSESEMENT_ID', id: created.id });
          dispatch({ type: 'START' });
        }
        return;
      }

      setRestoredAssessment(result.assessment);
      setShowResumePrompt(true);
    }
    checkResume();
  }, []);

  const handleResume = useCallback(() => {
    if (!restoredAssessment) return;
    dispatch({ type: 'SET_ASSESEMENT_ID', id: restoredAssessment.id });

    if (restoredAssessment.annual_capital !== null) {
      dispatch({ type: 'PARAMETER_COLLECTED', key: 'annualCapital', value: restoredAssessment.annual_capital });
    }
    if (restoredAssessment.weekly_time !== null) {
      dispatch({ type: 'PARAMETER_COLLECTED', key: 'weeklyTime', value: restoredAssessment.weekly_time });
    }
    if (restoredAssessment.expected_return !== null) {
      dispatch({ type: 'PARAMETER_COLLECTED', key: 'expectedReturn', value: restoredAssessment.expected_return });
    }
    if (restoredAssessment.investment_amount !== null) {
      dispatch({ type: 'PARAMETER_COLLECTED', key: 'investmentAmount', value: restoredAssessment.investment_amount });
    }
    setShowResumePrompt(false);
  }, [restoredAssessment]);

  const handleStartFresh = useCallback(async () => {
    setShowResumePrompt(false);
    setRestoredAssessment(null);
    const created = await createAssessment();
    if ('id' in created) {
      dispatch({ type: 'SET_ASSESEMENT_ID', id: created.id });
    }
    dispatch({ type: 'START' });
  }, []);

  // Parameter submit handler -- real-time save to Supabase
  const handleParameterSubmit = useCallback(async (value: number) => {
    if (!state.currentParameter || !state.assessmentId) return;
    const key = state.currentParameter;
    dispatch({ type: 'PARAMETER_COLLECTED', key, value });

    const supabase = createClient();
    const dbColumn = PARAMETER_KEY_TO_DB_COLUMN[key];
    const { error } = await supabase
      .from('assessments')
      .update({ [dbColumn]: value, updated_at: new Date().toISOString() })
      .eq('id', state.assessmentId);

    if (error) console.error('Failed to save parameter:', error.message);
  }, [state.currentParameter, state.assessmentId]);

  // Batch save chat_messages on completion + redirect to /result
  useEffect(() => {
    if (!state.isComplete || !state.assessmentId) return;

    async function onComplete() {
      await completeAssessment(state.assessmentId!);

      const messagesToSave = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.parts
          .filter(p => p.type === 'text')
          .map(p => p.text)
          .join(''),
      }));

      if (messagesToSave.length > 0) {
        const saveResult = await saveChatMessages(state.assessmentId!, messagesToSave);
        if ('error' in saveResult) {
          console.error('Failed to save chat messages:', saveResult.error);
        }
      }

      router.push('/result');
    }

    onComplete();
  }, [state.isComplete, state.assessmentId, messages, router]);

  const handleSend = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || status === 'streaming') return;
    sendMessage({ text: input });
    setInput('');
  }, [input, status, sendMessage]);

  // Session resume prompt UI
  if (showResumePrompt) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg px-4">
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

  return (
    <div className="flex-1 flex flex-col bg-bg relative">
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
                state.collected[key] !== undefined ? 'bg-accent' : 'bg-border-light'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            role={m.role === 'user' ? 'user' : 'assistant'}
            content={m.parts
              .filter((p) => p.type === 'text')
              .map((p) => p.text)
              .join('')}
            isStreaming={status === 'streaming' && m.role === 'assistant'}
          />
        ))}

        {state.currentParameter &&
          state.collected[state.currentParameter] === undefined && (
            <ParameterCard
              parameterKey={state.currentParameter}
              value={state.collected[state.currentParameter] ?? null}
              onSubmit={handleParameterSubmit}
            />
          )}

        {Object.entries(state.collected).map(([key, value]) => (
          <ParameterCard
            key={key}
            parameterKey={key as ParameterKey}
            value={value}
            onSubmit={() => {}}
          />
        ))}
      </div>

      {/* Input Area */}
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

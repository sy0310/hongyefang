'use client';

import { Sparkles } from 'lucide-react'

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2 mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mb-1">
          <Sparkles className="text-accent w-4 h-4" />
        </div>
      )}
      <div
        className={`max-w-[85%] px-4 py-3 text-[15px] leading-[1.6] shadow-sm transition-all duration-300 ${
          isUser
            ? 'bg-accent text-white rounded-2xl rounded-br-none font-medium'
            : 'bg-surface border border-border text-text rounded-2xl rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {isStreaming && (
          <div className="flex gap-1 mt-2">
            <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce" />
          </div>
        )}
      </div>
    </div>
  );
}

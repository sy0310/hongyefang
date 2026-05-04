'use client';

import { Send } from 'lucide-react'

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isStreaming: boolean;
}

export function ChatInput({ value, onChange, onSubmit, isStreaming }: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="relative flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="输入您的问题..."
        className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all pr-12"
        disabled={isStreaming}
      />
      <button
        type="submit"
        disabled={isStreaming || !value.trim()}
        className="absolute right-1.5 w-9 h-9 bg-accent text-white rounded-lg flex items-center justify-center shadow-lg shadow-accent/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
      >
        <Send size={18} />
      </button>
    </form>
  );
}

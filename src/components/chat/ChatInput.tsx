'use client';

import { Send } from 'lucide-react'

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="relative flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={isLoading ? "AI 思考中..." : "输入您的问题..."}
        className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all pr-12 disabled:opacity-70"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="absolute right-1.5 w-9 h-9 bg-accent text-white rounded-lg flex items-center justify-center shadow-lg shadow-accent/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
      >
        <Send size={18} className={isLoading ? "animate-pulse" : ""} />
      </button>
    </form>

  );
}

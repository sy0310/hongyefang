'use client';

import { Button } from '@/components/ui/Button';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isStreaming: boolean;
}

export function ChatInput({ value, onChange, onSubmit, isStreaming }: ChatInputProps) {
  return (
    <div className="border-t border-border/50 bg-card px-4 py-4 pb-8">
      <form onSubmit={onSubmit} className="flex gap-2 items-center max-w-2xl mx-auto bg-background rounded-2xl border border-border/50 px-2 py-1 shadow-inner">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="输入你的回答..."
          disabled={isStreaming}
          className="flex-1 px-3 py-2 bg-transparent text-sm focus:outline-none disabled:opacity-50"
        />
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isStreaming} 
          className="w-auto px-6 py-2 rounded-xl"
        >
          发送
        </Button>
      </form>
    </div>
  );
}

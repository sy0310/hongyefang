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
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <form onSubmit={onSubmit} className="flex gap-2 items-end max-w-2xl mx-auto">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="输入你的回答..."
          disabled={isStreaming}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <Button type="submit" variant="primary" disabled={isStreaming} className="w-auto px-4">
          发送
        </Button>
      </form>
    </div>
  );
}

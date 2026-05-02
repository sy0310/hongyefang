'use client';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-primary text-white rounded-2xl rounded-br-none font-medium'
            : 'bg-card border border-border/50 text-foreground rounded-2xl rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {isStreaming && (
          <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full ml-1 animate-pulse" />
        )}
      </div>
    </div>
  );
}

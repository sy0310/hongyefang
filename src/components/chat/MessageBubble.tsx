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
        className={`max-w-[80%] px-4 py-2 text-sm rounded-2xl ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
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

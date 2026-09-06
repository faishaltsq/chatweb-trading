'use client';

import { type UIMessage } from 'ai';
import { Bot, User } from 'lucide-react';
import MarkdownRenderer from './markdown-renderer';
import ThinkingBlock from './thinking-block';

interface MessageItemProps {
  message: UIMessage;
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} group animate-messageIn`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center flex-shrink-0 mt-1 border hairline border-[var(--accent-dim)]">
          <Bot size={14} className="text-[var(--accent)]" />
        </div>
      )}

      <div
        className={`max-w-[80%] ${
          isUser
            ? 'bg-[var(--bg-elevated)] border hairline border-[var(--border-bright)] text-white rounded-2xl rounded-tr-md px-4 py-3'
            : 'text-[var(--text-primary)]'
        }`}
      >
        {message.parts.map((part, i) => {
          if (part.type === 'text') {
            const cleanText = part.text
              .replace(/\[Image \d+\]\s*/g, '')
              .trim();
            if (!cleanText) return null;

            return isUser ? (
              <div key={i} className="text-sm leading-6 whitespace-pre-wrap">
                {cleanText}
              </div>
            ) : (
              <div key={i} className="text-sm prose-invert max-w-none">
                <MarkdownRenderer content={cleanText} />
              </div>
            );
          }

          if (part.type === 'reasoning') {
            return <ThinkingBlock key={i} content={part.text} />;
          }

          if (part.type === 'file' && part.mediaType?.startsWith('image/')) {
            return (
              <div key={i} className="mt-2">
                <img
                  src={part.url}
                  alt="chart"
                  className="max-w-full rounded-xl border hairline border-[var(--border)] max-h-96 object-contain"
                />
              </div>
            );
          }

          return null;
        })}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full bg-[var(--bg-hover)] flex items-center justify-center flex-shrink-0 mt-1 border hairline border-[var(--border)]">
          <User size={14} className="text-[var(--text-secondary)]" />
        </div>
      )}
    </div>
  );
}

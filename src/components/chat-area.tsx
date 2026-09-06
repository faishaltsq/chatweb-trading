'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { TrendingUp, Sparkles } from 'lucide-react';
import MessageItem from './message-item';
import InputBar from './input-bar';
import {
  getMessages,
  saveMessages,
  updateConversationTitle,
} from '@/lib/conversations';

interface ChatAreaProps {
  conversationId: string;
  onTitleUpdate: () => void;
}

function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active) {
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
      return;
    }

    let cancelled = false;

    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((lock) => {
        if (cancelled) { lock.release(); return; }
        lockRef.current = lock;
      }).catch(() => {});
    }

    let lockRelease: (() => void) | null = null;
    if ('locks' in navigator) {
      const lockName = `chatweb-streaming-${Date.now()}`;
      navigator.locks.request(lockName, { mode: 'exclusive' }, () => {
        return new Promise<void>((resolve) => {
          lockRelease = resolve;
        });
      }).catch(() => {});
    }

    return () => {
      cancelled = true;
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
      lockRelease?.();
    };
  }, [active]);
}

export default function ChatArea({ conversationId, onTitleUpdate }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const titleSetRef = useRef(false);

  const { messages, sendMessage, status } = useChat({
    id: conversationId,
    messages: getMessages(conversationId) as UIMessage[],
    transport: new DefaultChatTransport({
      api: '/api/chat',
      fetch: (input, init) => {
        const { signal, ...rest } = init || {};
        void signal;
        return fetch(input, rest);
      },
    }),
  });

  useEffect(() => {
    titleSetRef.current = false;
  }, [conversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(conversationId, messages);
    }
    if (!titleSetRef.current && messages.length >= 2) {
      const firstUser = messages.find((m) => m.role === 'user');
      if (firstUser) {
        const textPart = firstUser.parts.find((p) => p.type === 'text');
        if (textPart && textPart.type === 'text' && textPart.text.trim()) {
          const title = textPart.text.slice(0, 50).trim();
          updateConversationTitle(conversationId, title);
          onTitleUpdate();
          titleSetRef.current = true;
        }
      }
    }
  }, [messages, conversationId, onTitleUpdate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSend = useCallback(
    (text: string, files?: FileList) => {
      sendMessage({ text, files });
    },
    [sendMessage]
  );

  const isStreaming = status === 'streaming' || status === 'submitted';
  useWakeLock(isStreaming);

  const showDots = isStreaming && messages[messages.length - 1]?.role === 'user';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-16">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center mb-5 border border-[var(--accent-dim)]">
              <Sparkles size={24} className="text-[var(--accent)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Trading Analysis AI</h2>
            <p className="text-[var(--text-secondary)] text-sm max-w-md leading-6 mb-6">
              Send a chart screenshot or describe a trading scenario.
            </p>
            <div className="grid grid-cols-2 gap-2.5 max-w-lg w-full">
              {[
                'Analyze this chart and identify key support/resistance levels',
                'What is the best entry for a BUY position on XAUUSD?',
                'Identify the trend and suggest a trade setup with RR table',
                'Analyze price action and give me entry, SL, and TP levels',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="group text-left text-xs text-[var(--text-secondary)] hover:text-white p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--accent-dim)] hover:bg-[var(--accent-subtle)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            {showDots && (
              <div className="flex gap-3 items-center animate-messageIn">
                <div className="w-7 h-7 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center flex-shrink-0 border border-[var(--accent-dim)]">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                        style={{ animation: 'pulseGlow 1.2s ease-in-out infinite', animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <InputBar onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}

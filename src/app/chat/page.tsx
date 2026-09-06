'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/components/sidebar';
import ChatArea from '@/components/chat-area';
import { type Conversation, createConversation } from '@/lib/conversations';
import { Menu, Activity } from 'lucide-react';

export default function ChatPage() {
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleSelect(conv: Conversation) {
    setActiveConv(conv);
    setMobileMenuOpen(false);
  }

  function handleNew(conv: Conversation) {
    setActiveConv(conv);
    setMobileMenuOpen(false);
  }

  function handleStart() {
    const conv = createConversation('New Chat');
    setActiveConv(conv);
    setRefreshTrigger((t) => t + 1);
  }

  const handleTitleUpdate = useCallback(() => {
    setRefreshTrigger((t) => t + 1);
  }, []);

  return (
    <div className="flex h-dvh bg-[var(--bg-root)] text-[var(--text-primary)] overflow-hidden">
      <div className="hidden md:flex">
        <Sidebar
          activeId={activeConv?.id || null}
          onSelect={handleSelect}
          onNew={handleNew}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 animate-slideInLeft">
            <Sidebar
              activeId={activeConv?.id || null}
              onSelect={handleSelect}
              onNew={handleNew}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-5 py-3 border-b hairline border-[var(--border)] glass">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-xl hover:bg-white/8 text-[var(--text-secondary)] transition-colors"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2.5 md:hidden">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center border hairline border-[var(--accent-dim)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <span className="font-semibold text-sm tracking-tight">TradingChat</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bull)]/10 text-[var(--bull)] text-[10px] font-medium">
                <Activity size={10} />
                Live
              </span>
              <span>Gemini Vision + Claude Sonnet</span>
            </div>
          </div>
        </header>

        {activeConv ? (
          <ChatArea
            key={activeConv.id}
            conversationId={activeConv.id}
            onTitleUpdate={handleTitleUpdate}
          />
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 px-4 text-center tv-grid-bg">
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center border hairline border-[var(--accent-dim)]">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <div className="absolute -inset-4 rounded-3xl bg-[var(--accent-glow)] blur-2xl -z-10" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">TradingChat AI</h1>
            <p className="text-[var(--text-secondary)] text-sm max-w-md mb-8 leading-6">
              AI-powered chart analysis. Send screenshots — Gemini analyzes the image,
              Claude delivers precise trade setups with entry, SL, and TP levels.
            </p>
            <div className="flex items-center gap-6 mb-8 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--info)]" />
                Gemini Vision
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                Claude Sonnet
              </span>
            </div>
            <button
              onClick={handleStart}
              className="px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-[0_0_24px_var(--accent-glow)]"
            >
              Start New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Home,
} from 'lucide-react';
import {
  type Conversation,
  getConversations,
  createConversation,
  deleteConversation,
} from '@/lib/conversations';

interface SidebarProps {
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
  onNew: (conv: Conversation) => void;
  refreshTrigger: number;
}

export default function Sidebar({
  activeId,
  onSelect,
  onNew,
  refreshTrigger,
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setConversations(getConversations());
  }, [refreshTrigger]);

  function handleNew() {
    const conv = createConversation('New Chat');
    setConversations(getConversations());
    onNew(conv);
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteConversation(id);
    setConversations(getConversations());
  }

  function formatDate(ts: number) {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return (
    <div
      className="flex flex-col flex-shrink-0 border-r hairline border-[var(--border)] bg-[var(--bg-surface)] transition-all duration-300 overflow-hidden"
      style={{ width: collapsed ? '56px' : '260px' }}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b hairline border-[var(--border)] min-h-[57px]">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center border hairline border-[var(--accent-dim)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-[var(--text-primary)] tracking-tight">TradingChat</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl hover:bg-white/8 text-[var(--text-secondary)] hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className={`px-3 py-3 space-y-1.5 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        <button
          onClick={handleNew}
          className={`flex items-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/85 text-white transition-all duration-200 text-sm font-medium shadow-[0_0_16px_var(--accent-glow)] ${
            collapsed ? 'p-2.5 justify-center' : 'w-full px-3 py-2.5'
          }`}
          title="New Analysis"
        >
          <Plus size={16} />
          {!collapsed && 'New Analysis'}
        </button>
        <a
          href="/"
          className={`flex items-center gap-2 rounded-xl hover:bg-white/5 text-[var(--text-secondary)] hover:text-white transition-colors text-sm ${
            collapsed ? 'p-2.5 justify-center' : 'w-full px-3 py-2.5'
          }`}
          title="Home"
        >
          <Home size={16} />
          {!collapsed && 'Home'}
        </a>
        <a
          href="/journal"
          className={`flex items-center gap-2 rounded-xl hover:bg-white/5 text-[var(--text-secondary)] hover:text-white transition-colors text-sm ${
            collapsed ? 'p-2.5 justify-center' : 'w-full px-3 py-2.5'
          }`}
          title="Trading Journal"
        >
          <BookOpen size={16} />
          {!collapsed && 'Trading Journal'}
        </a>
      </div>

      {!collapsed && (
        <>
          <div className="px-4 pt-2 pb-1">
            <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-widest">History</span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 scrollbar-thin">
            {conversations.length === 0 && (
              <div className="text-center text-[var(--text-muted)] text-xs py-8 px-4">
                No conversations yet
              </div>
            )}
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelect(conv)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelect(conv); }}
                className={`group flex items-start justify-between w-full px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                  activeId === conv.id
                    ? 'bg-[var(--accent-subtle)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <MessageSquare size={14} className="mt-0.5 flex-shrink-0 opacity-40" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate max-w-[160px]">{conv.title}</div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{formatDate(conv.updatedAt)}</div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[var(--bear)]/15 hover:text-[var(--bear)] transition-all flex-shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

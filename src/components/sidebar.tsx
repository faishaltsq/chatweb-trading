'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BookOpen,
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
      className="flex flex-col flex-shrink-0 border-r border-[var(--border)] bg-[var(--bg-surface)] transition-all duration-200 overflow-hidden"
      style={{ width: collapsed ? '56px' : '256px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)] min-h-[57px]">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center border border-[var(--accent-dim)]">
              <TrendingUp size={14} className="text-[var(--accent)]" />
            </div>
            <span className="font-semibold text-sm text-[var(--text-primary)]">TradingChat</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Actions */}
      <div className={`px-3 py-3 space-y-1.5 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        <button
          onClick={handleNew}
          className={`flex items-center gap-2 rounded-lg bg-[var(--accent-subtle)] hover:bg-[var(--accent-glow)] text-[var(--accent)] transition-all duration-200 text-sm font-medium border border-[var(--accent-dim)] hover:border-[var(--accent)] hover:shadow-[0_0_12px_var(--accent-glow)] ${
            collapsed ? 'p-2.5 justify-center' : 'w-full px-3 py-2.5'
          }`}
          title="New Analysis"
        >
          <Plus size={16} />
          {!collapsed && 'New Analysis'}
        </button>
        <a
          href="/journal"
          className={`flex items-center gap-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-white transition-colors text-sm border border-[var(--border)] ${
            collapsed ? 'p-2.5 justify-center' : 'w-full px-3 py-2.5'
          }`}
          title="Trading Journal"
        >
          <BookOpen size={16} />
          {!collapsed && 'Trading Journal'}
        </a>
      </div>

      {/* Conversation list */}
      {!collapsed && (
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
              className={`group flex items-start justify-between w-full px-3 py-2.5 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                activeId === conv.id
                  ? 'bg-white/8 text-white border-l-2 border-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <MessageSquare size={14} className="mt-0.5 flex-shrink-0 opacity-50" />
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate max-w-[160px]">{conv.title}</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{formatDate(conv.updatedAt)}</div>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-all flex-shrink-0"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

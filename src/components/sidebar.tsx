'use client';

import { useEffect, useState, useRef } from 'react';
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

  function handleDelete(id: string) {
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
      className="flex flex-col flex-shrink-0 border-r hairline border-[var(--border)] bg-[var(--bg-surface)]/95 backdrop-blur-xl transition-all duration-300 overflow-hidden select-none"
      style={{ width: collapsed ? '56px' : 'min(260px, 85vw)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 sm:px-4 py-3.5 sm:py-4 border-b hairline border-[var(--border)] min-h-[57px]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-7 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center border hairline border-[var(--accent-dim)] flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-[var(--text-primary)] tracking-tight truncate">TradingChat</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="min-w-[36px] min-h-[36px] rounded-xl hover:bg-white/8 text-[var(--text-secondary)] hover:text-white transition-colors flex items-center justify-center touch-manipulation"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Action Navigation */}
      <div className={`px-2.5 sm:px-3 py-2.5 sm:py-3 space-y-1.5 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        <button
          onClick={handleNew}
          className={`flex items-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/85 text-white transition-all duration-200 text-sm font-medium shadow-[0_0_16px_var(--accent-glow)] touch-manipulation ${
            collapsed ? 'size-10 justify-center p-0' : 'w-full px-3 py-2.5 min-h-[42px]'
          }`}
          title="New Analysis"
        >
          <Plus size={16} />
          {!collapsed && 'New Analysis'}
        </button>
        <a
          href="/"
          className={`flex items-center gap-2 rounded-xl hover:bg-white/5 text-[var(--text-secondary)] hover:text-white transition-colors text-sm touch-manipulation ${
            collapsed ? 'size-10 justify-center p-0' : 'w-full px-3 py-2.5 min-h-[42px]'
          }`}
          title="Home"
        >
          <Home size={16} />
          {!collapsed && 'Home'}
        </a>
        <a
          href="/journal"
          className={`flex items-center gap-2 rounded-xl hover:bg-white/5 text-[var(--text-secondary)] hover:text-white transition-colors text-sm touch-manipulation ${
            collapsed ? 'size-10 justify-center p-0' : 'w-full px-3 py-2.5 min-h-[42px]'
          }`}
          title="Trading Journal"
        >
          <BookOpen size={16} />
          {!collapsed && 'Trading Journal'}
        </a>
      </div>

      {/* History Section */}
      {!collapsed && (
        <>
          <div className="px-4 pt-2 pb-1 flex items-center justify-between">
            <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-widest">History</span>
            <span className="text-[9px] text-[var(--text-muted)] sm:hidden">Swipe to delete</span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 scrollbar-thin">
            {conversations.length === 0 && (
              <div className="text-center text-[var(--text-muted)] text-xs py-8 px-4">
                No conversations yet
              </div>
            )}
            {conversations.map((conv) => (
              <SwipeableConversationItem
                key={conv.id}
                conv={conv}
                isActive={activeId === conv.id}
                onSelect={() => onSelect(conv)}
                onDelete={() => handleDelete(conv.id)}
                formatDate={formatDate}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Swipe-to-delete item on mobile, hover-delete on desktop
function SwipeableConversationItem({
  conv,
  isActive,
  onSelect,
  onDelete,
  formatDate,
}: {
  conv: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  formatDate: (ts: number) => string;
}) {
  const [offsetX, setOffsetX] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Only swipe if movement is predominantly horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isSwiping.current = true;
      // Only allow dragging to the left (negative deltaX) up to -72px
      if (deltaX < 0) {
        setOffsetX(Math.max(deltaX, -72));
      } else {
        setOffsetX(0);
      }
    }
  };

  const handleTouchEnd = () => {
    if (offsetX < -40) {
      // Snap open to show delete
      setOffsetX(-60);
    } else {
      // Snap closed
      setOffsetX(0);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleClick = () => {
    if (offsetX < 0) {
      // Reset swipe if open
      setOffsetX(0);
    } else {
      onSelect();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background delete action revealed by swipe */}
      <div className="absolute inset-y-0 right-0 w-16 bg-[var(--bear)] flex items-center justify-center rounded-r-xl">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="size-full flex items-center justify-center text-white active:bg-black/20 touch-manipulation"
          title="Delete conversation"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Foreground card */}
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping.current ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') onSelect(); }}
        className={`group relative flex items-start justify-between w-full px-3 py-2.5 rounded-xl text-left cursor-pointer select-none bg-[var(--bg-surface)] ${
          isActive
            ? 'bg-[var(--accent-subtle)] text-white'
            : 'text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-white'
        }`}
      >
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <MessageSquare size={14} className="mt-0.5 flex-shrink-0 opacity-40" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium truncate">{conv.title}</div>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">{formatDate(conv.updatedAt)}</div>
          </div>
        </div>

        {/* Desktop hover delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="hidden sm:flex opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[var(--bear)]/15 hover:text-[var(--bear)] transition-all flex-shrink-0 touch-manipulation"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

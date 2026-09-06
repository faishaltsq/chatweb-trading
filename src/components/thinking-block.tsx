'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Brain } from 'lucide-react';

interface ThinkingBlockProps {
  content: string;
}

export default function ThinkingBlock({ content }: ThinkingBlockProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-2 rounded-lg border border-[var(--warning)]/20 bg-[var(--warning)]/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 text-[var(--warning)] text-xs font-medium hover:bg-[var(--warning)]/10 transition-colors"
      >
        <Brain size={14} />
        <span>Thinking</span>
        <ChevronDown size={14} className={`ml-auto transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
      </button>
      <div className={`grid-expand ${open ? 'open' : ''}`}>
        <div>
          <div className="px-3 pb-3 text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-5 border-t border-[var(--warning)]/10 pt-2">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

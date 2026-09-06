'use client';

import { useState } from 'react';
import { ChevronDown, Scan } from 'lucide-react';

interface GeminiAnalysisProps {
  content: string;
}

export default function GeminiAnalysis({ content }: GeminiAnalysisProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-3 rounded-lg border border-[var(--info)]/20 bg-[var(--info)]/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 text-[var(--info)] text-xs font-medium hover:bg-[var(--info)]/10 transition-colors"
      >
        <Scan size={14} />
        <span>Chart Analysis (Gemini Vision)</span>
        <ChevronDown size={14} className={`ml-auto transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
      </button>
      <div className={`grid-expand ${open ? 'open' : ''}`}>
        <div>
          <div className="px-3 pb-3 text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-5 border-t border-[var(--info)]/10 pt-2 max-h-80 overflow-y-auto scrollbar-thin">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

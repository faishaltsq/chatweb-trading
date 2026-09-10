'use client';

// ponytail: native modal lightbox without external library. Add zoom/pan gestures if mobile touch pinch requested.

import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export default function ChartImageModal({ open, onClose, imageUrl, title }: Props) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-[var(--bg-surface)] border hairline border-[var(--border-bright)] rounded-2xl overflow-hidden shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b hairline border-[var(--border)] bg-[var(--bg-elevated)]/80">
          <span className="font-mono text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate pr-2">
            {title || 'Chart Screenshot'}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-white/8 text-[var(--text-muted)] hover:text-white transition-colors"
              title="Buka di tab baru"
            >
              <ExternalLink size={15} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/8 text-[var(--text-muted)] hover:text-white transition-colors"
              title="Tutup (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Image display */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-[#080b0f] min-h-[240px]">
          <img
            src={imageUrl}
            alt={title || 'Chart Screenshot'}
            className="max-h-[80vh] max-w-full object-contain rounded-lg border hairline border-[var(--border)]"
          />
        </div>
      </div>
    </div>
  );
}

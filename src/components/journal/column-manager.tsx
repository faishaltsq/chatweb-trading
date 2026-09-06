'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { type CustomColumn } from '@/lib/journal/schema';

interface ColumnManagerProps {
  columns: CustomColumn[];
  onAdd: (name: string, type: string) => void;
  onDelete: (id: string) => void;
}

export default function ColumnManager({ columns, onAdd, onDelete }: ColumnManagerProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleAdd() {
    if (!name.trim()) return;
    onAdd(name.trim(), type);
    setName('');
    setType('text');
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 min-h-[36px] rounded-xl text-xs text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border hairline border-[var(--border)] transition-colors touch-manipulation"
        title="Custom Columns"
      >
        <Plus size={14} /> <span className="hidden sm:inline">Custom Column</span><span className="sm:hidden">Column</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-24px)] sm:w-72 max-w-[320px] bg-[var(--bg-elevated)] border hairline border-[var(--border-bright)] rounded-2xl shadow-2xl z-50 p-4 animate-dropIn">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Custom Columns</span>
            <button
              onClick={() => setOpen(false)}
              className="min-w-[30px] min-h-[30px] rounded-lg text-[var(--text-muted)] hover:text-white transition-colors flex items-center justify-center touch-manipulation"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>

          {columns.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {columns.map((col) => (
                <div key={col.id} className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-primary)]">{col.name}</span>
                    <span className="text-[10px] px-1.5 rounded-md bg-white/8 text-[var(--text-muted)]">{col.type}</span>
                  </div>
                  <button
                    onClick={() => onDelete(col.id)}
                    className="min-w-[28px] min-h-[28px] rounded-lg hover:bg-[var(--bear)]/15 text-[var(--text-muted)] hover:text-[var(--bear)] transition-colors flex items-center justify-center touch-manipulation"
                    title="Delete column"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 border-t hairline border-[var(--border)] pt-3">
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Column name..."
              className="w-full bg-[var(--bg-surface)] border hairline border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all duration-200"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            />
            <div className="flex gap-2">
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="flex-1 bg-[var(--bg-surface)] border hairline border-[var(--border)] rounded-xl px-2 py-2 text-xs text-[var(--text-primary)] outline-none">
                <option value="text">Text</option>
                <option value="number">Number</option>
              </select>
              <button
                onClick={handleAdd}
                className="px-4 py-2 min-h-[36px] rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/85 text-white text-xs font-semibold transition-all duration-200 touch-manipulation"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border border-[var(--border)] transition-colors"
      >
        <Plus size={14} /> Custom Column
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-[var(--bg-elevated)] border border-[var(--border-bright)] rounded-xl shadow-2xl z-50 p-4 animate-dropIn">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Custom Columns</span>
            <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          {columns.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {columns.map((col) => (
                <div key={col.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-primary)]">{col.name}</span>
                    <span className="text-[10px] px-1 rounded bg-white/10 text-[var(--text-muted)]">{col.type}</span>
                  </div>
                  <button onClick={() => onDelete(col.id)}
                    className="p-0.5 rounded hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 border-t border-[var(--border)] pt-3">
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Column name..."
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_8px_var(--accent-glow)] transition-all duration-200"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            />
            <div className="flex gap-2">
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none">
                <option value="text">Text</option>
                <option value="number">Number</option>
              </select>
              <button onClick={handleAdd}
                className="px-3 py-1.5 rounded-lg bg-[var(--accent)] hover:brightness-110 text-[var(--bg-root)] text-xs font-semibold transition-all duration-200">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

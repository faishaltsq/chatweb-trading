'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { PAIRS, STATUSES, DIRECTIONS } from '@/lib/journal/constants';

export interface FilterState {
  pair: string;
  status: string;
  direction: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

export const emptyFilter: FilterState = {
  pair: '', status: '', direction: '', dateFrom: '', dateTo: '', search: '',
};

interface FilterBarProps {
  filter: FilterState;
  onChange: (f: FilterState) => void;
}

export default function FilterBar({ filter, onChange }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const hasFilter = Object.values(filter).some((v) => v !== '');

  function set(key: keyof FilterState, val: string) {
    onChange({ ...filter, [key]: val });
  }

  function clear() {
    onChange(emptyFilter);
  }

  return (
    <div className="space-y-2 flex-1">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={filter.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_1px_var(--accent-dim),0_0_12px_var(--accent-glow)] transition-all duration-200"
          />
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-all duration-200 ${
            hasFilter
              ? 'text-[var(--accent)] bg-[var(--accent-subtle)] border-[var(--accent-dim)]'
              : 'text-[var(--text-secondary)] border-[var(--border)] hover:bg-white/5'
          }`}
        >
          <Filter size={14} /> Filters {hasFilter && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
        </button>
        {hasFilter && (
          <button onClick={clear}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-[var(--border)] transition-colors">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <div className={`grid-expand ${expanded ? 'open' : ''}`}>
        <div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl">
            <div>
              <label className="text-[11px] text-[var(--text-muted)] block mb-1 font-medium">Pair</label>
              <select value={filter.pair} onChange={(e) => set('pair', e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors">
                <option value="">All</option>
                {PAIRS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--text-muted)] block mb-1 font-medium">Status</label>
              <select value={filter.status} onChange={(e) => set('status', e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors">
                <option value="">All</option>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--text-muted)] block mb-1 font-medium">Direction</label>
              <select value={filter.direction} onChange={(e) => set('direction', e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors">
                <option value="">All</option>
                {DIRECTIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--text-muted)] block mb-1 font-medium">From</label>
              <input type="date" value={filter.dateFrom} onChange={(e) => set('dateFrom', e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--text-muted)] block mb-1 font-medium">To</label>
              <input type="date" value={filter.dateTo} onChange={(e) => set('dateTo', e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

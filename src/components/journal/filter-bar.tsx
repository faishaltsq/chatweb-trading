'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { STATUSES, DIRECTIONS } from '@/lib/journal/constants';

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
  availablePairs?: string[];
}

export default function FilterBar({ filter, onChange, availablePairs = [] }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const hasFilter = Object.values(filter).some((v) => v !== '');

  function set(key: keyof FilterState, val: string) {
    onChange({ ...filter, [key]: val });
  }

  function clear() {
    onChange(emptyFilter);
  }

  return (
    <div className="space-y-2 flex-1 w-full">
      <div className="flex gap-1.5 sm:gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            value={filter.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Search trades..."
            className="w-full bg-[var(--bg-surface)] border hairline border-[var(--border)] rounded-xl pl-9 pr-3 py-2 min-h-[38px] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all duration-200"
          />
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl text-xs border hairline transition-all duration-200 touch-manipulation ${
            hasFilter
              ? 'text-[var(--accent)] bg-[var(--accent-subtle)] border-[var(--accent-dim)]'
              : 'text-[var(--text-secondary)] border-[var(--border)] hover:bg-white/5'
          }`}
        >
          <Filter size={14} /> <span>Filters</span> {hasFilter && <span className="size-1.5 rounded-full bg-[var(--accent)]" />}
        </button>
        {hasFilter && (
          <button
            onClick={clear}
            className="flex items-center justify-center gap-1 px-3 py-2 min-h-[38px] rounded-xl text-xs text-[var(--bear)] hover:bg-[var(--bear)]/10 border hairline border-[var(--border)] transition-colors touch-manipulation"
          >
            <X size={14} /> <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      <div className={`grid-expand ${expanded ? 'open' : ''}`}>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 p-3 bg-[var(--bg-surface)] border hairline border-[var(--border)] rounded-2xl">
            <div>
              <label className="text-[10px] text-[var(--text-muted)] block mb-1 font-medium uppercase tracking-wider">Pair</label>
              <select value={filter.pair} onChange={(e) => set('pair', e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border hairline border-[var(--border)] rounded-xl px-2.5 py-1.5 min-h-[36px] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors">
                <option value="">All Pairs</option>
                {availablePairs.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[var(--text-muted)] block mb-1 font-medium uppercase tracking-wider">Status</label>
              <select value={filter.status} onChange={(e) => set('status', e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border hairline border-[var(--border)] rounded-xl px-2.5 py-1.5 min-h-[36px] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors">
                <option value="">All Statuses</option>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[var(--text-muted)] block mb-1 font-medium uppercase tracking-wider">Direction</label>
              <select value={filter.direction} onChange={(e) => set('direction', e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border hairline border-[var(--border)] rounded-xl px-2.5 py-1.5 min-h-[36px] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors">
                <option value="">All Directions</option>
                {DIRECTIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[var(--text-muted)] block mb-1 font-medium uppercase tracking-wider">From Date</label>
              <input type="date" value={filter.dateFrom} onChange={(e) => set('dateFrom', e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border hairline border-[var(--border)] rounded-xl px-2.5 py-1.5 min-h-[36px] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-[var(--text-muted)] block mb-1 font-medium uppercase tracking-wider">To Date</label>
              <input type="date" value={filter.dateTo} onChange={(e) => set('dateTo', e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border hairline border-[var(--border)] rounded-xl px-2.5 py-1.5 min-h-[36px] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

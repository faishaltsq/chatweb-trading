'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, ArrowLeft, Download, Upload, FileSpreadsheet, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import JournalTable from '@/components/journal/journal-table';
import JournalStats from '@/components/journal/journal-stats';
import JournalCharts from '@/components/journal/journal-charts';
import TradeModal from '@/components/journal/trade-modal';
import FilterBar, { type FilterState, emptyFilter } from '@/components/journal/filter-bar';
import ColumnManager from '@/components/journal/column-manager';
import ImportModal from '@/components/journal/import-modal';
import { type Trade } from '@/lib/journal/schema';
import { type CustomColumn } from '@/lib/journal/schema';
import { type TradeFormData } from '@/lib/journal/constants';
import AuthModal from '@/components/auth/auth-modal';

export default function JournalPage() {
  const { data: session, status } = useSession();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [columns, setColumns] = useState<CustomColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
  const [filter, setFilter] = useState<FilterState>(emptyFilter);
  const [customVals, setCustomVals] = useState<Record<string, Record<string, string>>>({});
  const [showCharts, setShowCharts] = useState(false);
  const [savedPairs, setSavedPairs] = useState<string[]>([]);

  // Load saved custom pairs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('journal_saved_pairs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSavedPairs(parsed);
      }
    } catch { /* */ }
  }, []);

  const fetchTrades = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter.pair) params.set('pair', filter.pair);
      if (filter.status) params.set('status', filter.status);
      if (filter.direction) params.set('direction', filter.direction);
      if (filter.dateFrom) params.set('dateFrom', filter.dateFrom);
      if (filter.dateTo) params.set('dateTo', filter.dateTo);
      if (filter.search) params.set('search', filter.search);

      const res = await fetch(`/api/journal/trades?${params}`);
      const data = await res.json();
      setTrades(data);
    } catch (err) {
      console.error('Failed to fetch trades:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchColumns = useCallback(async () => {
    try {
      const res = await fetch('/api/journal/columns');
      setColumns(await res.json());
    } catch { /* */ }
  }, []);

  const fetchCustomValues = useCallback(async () => {
    try {
      const res = await fetch('/api/journal/values');
      setCustomVals(await res.json());
    } catch { /* */ }
  }, []);

  useEffect(() => {
    fetchTrades();
    fetchColumns();
    fetchCustomValues();
  }, [fetchTrades, fetchColumns, fetchCustomValues]);

  // Merge pairs from all trades (unfiltered) + saved custom pairs
  const allPairs = useMemo(() => {
    const fromTrades = trades.map((t) => t.pair).filter(Boolean);
    const merged = Array.from(new Set([...savedPairs, ...fromTrades])).sort();
    return merged;
  }, [trades, savedPairs]);

  // Persist new pairs to localStorage whenever allPairs grows
  useEffect(() => {
    if (allPairs.length === 0) return;
    try {
      localStorage.setItem('journal_saved_pairs', JSON.stringify(allPairs));
      setSavedPairs(allPairs);
    } catch { /* */ }
  }, [allPairs]);

  async function handleSave(data: TradeFormData) {
    if (editTrade) {
      await fetch(`/api/journal/trades/${editTrade.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/journal/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    setEditTrade(null);
    fetchTrades();
  }

  function handleEdit(trade: Trade) {
    setEditTrade(trade);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/journal/trades/${id}`, { method: 'DELETE' });
    fetchTrades();
  }

  async function handleInlineUpdate(id: string, field: string, value: unknown) {
    await fetch(`/api/journal/trades/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    fetchTrades();
  }

  async function handleCustomValueUpdate(tradeId: string, columnId: string, value: string) {
    await fetch('/api/journal/values', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tradeId, columnId, value }),
    });
    fetchCustomValues();
  }

  async function handleAddColumn(name: string, type: string) {
    await fetch('/api/journal/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type }),
    });
    fetchColumns();
  }

  async function handleDeleteColumn(id: string) {
    await fetch('/api/journal/columns', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchColumns();
  }

  async function handleImport(importedTrades: Record<string, unknown>[]) {
    for (const t of importedTrades) {
      await fetch('/api/journal/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
      });
    }
    fetchTrades();
  }

  async function handleExport() {
    const { exportTradesXLSX } = await import('@/lib/journal/excel');
    exportTradesXLSX(trades);
  }

  async function handleTemplate() {
    const { downloadTemplate } = await import('@/lib/journal/excel');
    downloadTemplate();
  }

  function tradeToForm(t: Trade): TradeFormData {
    let tps: number[] = [];
    try { tps = JSON.parse(t.takeProfit || '[]'); } catch { /* */ }
    let tags: string[] = [];
    try { tags = JSON.parse(t.tags || '[]'); } catch { /* */ }
    return {
      date: t.date,
      pair: t.pair,
      direction: t.direction,
      timeframe: t.timeframe || '',
      entryPrice: t.entryPrice ?? null,
      stopLoss: t.stopLoss ?? null,
      takeProfit: tps,
      lotSize: t.lotSize ?? null,
      status: t.status || 'OPEN',
      pnlDollar: t.pnlDollar ?? null,
      pnlPips: t.pnlPips ?? null,
      tags,
      chartUrl: t.chartUrl || '',
      notes: t.notes || '',
      setupRating: t.setupRating ?? null,
      emotion: t.emotion || '',
    };
  }

  if (status === 'loading') {
    return (
      <div className="min-h-dvh bg-[var(--bg-root)] flex items-center justify-center">
        <div className="text-[var(--text-muted)] text-sm">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-dvh bg-[var(--bg-root)] tv-grid-bg flex flex-col items-center justify-center p-4">
        <AuthModal open canDismiss={false} onClose={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-root)] text-[var(--text-primary)]">
      <header className="border-b hairline border-[var(--border)] glass sticky top-0 z-40 px-3 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="min-w-[38px] min-h-[38px] rounded-xl hover:bg-white/8 text-[var(--text-secondary)] hover:text-white transition-colors flex items-center justify-center touch-manipulation" title="Back to home">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">Trading Journal</h1>
              <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)]">{trades.length} trades recorded</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            <ColumnManager columns={columns} onAdd={handleAddColumn} onDelete={handleDeleteColumn} />
            <button
              onClick={handleTemplate}
              title="Download Excel Template"
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 min-h-[36px] rounded-xl text-xs text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border hairline border-[var(--border)] transition-colors touch-manipulation"
            >
              <FileSpreadsheet size={14} /> <span className="hidden md:inline">Template</span>
            </button>
            <button
              onClick={() => setImportOpen(true)}
              title="Import CSV"
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 min-h-[36px] rounded-xl text-xs text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border hairline border-[var(--border)] transition-colors touch-manipulation"
            >
              <Upload size={14} /> <span className="hidden md:inline">Import</span>
            </button>
            <button
              onClick={handleExport}
              title="Export XLSX"
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 min-h-[36px] rounded-xl text-xs text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border hairline border-[var(--border)] transition-colors touch-manipulation"
            >
              <Download size={14} /> <span className="hidden md:inline">Export</span>
            </button>
            <button
              onClick={() => { setEditTrade(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 min-h-[36px] rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/85 text-white text-xs font-semibold transition-all duration-200 shadow-[0_0_16px_var(--accent-glow)] touch-manipulation"
            >
              <Plus size={15} /> <span>Add Trade</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <JournalStats trades={trades} />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <FilterBar filter={filter} onChange={setFilter} availablePairs={allPairs} />
          <button
            onClick={() => setShowCharts(!showCharts)}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl text-xs border hairline transition-all duration-200 flex-shrink-0 touch-manipulation ${
              showCharts ? 'text-[var(--accent)] bg-[var(--accent-subtle)] border-[var(--accent-dim)]' : 'text-[var(--text-secondary)] border-[var(--border)] hover:bg-white/5'
            }`}
          >
            Charts {showCharts ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        <div className={`grid-expand ${showCharts ? 'open' : ''}`}>
          <div>
            <JournalCharts trades={trades} />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[var(--text-muted)] text-sm">Loading trades...</div>
        ) : (
          <JournalTable
            trades={trades}
            customColumns={columns}
            customValues={customVals}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onInlineUpdate={handleInlineUpdate}
            onCustomValueUpdate={handleCustomValueUpdate}
          />
        )}
      </main>

      <TradeModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTrade(null); }}
        onSave={handleSave}
        initial={editTrade ? tradeToForm(editTrade) : undefined}
        title={editTrade ? 'Edit Trade' : 'New Trade'}
        savedPairs={allPairs}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}

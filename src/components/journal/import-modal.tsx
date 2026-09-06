'use client';

import { useState, useRef } from 'react';
import { Upload, X, Check, AlertTriangle } from 'lucide-react';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (trades: Record<string, unknown>[]) => void;
}

export default function ImportModal({ open, onClose, onImport }: ImportModalProps) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    const Papa = (await import('papaparse')).default;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          setError(result.errors[0].message);
          return;
        }
        setHeaders(result.meta.fields || []);
        setRows(result.data as Record<string, string>[]);
      },
    });
  }

  function handleImport() {
    const mapped = rows.map((row) => {
      const findCol = (names: string[]) => {
        for (const n of names) {
          const key = Object.keys(row).find((k) => k.toLowerCase().replace(/[^a-z]/g, '') === n.toLowerCase().replace(/[^a-z]/g, ''));
          if (key && row[key]) return row[key];
        }
        return null;
      };

      return {
        date: findCol(['date', 'datetime', 'time']) || new Date().toISOString().slice(0, 10),
        pair: findCol(['pair', 'instrument', 'symbol']) || 'XAUUSD',
        direction: findCol(['direction', 'dir', 'side', 'type']) || 'BUY',
        timeframe: findCol(['timeframe', 'tf']),
        entryPrice: Number(findCol(['entry', 'entryprice', 'open', 'openprice'])) || null,
        stopLoss: Number(findCol(['stoploss', 'sl', 'stop'])) || null,
        takeProfit: (() => {
          const tp1 = Number(findCol(['takeprofit', 'tp', 'tp1', 'target']));
          return tp1 ? [tp1] : [];
        })(),
        lotSize: Number(findCol(['lot', 'lotsize', 'size', 'volume'])) || null,
        status: findCol(['status', 'result', 'outcome']) || 'OPEN',
        pnlDollar: Number(findCol(['pnl', 'pnldollar', 'profit', 'profitloss'])) || null,
        pnlPips: Number(findCol(['pnlpips', 'pips', 'points'])) || null,
        notes: findCol(['notes', 'comment', 'description']),
        emotion: findCol(['emotion', 'mood', 'psychology']),
        tags: (() => {
          const t = findCol(['tags', 'strategy', 'setup']);
          return t ? t.split(/[,;]/).map((s: string) => s.trim()).filter(Boolean) : [];
        })(),
      };
    });

    onImport(mapped);
    onClose();
    setRows([]);
    setHeaders([]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn" onClick={onClose} />
      <div className="relative z-10 bg-[var(--bg-surface)] border hairline border-[var(--border-bright)] rounded-2xl w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto scrollbar-thin animate-slideUp shadow-2xl">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b hairline border-[var(--border)]">
          <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] tracking-tight">Import CSV</h2>
          <button
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] rounded-xl hover:bg-white/8 text-[var(--text-secondary)] transition-colors flex items-center justify-center touch-manipulation"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-3.5 sm:py-4 space-y-4">
          {rows.length === 0 ? (
            <div>
              <button onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-3 w-full py-10 rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent-dim)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all duration-200 touch-manipulation">
                <Upload size={28} />
                <span className="text-sm">Click to upload CSV file</span>
                <span className="text-[11px] text-[var(--text-muted)]">Supports: date, pair, direction, entry, SL, TP, lot, status, PnL, notes</span>
              </button>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
              {error && (
                <div className="flex items-center gap-2 mt-3 text-[var(--bear)] text-xs">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Check size={14} className="text-[var(--bull)]" />
                <span className="text-sm text-[var(--text-primary)]">{rows.length} trades found</span>
                <span className="text-xs text-[var(--text-muted)]">Columns: {headers.join(', ')}</span>
              </div>

              <div className="overflow-x-auto max-h-64 border hairline border-[var(--border)] rounded-xl">
                <table className="w-full min-w-[500px] text-[11px]">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      {headers.slice(0, 8).map((h) => (
                        <th key={h} className="px-2 py-1.5 text-left text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-t hairline border-[var(--border)]">
                        {headers.slice(0, 8).map((h) => (
                          <td key={h} className="px-2 py-1 text-[var(--text-secondary)]">{row[h] || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 10 && (
                  <div className="text-center text-[11px] text-[var(--text-muted)] py-1.5">...and {rows.length - 10} more</div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 mt-4">
                <button
                  onClick={() => { setRows([]); setHeaders([]); }}
                  className="min-h-[40px] px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-white/5 transition-colors touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  className="min-h-[40px] px-5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/85 text-white text-sm font-semibold transition-all duration-200 shadow-[0_0_16px_var(--accent-glow)] touch-manipulation"
                >
                  Import {rows.length} trades
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

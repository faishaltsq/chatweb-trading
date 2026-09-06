'use client';

import { type Trade, type CustomColumn } from '@/lib/journal/schema';
import { statusColor, dirColor } from '@/lib/journal/constants';
import { Star, GripVertical, Pencil, Trash2, Image } from 'lucide-react';
import { useState } from 'react';

interface JournalTableProps {
  trades: Trade[];
  customColumns?: CustomColumn[];
  customValues?: Record<string, Record<string, string>>;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onInlineUpdate: (id: string, field: string, value: unknown) => void;
  onCustomValueUpdate?: (tradeId: string, columnId: string, value: string) => void;
}

export default function JournalTable({ trades, customColumns = [], customValues = {}, onEdit, onDelete, onInlineUpdate, onCustomValueUpdate }: JournalTableProps) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)] text-sm">
        No trades recorded yet. Click &quot;Add Trade&quot; to start your journal.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
      <table className="w-full text-xs border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-[var(--bg-surface)] text-[var(--text-muted)] text-left">
            <th className="w-8 px-2 py-3" />
            <th className="px-3 py-3 font-semibold">Date</th>
            <th className="px-3 py-3 font-semibold">Pair</th>
            <th className="px-3 py-3 font-semibold">Dir</th>
            <th className="px-3 py-3 font-semibold">TF</th>
            <th className="px-3 py-3 font-semibold text-right">Entry</th>
            <th className="px-3 py-3 font-semibold text-right">Stop Loss</th>
            <th className="px-3 py-3 font-semibold text-right">Take Profit</th>
            <th className="px-3 py-3 font-semibold text-right">Lot</th>
            <th className="px-3 py-3 font-semibold text-center">Status</th>
            <th className="px-3 py-3 font-semibold text-right">PnL ($)</th>
            <th className="px-3 py-3 font-semibold text-right">PnL (pts)</th>
            <th className="px-3 py-3 font-semibold text-center">Rating</th>
            <th className="px-3 py-3 font-semibold">Emotion</th>
            <th className="px-3 py-3 font-semibold">Tags</th>
            <th className="px-3 py-3 font-semibold w-8">Img</th>
            {customColumns.map((col) => (
              <th key={col.id} className="px-3 py-3 font-semibold text-[var(--info)]">{col.name}</th>
            ))}
            <th className="px-3 py-3 font-semibold w-20">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <TradeRow
              key={trade.id}
              trade={trade}
              customColumns={customColumns}
              customValues={customValues[trade.id] || {}}
              onEdit={onEdit}
              onDelete={onDelete}
              onInlineUpdate={onInlineUpdate}
              onCustomValueUpdate={onCustomValueUpdate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TradeRow({ trade, customColumns, customValues, onEdit, onDelete, onInlineUpdate, onCustomValueUpdate }: {
  trade: Trade;
  customColumns: CustomColumn[];
  customValues: Record<string, string>;
  onEdit: (t: Trade) => void;
  onDelete: (id: string) => void;
  onInlineUpdate: (id: string, field: string, value: unknown) => void;
  onCustomValueUpdate?: (tradeId: string, columnId: string, value: string) => void;
}) {
  const tps = (() => {
    try { return JSON.parse(trade.takeProfit || '[]'); } catch { return []; }
  })();
  const tags = (() => {
    try { return JSON.parse(trade.tags || '[]'); } catch { return []; }
  })();

  const pnlClass = (trade.pnlDollar ?? 0) > 0
    ? 'text-[var(--accent)]'
    : (trade.pnlDollar ?? 0) < 0
    ? 'text-red-400'
    : 'text-[var(--text-muted)]';

  return (
    <tr className="border-t border-[var(--border)] hover:bg-white/[0.03] group transition-colors">
      <td className="px-2 py-2.5 text-[var(--text-muted)] cursor-grab">
        <GripVertical size={12} />
      </td>
      <td className="px-3 py-2.5">
        <EditableCell value={trade.date} onSave={(v) => onInlineUpdate(trade.id, 'date', v)} type="date" />
      </td>
      <td className="px-3 py-2.5 font-medium text-[var(--text-primary)] font-mono">{trade.pair}</td>
      <td className={`px-3 py-2.5 font-semibold ${dirColor(trade.direction)}`}>
        <InlineSelect value={trade.direction} options={['BUY', 'SELL']}
          onSave={(v) => onInlineUpdate(trade.id, 'direction', v)} />
      </td>
      <td className="px-3 py-2.5 text-[var(--text-secondary)]">{trade.timeframe || '-'}</td>
      <td className="px-3 py-2.5 text-right text-[var(--text-secondary)] font-mono">
        <EditableCell value={trade.entryPrice?.toString() ?? ''} onSave={(v) => onInlineUpdate(trade.id, 'entryPrice', Number(v) || null)} type="number" />
      </td>
      <td className="px-3 py-2.5 text-right text-red-400 font-mono">
        <EditableCell value={trade.stopLoss?.toString() ?? ''} onSave={(v) => onInlineUpdate(trade.id, 'stopLoss', Number(v) || null)} type="number" />
      </td>
      <td className="px-3 py-2.5 text-right text-[var(--accent)] text-[11px] font-mono">
        {tps.length > 0 ? tps.join(' / ') : '-'}
      </td>
      <td className="px-3 py-2.5 text-right text-[var(--text-secondary)] font-mono">
        <EditableCell value={trade.lotSize?.toString() ?? ''} onSave={(v) => onInlineUpdate(trade.id, 'lotSize', Number(v) || null)} type="number" />
      </td>
      <td className="px-3 py-2.5 text-center">
        <InlineSelect value={trade.status || 'OPEN'} options={['OPEN', 'WIN', 'LOSS', 'BREAKEVEN']}
          onSave={(v) => onInlineUpdate(trade.id, 'status', v)}
          className={statusColor(trade.status || 'OPEN')} />
      </td>
      <td className={`px-3 py-2.5 text-right font-medium font-mono ${pnlClass}`}>
        <EditableCell value={trade.pnlDollar?.toString() ?? ''} onSave={(v) => onInlineUpdate(trade.id, 'pnlDollar', Number(v) || null)} type="number" />
      </td>
      <td className={`px-3 py-2.5 text-right font-mono ${pnlClass}`}>
        <EditableCell value={trade.pnlPips?.toString() ?? ''} onSave={(v) => onInlineUpdate(trade.id, 'pnlPips', Number(v) || null)} type="number" />
      </td>
      <td className="px-3 py-2.5 text-center">
        <div className="flex gap-0.5 justify-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => onInlineUpdate(trade.id, 'setupRating', n)}
              className={`transition-colors ${(trade.setupRating ?? 0) >= n * 2 ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]/30'}`}>
              <Star size={10} fill={(trade.setupRating ?? 0) >= n * 2 ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
      </td>
      <td className="px-3 py-2.5 text-[var(--text-secondary)] text-[11px]">{trade.emotion || '-'}</td>
      <td className="px-3 py-2.5">
        <div className="flex gap-1 flex-wrap">
          {tags.map((t: string) => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-muted)] text-[10px]">{t}</span>
          ))}
        </div>
      </td>
      <td className="px-3 py-2.5 text-center">
        {trade.chartUrl ? <Image size={12} className="text-[var(--info)] mx-auto" /> : <span className="text-[var(--text-muted)]/30">-</span>}
      </td>
      {customColumns.map((col) => (
        <td key={col.id} className="px-3 py-2.5 text-[var(--text-secondary)]">
          <EditableCell
            value={customValues[col.id] || ''}
            onSave={(v) => onCustomValueUpdate?.(trade.id, col.id, v)}
            type={col.type === 'number' ? 'number' : 'text'}
          />
        </td>
      ))}
      <td className="px-3 py-2.5">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(trade)} className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors">
            <Pencil size={12} />
          </button>
          <button onClick={() => onDelete(trade.id)} className="p-1 rounded hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function EditableCell({ value, onSave, type = 'text' }: {
  value: string; onSave: (v: string) => void; type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  if (!editing) {
    return (
      <span className="cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 transition-colors" onClick={() => { setVal(value); setEditing(true); }}>
        {value || '-'}
      </span>
    );
  }

  return (
    <input
      type={type} value={val} autoFocus
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => { onSave(val); setEditing(false); }}
      onKeyDown={(e) => { if (e.key === 'Enter') { onSave(val); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
      className="w-full bg-[var(--bg-elevated)] border border-[var(--accent)] rounded px-1.5 py-0.5 text-xs text-[var(--text-primary)] outline-none shadow-[0_0_8px_var(--accent-glow)]"
    />
  );
}

function InlineSelect({ value, options, onSave, className = '' }: {
  value: string; options: string[]; onSave: (v: string) => void; className?: string;
}) {
  return (
    <select value={value} onChange={(e) => onSave(e.target.value)}
      className={`bg-transparent border-none outline-none cursor-pointer text-xs font-semibold px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors ${className}`}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

'use client';

import { type Trade, type CustomColumn } from '@/lib/journal/schema';
import { statusColor, dirColor } from '@/lib/journal/constants';
import { Star, GripVertical, Pencil, Trash2, Image, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import ChartImageModal from './chart-image-modal';

interface JournalTableProps {
  trades: Trade[];
  customColumns?: CustomColumn[];
  customValues?: Record<string, Record<string, string>>;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onInlineUpdate: (id: string, field: string, value: unknown) => void;
  onCustomValueUpdate?: (tradeId: string, columnId: string, value: string) => void;
}

export default function JournalTable({
  trades,
  customColumns = [],
  customValues = {},
  onEdit,
  onDelete,
  onInlineUpdate,
  onCustomValueUpdate,
}: JournalTableProps) {
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  if (trades.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)] text-sm">
        No trades recorded yet. Click &quot;Add Trade&quot; to start your journal.
      </div>
    );
  }

  return (
    <>
      {/* ============================================================ */}
      {/* MOBILE CARD VIEW (< md screens)                             */}
      {/* ============================================================ */}
      <div className="md:hidden space-y-2.5">
        {trades.map((trade) => (
          <TradeCard
            key={trade.id}
            trade={trade}
            customColumns={customColumns}
            customValues={customValues[trade.id] || {}}
            onEdit={onEdit}
            onDelete={onDelete}
            onPreviewImage={setPreviewImage}
          />
        ))}
      </div>

      {/* ============================================================ */}
      {/* DESKTOP TABLE VIEW (>= md screens)                          */}
      {/* ============================================================ */}
      <div className="hidden md:block overflow-x-auto border hairline border-[var(--border)] rounded-2xl">
        <table className="w-full text-xs border-collapse min-w-[950px] lg:min-w-[1200px]">
          <thead>
            <tr className="bg-[var(--bg-surface)] text-[var(--text-muted)] text-left">
              <th className="w-8 px-2 py-3" />
              <th className="px-3 py-3 font-semibold text-[10px] uppercase tracking-wider">Date</th>
              <th className="px-3 py-3 font-semibold text-[10px] uppercase tracking-wider">Pair</th>
              <th className="px-3 py-3 font-semibold text-[10px] uppercase tracking-wider">Dir</th>
              <th className="px-3 py-3 font-semibold text-[10px] uppercase tracking-wider">TF</th>
              <th className="px-3 py-3 font-semibold text-right text-[10px] uppercase tracking-wider">Entry</th>
              <th className="px-3 py-3 font-semibold text-right text-[10px] uppercase tracking-wider">Stop Loss</th>
              <th className="px-3 py-3 font-semibold text-right text-[10px] uppercase tracking-wider">Take Profit</th>
              <th className="px-3 py-3 font-semibold text-right text-[10px] uppercase tracking-wider">Lot</th>
              <th className="px-3 py-3 font-semibold text-center text-[10px] uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 font-semibold text-right text-[10px] uppercase tracking-wider">PnL ($)</th>
              <th className="px-3 py-3 font-semibold text-right text-[10px] uppercase tracking-wider">PnL (pts)</th>
              <th className="px-3 py-3 font-semibold text-center text-[10px] uppercase tracking-wider">Rating</th>
              <th className="px-3 py-3 font-semibold text-[10px] uppercase tracking-wider">Emotion</th>
              <th className="px-3 py-3 font-semibold text-[10px] uppercase tracking-wider">Tags</th>
              <th className="px-3 py-3 font-semibold w-8 text-[10px] uppercase tracking-wider">Img</th>
              {customColumns.map((col) => (
                <th key={col.id} className="px-3 py-3 font-semibold text-[var(--info)] text-[10px] uppercase tracking-wider">{col.name}</th>
              ))}
              <th className="px-3 py-3 font-semibold w-20 text-[10px] uppercase tracking-wider">Actions</th>
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
                onPreviewImage={setPreviewImage}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ChartImageModal
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url || ''}
        title={previewImage?.title}
      />
    </>
  );
}

// ============================================================
// Mobile Trade Card
// ============================================================
function TradeCard({
  trade,
  customColumns,
  customValues,
  onEdit,
  onDelete,
  onPreviewImage,
}: {
  trade: Trade;
  customColumns: CustomColumn[];
  customValues: Record<string, string>;
  onEdit: (t: Trade) => void;
  onDelete: (id: string) => void;
  onPreviewImage?: (img: { url: string; title: string }) => void;
}) {
  const tps = (() => {
    try { return JSON.parse(trade.takeProfit || '[]'); } catch { return []; }
  })();
  const tags = (() => {
    try { return JSON.parse(trade.tags || '[]'); } catch { return []; }
  })();

  const pnlVal = trade.pnlDollar ?? 0;
  const pnlColor = pnlVal > 0 ? 'text-[var(--bull)]' : pnlVal < 0 ? 'text-[var(--bear)]' : 'text-[var(--text-muted)]';
  const pnlPrefix = pnlVal > 0 ? '+' : '';

  return (
    <div
      onClick={() => onEdit(trade)}
      className="bg-[var(--bg-surface)] border hairline border-[var(--border)] rounded-2xl p-3.5 space-y-2.5 active:bg-white/[0.04] transition-colors cursor-pointer"
    >
      {/* Row 1: Pair + Direction + Status + Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-[var(--text-primary)]">{trade.pair}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${dirColor(trade.direction)} bg-white/5`}>
            {trade.direction}
          </span>
          {trade.timeframe && (
            <span className="text-[10px] font-mono text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-white/5">
              {trade.timeframe}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${statusColor(trade.status || 'OPEN')}`}>
            {trade.status || 'OPEN'}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{trade.date}</span>
        </div>
      </div>

      {/* Row 2: PnL + Lots + Key Levels */}
      <div className="flex items-center justify-between bg-[var(--bg-elevated)]/60 rounded-xl px-3 py-2 border hairline border-[var(--border)]">
        <div>
          <span className="text-[10px] text-[var(--text-muted)] block uppercase tracking-wider">PnL</span>
          <span className={`font-mono text-sm font-bold ${pnlColor}`}>
            {trade.pnlDollar != null ? `${pnlPrefix}$${trade.pnlDollar.toFixed(2)}` : '—'}
          </span>
          {trade.pnlPips != null && (
            <span className={`text-[10px] font-mono ml-1.5 ${pnlColor}`}>
              ({pnlPrefix}{trade.pnlPips} pts)
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[var(--text-muted)] block uppercase tracking-wider">Entry / SL</span>
          <span className="font-mono text-xs text-[var(--text-primary)]">
            {trade.entryPrice ?? '—'} <span className="text-[var(--text-muted)]">/</span>{' '}
            <span className="text-[var(--bear)]">{trade.stopLoss ?? '—'}</span>
          </span>
        </div>

        {trade.lotSize != null && (
          <div className="text-right">
            <span className="text-[10px] text-[var(--text-muted)] block uppercase tracking-wider">Lot</span>
            <span className="font-mono text-xs text-[var(--text-secondary)]">{trade.lotSize}</span>
          </div>
        )}
      </div>

      {/* Row 3: TP Preview + Tags + Actions */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0 mr-2">
          {tps.length > 0 && (
            <span className="text-[10px] font-mono text-[var(--bull)]">
              TP: {tps.join(' / ')}
            </span>
          )}
          {tags.map((t: string) => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-muted)] text-[9px] font-mono">
              #{t}
            </span>
          ))}
          {trade.emotion && (
            <span className="text-[10px] text-[var(--text-secondary)] italic">
              · {trade.emotion}
            </span>
          )}
        </div>

        {/* Action buttons with touch targets */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {trade.chartUrl && (
            <button
              type="button"
              onClick={() => onPreviewImage?.({ url: trade.chartUrl!, title: `${trade.pair} (${trade.direction}) - ${trade.date}` })}
              className="min-w-[34px] min-h-[34px] w-[34px] h-[34px] rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center touch-manipulation overflow-hidden border hairline border-[var(--border)] p-0.5"
              title="Lihat screenshot chart"
            >
              <img src={trade.chartUrl} alt="thumb" className="w-full h-full object-cover rounded-md" />
            </button>
          )}
          <button
            onClick={() => onEdit(trade)}
            className="min-w-[34px] min-h-[34px] rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-colors flex items-center justify-center touch-manipulation"
            title="Edit trade"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(trade.id)}
            className="min-w-[34px] min-h-[34px] rounded-lg bg-[var(--bear)]/10 hover:bg-[var(--bear)]/20 text-[var(--bear)] transition-colors flex items-center justify-center touch-manipulation"
            title="Delete trade"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Desktop Trade Row
// ============================================================
function TradeRow({
  trade,
  customColumns,
  customValues,
  onEdit,
  onDelete,
  onInlineUpdate,
  onCustomValueUpdate,
  onPreviewImage,
}: {
  trade: Trade;
  customColumns: CustomColumn[];
  customValues: Record<string, string>;
  onEdit: (t: Trade) => void;
  onDelete: (id: string) => void;
  onInlineUpdate: (id: string, field: string, value: unknown) => void;
  onCustomValueUpdate?: (tradeId: string, columnId: string, value: string) => void;
  onPreviewImage?: (img: { url: string; title: string }) => void;
}) {
  const tps = (() => {
    try { return JSON.parse(trade.takeProfit || '[]'); } catch { return []; }
  })();
  const tags = (() => {
    try { return JSON.parse(trade.tags || '[]'); } catch { return []; }
  })();

  const pnlClass = (trade.pnlDollar ?? 0) > 0
    ? 'text-[#26a69a]'
    : (trade.pnlDollar ?? 0) < 0
    ? 'text-[#ef5350]'
    : 'text-[var(--text-muted)]';

  return (
    <tr className="border-t hairline border-[var(--border)] hover:bg-white/[0.025] group transition-colors">
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
      <td className="px-3 py-2.5 text-right text-[#ef5350] font-mono">
        <EditableCell value={trade.stopLoss?.toString() ?? ''} onSave={(v) => onInlineUpdate(trade.id, 'stopLoss', Number(v) || null)} type="number" />
      </td>
      <td className="px-3 py-2.5 text-right text-[#26a69a] text-[11px] font-mono">
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
            <button
              key={n}
              onClick={() => onInlineUpdate(trade.id, 'setupRating', n)}
              className={`p-1 min-w-[20px] min-h-[20px] flex items-center justify-center transition-colors ${(trade.setupRating ?? 0) >= n * 2 ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]/30'}`}
            >
              <Star size={11} fill={(trade.setupRating ?? 0) >= n * 2 ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
      </td>
      <td className="px-3 py-2.5 text-[var(--text-secondary)] text-[11px]">{trade.emotion || '-'}</td>
      <td className="px-3 py-2.5">
        <div className="flex gap-1 flex-wrap">
          {tags.map((t: string) => (
            <span key={t} className="px-1.5 py-0.5 rounded-md bg-white/5 text-[var(--text-muted)] text-[10px]">{t}</span>
          ))}
        </div>
      </td>
      <td className="px-3 py-2.5 text-center">
        {trade.chartUrl ? (
          <button
            type="button"
            onClick={() => onPreviewImage?.({ url: trade.chartUrl!, title: `${trade.pair} (${trade.direction}) - ${trade.date}` })}
            className="group inline-flex items-center justify-center p-0.5 rounded-lg hover:ring-2 hover:ring-[var(--accent)] transition-all touch-manipulation"
            title="Klik untuk memperbesar chart"
          >
            <img
              src={trade.chartUrl}
              alt="chart"
              className="w-7 h-7 object-cover rounded-md border hairline border-[var(--border)] group-hover:scale-105 transition-transform"
            />
          </button>
        ) : (
          <span className="text-[var(--text-muted)]/30">-</span>
        )}
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
        <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(trade)} className="p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg hover:bg-white/8 text-[var(--text-muted)] hover:text-white transition-colors touch-manipulation">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(trade.id)} className="p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg hover:bg-[var(--bear)]/15 text-[var(--text-muted)] hover:text-[var(--bear)] transition-colors touch-manipulation">
            <Trash2 size={13} />
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
      <span className="cursor-pointer hover:bg-white/5 rounded-md px-1 -mx-1 transition-colors" onClick={() => { setVal(value); setEditing(true); }}>
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
      className="w-full bg-[var(--bg-elevated)] border hairline border-[var(--accent)] rounded-lg px-1.5 py-0.5 text-xs text-[var(--text-primary)] outline-none shadow-[0_0_0_3px_var(--accent-glow)]"
    />
  );
}

function InlineSelect({ value, options, onSave, className = '' }: {
  value: string; options: string[]; onSave: (v: string) => void; className?: string;
}) {
  return (
    <select value={value} onChange={(e) => onSave(e.target.value)}
      className={`bg-transparent border-none outline-none cursor-pointer text-xs font-semibold px-1.5 py-0.5 rounded-lg hover:bg-white/5 transition-colors ${className}`}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

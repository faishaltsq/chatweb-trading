'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import { type Trade } from '@/lib/journal/schema';
import ChartImageModal from './chart-image-modal';

interface Props {
  trades: Trade[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TV_BULL = '#26a69a';
const TV_BEAR = '#ef5350';

function fmt(n: number) {
  const s = Math.abs(n).toFixed(2);
  return n >= 0 ? `+$${s}` : `-$${s}`;
}

function pad(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function PnlCalendar({ trades }: Props) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const closed = useMemo(() => trades.filter((t) => t.status !== 'OPEN'), [trades]);

  const dayMap = useMemo(() => {
    const m: Record<string, { trades: Trade[]; total: number }> = {};
    closed.forEach((t) => {
      if (!m[t.date]) m[t.date] = { trades: [], total: 0 };
      m[t.date].trades.push(t);
      m[t.date].total += t.pnlDollar ?? 0;
    });
    return m;
  }, [closed]);

  const cells = useMemo(() => {
    const year = month.getFullYear();
    const mo = month.getMonth();
    const firstDay = new Date(year, mo, 1);
    const lastDay = new Date(year, mo + 1, 0);
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const grid: { date: string; day: number; inMonth: boolean }[] = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, mo, -i);
      grid.push({ date: pad(d), day: d.getDate(), inMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, mo, i);
      grid.push({ date: pad(d), day: i, inMonth: true });
    }
    const remaining = 7 - (grid.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, mo + 1, i);
        grid.push({ date: pad(d), day: i, inMonth: false });
      }
    }

    return grid;
  }, [month]);

  const today = pad(new Date());

  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const monthTotal = useMemo(() => {
    const prefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    return closed
      .filter((t) => t.date.startsWith(prefix))
      .reduce((s, t) => s + (t.pnlDollar ?? 0), 0);
  }, [closed, month]);

  const prev = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const next = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  const selectedData = selected ? dayMap[selected] : null;

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button onClick={prev} className="p-1.5 rounded-lg hover:bg-white/8 text-[var(--text-secondary)] hover:text-white transition-colors touch-manipulation">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-[var(--text-primary)] min-w-[150px] text-center">{monthLabel}</span>
          <button onClick={next} className="p-1.5 rounded-lg hover:bg-white/8 text-[var(--text-secondary)] hover:text-white transition-colors touch-manipulation">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className={`text-xs font-mono font-bold ${monthTotal >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
          Month: {fmt(monthTotal)}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[var(--border)] rounded-xl overflow-hidden border hairline border-[var(--border)]">
        {DAYS.map((d) => (
          <div key={d} className="bg-[var(--bg-elevated)] text-center text-[10px] font-medium text-[var(--text-muted)] py-1.5 uppercase tracking-wider">
            {d}
          </div>
        ))}

        {cells.map((cell) => {
          const info = dayMap[cell.date];
          const isToday = cell.date === today;
          const isSelected = cell.date === selected;
          const hasTrades = !!info;

          let bgClass = 'bg-[var(--bg-surface)]';
          let borderStyle = '';
          if (hasTrades && cell.inMonth) {
            bgClass = info.total >= 0
              ? 'bg-[#26a69a]/[0.08] hover:bg-[#26a69a]/[0.15]'
              : 'bg-[#ef5350]/[0.08] hover:bg-[#ef5350]/[0.15]';
          } else {
            bgClass += ' hover:bg-white/[0.03]';
          }
          if (isToday) borderStyle = 'ring-1 ring-inset ring-[var(--accent)]';
          if (isSelected) borderStyle = 'ring-2 ring-inset ring-[var(--accent)]';

          return (
            <button
              key={cell.date}
              onClick={() => hasTrades && cell.inMonth && setSelected(isSelected ? null : cell.date)}
              className={`${bgClass} ${borderStyle} relative p-1 sm:p-1.5 min-h-[48px] sm:min-h-[56px] flex flex-col items-start transition-all duration-150 touch-manipulation ${
                !cell.inMonth ? 'opacity-30' : ''
              } ${hasTrades && cell.inMonth ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className={`text-[10px] sm:text-[11px] leading-none ${
                isToday ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'
              }`}>
                {cell.day}
              </span>
              {hasTrades && cell.inMonth && (
                <>
                  <span className={`text-[10px] sm:text-xs font-mono font-bold mt-auto self-center leading-none ${
                    info.total >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'
                  }`}>
                    {fmt(info.total)}
                  </span>
                  {info.trades.length > 1 && (
                    <span className="absolute top-1 right-1 text-[8px] text-[var(--text-muted)] bg-white/8 rounded-full w-3.5 h-3.5 flex items-center justify-center font-medium">
                      {info.trades.length}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {selected && selectedData && (
        <div className="mt-3 bg-[var(--bg-elevated)] border hairline border-[var(--border)] rounded-xl p-3 sm:p-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {new Date(selected + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className={`text-xs font-mono font-bold ${selectedData.total >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
                {fmt(selectedData.total)}
              </span>
            </div>
            <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-white/8 text-[var(--text-muted)] hover:text-white transition-colors touch-manipulation">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-1">
            {selectedData.trades.map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-[11px] py-1.5 px-2 rounded-lg bg-white/[0.02]">
                <span className="font-semibold text-[var(--text-primary)] min-w-[60px]">{t.pair}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                  t.direction === 'BUY'
                    ? 'bg-[#26a69a]/15 text-[#26a69a]'
                    : 'bg-[#ef5350]/15 text-[#ef5350]'
                }`}>
                  {t.direction}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                  t.status === 'WIN' ? 'bg-[#26a69a]/10 text-[#26a69a]' :
                  t.status === 'LOSS' ? 'bg-[#ef5350]/10 text-[#ef5350]' :
                  'bg-[#ff9800]/10 text-[#ff9800]'
                }`}>
                  {t.status}
                </span>
                {t.lotSize && <span className="text-[var(--text-muted)]">{t.lotSize} lot</span>}
                <span className={`ml-auto font-mono font-bold ${
                  (t.pnlDollar ?? 0) >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'
                }`}>
                  {fmt(t.pnlDollar ?? 0)}
                </span>
                {t.pnlPips != null && (
                  <span className="text-[var(--text-muted)] font-mono">{t.pnlPips > 0 ? '+' : ''}{t.pnlPips}p</span>
                )}
                {t.chartUrl && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage({ url: t.chartUrl!, title: `${t.pair} (${t.direction}) - ${t.date}` })}
                    className="p-1 rounded bg-white/5 hover:bg-white/15 text-[var(--accent)] transition-colors flex items-center justify-center flex-shrink-0 touch-manipulation"
                    title="Lihat screenshot chart"
                  >
                    <ImageIcon size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {selectedData.trades.some((t) => t.notes) && (
            <div className="mt-2 pt-2 border-t hairline border-[var(--border)]">
              {selectedData.trades.filter((t) => t.notes).map((t) => (
                <div key={t.id} className="text-[10px] text-[var(--text-muted)] mt-1">
                  <span className="text-[var(--text-secondary)] font-medium">{t.pair}:</span> {t.notes}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ChartImageModal
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url || ''}
        title={previewImage?.title}
      />
    </div>
  );
}

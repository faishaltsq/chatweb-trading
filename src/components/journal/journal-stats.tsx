'use client';

import { type Trade } from '@/lib/journal/schema';

interface StatsProps {
  trades: Trade[];
}

export default function JournalStats({ trades }: StatsProps) {
  const closed = trades.filter((t) => t.status !== 'OPEN');
  const wins = closed.filter((t) => t.status === 'WIN');
  const losses = closed.filter((t) => t.status === 'LOSS');
  const totalPnl = closed.reduce((s, t) => s + (t.pnlDollar ?? 0), 0);
  const winRate = closed.length > 0 ? (wins.length / closed.length * 100).toFixed(1) : '0';
  const avgRR = (() => {
    const rrs = closed.filter((t) => t.entryPrice && t.stopLoss).map((t) => {
      const risk = Math.abs(t.entryPrice! - t.stopLoss!);
      const reward = Math.abs(t.pnlPips ?? 0);
      return risk > 0 ? reward / risk : 0;
    });
    return rrs.length > 0 ? (rrs.reduce((a, b) => a + b, 0) / rrs.length).toFixed(2) : '0';
  })();
  const grossWin = wins.reduce((s, t) => s + (t.pnlDollar ?? 0), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnlDollar ?? 0), 0));
  const profitFactor = grossLoss > 0 ? (grossWin / grossLoss).toFixed(2) : grossWin > 0 ? '∞' : '0';

  const stats = [
    { label: 'Total Trades', value: trades.length.toString(), sub: `${closed.length} closed` },
    { label: 'Win Rate', value: `${winRate}%`, sub: `${wins.length}W / ${losses.length}L`, color: Number(winRate) >= 50 ? 'text-[var(--accent)]' : 'text-red-400' },
    { label: 'Total PnL', value: `$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? 'text-[var(--accent)]' : 'text-red-400' },
    { label: 'Profit Factor', value: profitFactor, color: Number(profitFactor) >= 1 ? 'text-[var(--accent)]' : 'text-red-400' },
    { label: 'Avg RR', value: `1:${avgRR}` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="group relative bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 hover:-translate-y-0.5 transition-all duration-200">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium">{s.label}</div>
          <div className={`text-lg font-bold mt-1 font-mono ${s.color || 'text-[var(--text-primary)]'}`}>{s.value}</div>
          {s.sub && <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.sub}</div>}
          {s.color && (
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"
              style={{ boxShadow: s.color.includes('accent') ? '0 0 20px var(--accent-glow)' : '0 0 20px rgba(239,68,68,0.1)' }} />
          )}
        </div>
      ))}
    </div>
  );
}

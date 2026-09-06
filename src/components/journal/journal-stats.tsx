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
    { label: 'Total Trades', value: trades.length.toString(), sub: `${closed.length} closed`, color: '' },
    { label: 'Win Rate', value: `${winRate}%`, sub: `${wins.length}W / ${losses.length}L`, color: Number(winRate) >= 50 ? 'bull' : 'bear' },
    { label: 'Total PnL', value: `$${totalPnl.toFixed(2)}`, sub: '', color: totalPnl >= 0 ? 'bull' : 'bear' },
    { label: 'Profit Factor', value: profitFactor, sub: '', color: Number(profitFactor) >= 1 ? 'bull' : 'bear' },
    { label: 'Avg RR', value: `1:${avgRR}`, sub: '', color: '' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="relative bg-[var(--bg-surface)] border hairline border-[var(--border)] rounded-2xl px-4 py-4 hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden"
        >
          <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
            s.color === 'bull' ? 'bg-[#26a69a]/[0.04]' : s.color === 'bear' ? 'bg-[#ef5350]/[0.04]' : ''
          }`} />
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-medium mb-1.5">{s.label}</div>
          <div className={`text-xl font-bold font-mono tracking-tight ${
            s.color === 'bull' ? 'text-[#26a69a]' :
            s.color === 'bear' ? 'text-[#ef5350]' :
            'text-[var(--text-primary)]'
          }`}>{s.value}</div>
          {s.sub && <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.sub}</div>}
        </div>
      ))}
    </div>
  );
}

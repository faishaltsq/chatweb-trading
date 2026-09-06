'use client';

import { type Trade } from '@/lib/journal/schema';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useState } from 'react';
import { BarChart3, TrendingUp, PieChartIcon } from 'lucide-react';

interface ChartsProps {
  trades: Trade[];
}

const TV_BULL = '#26a69a';
const TV_BEAR = '#ef5350';
const TV_COLORS = { WIN: TV_BULL, LOSS: TV_BEAR, BREAKEVEN: '#ff9800', OPEN: '#434651' };

export default function JournalCharts({ trades }: ChartsProps) {
  const [tab, setTab] = useState<'equity' | 'monthly' | 'distribution'>('equity');
  const closed = trades.filter((t) => t.status !== 'OPEN').sort((a, b) => a.date.localeCompare(b.date));

  if (closed.length === 0) {
    return (
      <div className="bg-[var(--bg-surface)] border hairline border-[var(--border)] rounded-2xl px-6 py-10 text-center text-[var(--text-muted)] text-xs mb-4">
        Charts will appear after you close some trades.
      </div>
    );
  }

  const equityData = (() => {
    let cum = 0;
    return closed.map((t) => {
      cum += t.pnlDollar ?? 0;
      return { date: t.date, pnl: parseFloat(cum.toFixed(2)) };
    });
  })();

  const monthlyData = (() => {
    const months: Record<string, number> = {};
    closed.forEach((t) => {
      const m = t.date.slice(0, 7);
      months[m] = (months[m] || 0) + (t.pnlDollar ?? 0);
    });
    return Object.entries(months).sort().map(([month, pnl]) => ({ month, pnl: parseFloat(pnl.toFixed(2)) }));
  })();

  const distData = (() => {
    const counts: Record<string, number> = { WIN: 0, LOSS: 0, BREAKEVEN: 0 };
    closed.forEach((t) => { counts[t.status || 'OPEN'] = (counts[t.status || 'OPEN'] || 0) + 1; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  })();

  const tabs = [
    { id: 'equity' as const, label: 'Equity Curve', icon: TrendingUp },
    { id: 'monthly' as const, label: 'Monthly PnL', icon: BarChart3 },
    { id: 'distribution' as const, label: 'Win / Loss', icon: PieChartIcon },
  ];

  const tooltipStyle = {
    background: 'var(--bg-elevated)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    fontSize: '11px',
    color: 'var(--text-primary)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  };

  const lastEquity = equityData[equityData.length - 1]?.pnl ?? 0;
  const equityColor = lastEquity >= 0 ? TV_BULL : TV_BEAR;

  return (
    <div className="bg-[var(--bg-surface)] border hairline border-[var(--border)] rounded-2xl overflow-hidden mb-4">
      <div className="flex border-b hairline border-[var(--border)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-all duration-200 ${
              tab === t.id
                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] bg-[var(--accent-subtle)]'
                : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 h-72">
        {tab === 'equity' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-secondary)' }} />
              <Line type="monotone" dataKey="pnl" stroke={equityColor} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {tab === 'monthly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? TV_BULL : TV_BEAR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {tab === 'distribution' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={distData} cx="50%" cy="50%" outerRadius={90} innerRadius={40} dataKey="value" label={({ name, value }) => `${name}: ${value}`} paddingAngle={2}>
                {distData.map((entry, i) => (
                  <Cell key={i} fill={TV_COLORS[entry.name as keyof typeof TV_COLORS] || '#434651'} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

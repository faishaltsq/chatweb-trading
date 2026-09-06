'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

interface RRTableProps {
  data: string;
}

interface ParsedTable {
  setups: string[];
  rows: { field: string; values: string[] }[];
}

function parseTable(raw: string): ParsedTable | null {
  const lines = raw.trim().split('\n').filter((l) => l.trim());
  if (lines.length < 2) return null;

  const headerLine = lines[0];
  const isComma = (headerLine.match(/,/g) || []).length >= 1 && /FIELD\s*,/.test(headerLine);

  function splitLine(line: string): string[] {
    if (isComma) {
      return line.split(/,(?![^(]*\))/).map((p) => p.trim());
    }
    return line.split(/\s{2,}/).map((p) => p.trim()).filter(Boolean);
  }

  const headerParts = splitLine(lines[0]);
  if (headerParts.length < 2) return null;

  const setups = headerParts.slice(1);
  const rows: { field: string; values: string[] }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = splitLine(lines[i]);
    if (!parts[0]) continue;
    rows.push({
      field: parts[0].toUpperCase().replace(/[/\\]/g, '-'),
      values: parts.slice(1)
        .map((v) => v.replace(/(\d)\.(\d{3})(?!\d)/g, '$1$2'))
        .concat(Array(setups.length).fill('-'))
        .slice(0, setups.length),
    });
  }

  return { setups, rows };
}

function parsePrice(val: string): number | null {
  let cleaned = val.replace(/[^0-9.,-]/g, '');
  cleaned = cleaned.replace(/(\d)\.(\d{3})(?!\d)/g, '$1$2');
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function isGoldPair(setups: string[]): boolean {
  return setups.some((s) => /XAU|GOLD/i.test(s));
}

function calcDistance(a: number, b: number, gold: boolean): string {
  const diff = Math.abs(a - b);
  if (gold) return `${diff.toFixed(2)} pts`;
  return `${(diff * 10000).toFixed(1)} pips`;
}

function calcRR(risk: number, reward: number): string {
  if (risk <= 0) return '—';
  return `1:${(reward / risk).toFixed(2)}`;
}

function injectCalculations(parsed: ParsedTable): ParsedTable {
  const gold = isGoldPair(parsed.setups);
  const result: { field: string; values: string[] }[] = [];

  const entryRow = parsed.rows.find((r) => r.field === 'ENTRY');
  const slRow = parsed.rows.find((r) => r.field === 'SL');

  const entries = entryRow?.values.map(parsePrice) ?? [];
  const sls = slRow?.values.map(parsePrice) ?? [];

  const risks = entries.map((e, i) => {
    if (e == null || sls[i] == null) return null;
    return Math.abs(e - sls[i]!);
  });

  for (const row of parsed.rows) {
    result.push(row);

    if (row.field === 'SL') {
      result.push({
        field: 'RISK',
        values: risks.map((r, i) => {
          if (r == null) return '—';
          return calcDistance(entries[i]!, sls[i]!, gold);
        }),
      });
    }

    if (/^TP\d*$/.test(row.field)) {
      const tpPrices = row.values.map(parsePrice);
      const rewards = tpPrices.map((tp, i) => {
        if (tp == null || entries[i] == null) return null;
        return Math.abs(tp - entries[i]!);
      });

      result.push({
        field: `REWARD (${row.field})`,
        values: rewards.map((r, i) => {
          if (r == null) return '—';
          return calcDistance(entries[i]!, tpPrices[i]!, gold);
        }),
      });

      result.push({
        field: `RR (${row.field})`,
        values: rewards.map((r, i) => {
          if (r == null || risks[i] == null) return '—';
          return calcRR(risks[i]!, r);
        }),
      });
    }
  }

  return { setups: parsed.setups, rows: result };
}

function isPrice(val: string): boolean {
  return /^[\d,.]+(\.\d+)?(\s*(pts|pips))?$/.test(val.trim()) && !isNaN(parseFloat(val));
}

function isCalculated(field: string): boolean {
  return field === 'RISK' || field.startsWith('REWARD') || field.startsWith('RR');
}

function CopyCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const numOnly = value.replace(/[^0-9.-]/g, '');
    navigator.clipboard.writeText(numOnly).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  const canCopy = isPrice(value) && value !== '—' && value !== '-';

  if (!canCopy) {
    return <span className="text-[var(--text-secondary)] font-mono">{value || '—'}</span>;
  }

  return (
    <button
      onClick={handleCopy}
      className="group/cell inline-flex items-center gap-1 hover:text-white transition-colors rounded-md px-1.5 -mx-1.5 hover:bg-white/8 font-mono"
      title={`Copy ${value}`}
    >
      <span>{value}</span>
      <span className="opacity-0 group-hover/cell:opacity-100 transition-opacity">
        {copied
          ? <Check size={11} className="text-[var(--bull)]" />
          : <Copy size={11} className="text-[var(--text-muted)]" />
        }
      </span>
    </button>
  );
}

function cellColor(field: string, _value: string, setupIndex: number, setups: string[]): string {
  const setupName = setups[setupIndex]?.toUpperCase() ?? '';
  const isLong = /LONG|BUY/.test(setupName);
  const isShort = /SHORT|SELL/.test(setupName);

  if (field === 'SL') return 'text-[var(--bear)]';
  if (field === 'RISK') return 'text-[var(--bear)]';
  if (/^TP/.test(field) && !field.startsWith('REWARD') && !field.startsWith('RR')) return 'text-[var(--bull)]';
  if (field.startsWith('REWARD')) return 'text-[var(--bull)]';
  if (field.startsWith('RR')) return 'text-[var(--warning)] font-bold';
  if (field === 'ENTRY') {
    if (isLong) return 'text-[var(--bull)]';
    if (isShort) return 'text-[var(--bear)]';
    return 'text-[var(--text-primary)]';
  }
  return 'text-[var(--text-secondary)]';
}

function fieldLabel(field: string): string {
  const map: Record<string, string> = {
    'FIELD': 'Setup',
    'TRIGGER': 'Trigger',
    'ENTRY': 'Entry Price',
    'SL': 'Stop Loss',
    'TP1': 'Take Profit 1',
    'TP2': 'Take Profit 2',
    'TP3': 'Take Profit 3',
    'TP4': 'Take Profit 4',
    'RISK': 'Risk',
    'INVALIDATION': 'Invalidation',
  };

  const rewardMatch = field.match(/^REWARD \(TP(\d+)\)$/);
  if (rewardMatch) return `Reward (Take Profit ${rewardMatch[1]})`;

  const rrMatch = field.match(/^RR \(TP(\d+)\)$/);
  if (rrMatch) return `Risk Reward (Take Profit ${rrMatch[1]})`;

  return map[field] || field.charAt(0) + field.slice(1).toLowerCase().replace(/_/g, ' ');
}

function setupColor(name: string): string {
  const n = name.toUpperCase();
  if (/LONG|BUY/.test(n)) return 'text-[var(--bull)]';
  if (/SHORT|SELL/.test(n)) return 'text-[var(--bear)]';
  return 'text-[var(--info)]';
}

export default function RRTable({ data }: RRTableProps) {
  const parsed = parseTable(data);
  if (!parsed) return null;

  const enriched = injectCalculations(parsed);
  const { setups, rows } = enriched;

  return (
    <div className="my-3 overflow-x-auto rounded-xl border hairline border-[var(--border-bright)]">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-[var(--bg-surface)]">
            <th className="px-3 py-2.5 text-left font-semibold text-[var(--text-muted)] border-b hairline border-[var(--border)] border-r hairline border-[var(--border)] w-32 sticky left-0 bg-[var(--bg-surface)] z-10">
              SETUP
            </th>
            {setups.map((s, i) => (
              <th key={i} className={`px-3 py-2.5 text-center font-semibold border-b hairline border-[var(--border)] ${i < setups.length - 1 ? 'border-r hairline border-[var(--border)]' : ''} ${setupColor(s)}`}>
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const isCalc = isCalculated(row.field);
            const isRR = row.field.startsWith('RR');

            return (
              <tr
                key={ri}
                className={`border-b hairline border-[var(--border)] transition-colors ${
                  isRR
                    ? 'bg-[var(--warning)]/[0.04]'
                    : isCalc
                    ? 'bg-white/[0.015]'
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                <td className={`px-3 py-2 font-medium border-r hairline border-[var(--border)] sticky left-0 z-10 ${
                  isRR ? 'bg-[var(--warning)]/[0.04]' : isCalc ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-root)]'
                } ${isCalc ? 'text-[var(--text-muted)] text-[11px]' : 'text-[var(--text-secondary)]'}`}>
                  {fieldLabel(row.field)}
                </td>
                {row.values.map((val, ci) => (
                  <td
                    key={ci}
                    className={`px-3 py-2 text-center ${ci < setups.length - 1 ? 'border-r hairline border-[var(--border)]' : ''} ${cellColor(row.field, val, ci, setups)}`}
                  >
                    <CopyCell value={val} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

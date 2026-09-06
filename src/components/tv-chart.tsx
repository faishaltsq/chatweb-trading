'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const SYMBOL_MAP: Record<string, string> = {
  XAUUSD: 'OANDA:XAUUSD',
  GOLD: 'OANDA:XAUUSD',
  XAGUSD: 'OANDA:XAGUSD',
  SILVER: 'OANDA:XAGUSD',
  EURUSD: 'OANDA:EURUSD',
  GBPUSD: 'OANDA:GBPUSD',
  USDJPY: 'OANDA:USDJPY',
  AUDUSD: 'OANDA:AUDUSD',
  USDCAD: 'OANDA:USDCAD',
  NZDUSD: 'OANDA:NZDUSD',
  USDCHF: 'OANDA:USDCHF',
  GBPJPY: 'OANDA:GBPJPY',
  EURJPY: 'OANDA:EURJPY',
  EURGBP: 'OANDA:EURGBP',
  BTCUSD: 'BINANCE:BTCUSDT',
  BTCUSDT: 'BINANCE:BTCUSDT',
  ETHUSD: 'BINANCE:ETHUSDT',
  ETHUSDT: 'BINANCE:ETHUSDT',
  US30: 'FOREXCOM:DJI',
  NAS100: 'NASDAQ:NDX',
  SPX500: 'SP:SPX',
  USOIL: 'TVC:USOIL',
};

const INTERVAL_LABELS: Record<string, string> = {
  '1': '1M',
  '5': '5M',
  '15': '15M',
  '30': '30M',
  '60': '1H',
  '120': '2H',
  '240': '4H',
  'D': '1D',
  '1D': '1D',
  'W': '1W',
  '1W': '1W',
  'M': '1MN',
  '1M': '1MN',
};

const DEFAULT_TIMEFRAMES = ['15', '60', '240', '1D'];

interface TVChartProps {
  pair: string;
  intervals?: string[];
}

export default function TVChart({ pair, intervals = [] }: TVChartProps) {
  const cleanPair = pair.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const tvSymbol = SYMBOL_MAP[cleanPair] || `OANDA:${cleanPair}`;

  // Timeframes: use parsed intervals if provided, else fallback to standard defaults
  const availableIntervals = intervals.length > 0 ? intervals : DEFAULT_TIMEFRAMES;
  const [activeInterval, setActiveInterval] = useState(availableIntervals[0] || '240');
  const [collapsed, setCollapsed] = useState(false);

  const encodedSymbol = encodeURIComponent(tvSymbol);
  const widgetUrl = `https://www.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodedSymbol}&interval=${activeInterval}&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=0b0f14&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&hide_top_toolbar=1&hide_legend=0&locale=en`;

  return (
    <div className="my-3 chart-panel rounded-2xl border hairline border-[var(--border-bright)] overflow-hidden shadow-2xl animate-slideUp">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b hairline border-[var(--border)] bg-[var(--bg-surface)]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
            {cleanPair}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] font-mono border hairline border-[var(--accent-dim)]">
            {INTERVAL_LABELS[activeInterval] || activeInterval}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Multi-timeframe Selector Tabs */}
          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] p-0.5 rounded-lg border hairline border-[var(--border)]">
            {availableIntervals.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setActiveInterval(tf)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  activeInterval === tf
                    ? 'bg-[var(--accent)] text-white font-semibold'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                {INTERVAL_LABELS[tf] || tf}
              </button>
            ))}
          </div>

          <a
            href={`https://www.tradingview.com/chart/?symbol=${encodedSymbol}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open on TradingView"
            className="p-1 rounded text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <ExternalLink size={12} />
          </a>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand Chart' : 'Collapse Chart'}
            className="p-1 rounded text-[var(--text-muted)] hover:text-white transition-colors"
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Chart Viewport */}
      {!collapsed && (
        <div className="relative h-64 md:h-80 bg-[#0b0f14]">
          <iframe
            key={`${tvSymbol}-${activeInterval}`}
            className="absolute inset-0 size-full border-none"
            src={widgetUrl}
            title={`${cleanPair} TradingView Chart`}
            loading="lazy"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

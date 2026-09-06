'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

// Specific mapped assets (Forex, Commodities, Indices, Crypto)
const SYMBOL_MAP: Record<string, string> = {
  // Commodities & Metals
  XAUUSD: 'OANDA:XAUUSD',
  GOLD: 'OANDA:XAUUSD',
  XAGUSD: 'OANDA:XAGUSD',
  SILVER: 'OANDA:XAGUSD',
  USOIL: 'TVC:USOIL',
  UKOIL: 'TVC:UKOIL',

  // Major & Cross Forex
  EURUSD: 'FX:EURUSD',
  GBPUSD: 'FX:GBPUSD',
  USDJPY: 'FX:USDJPY',
  AUDUSD: 'FX:AUDUSD',
  USDCAD: 'FX:USDCAD',
  NZDUSD: 'FX:NZDUSD',
  USDCHF: 'FX:USDCHF',
  GBPJPY: 'FX:GBPJPY',
  EURJPY: 'FX:EURJPY',
  EURGBP: 'FX:EURGBP',
  AUDJPY: 'FX:AUDJPY',
  CADJPY: 'FX:CADJPY',
  CHFJPY: 'FX:CHFJPY',
  EURCAD: 'FX:EURCAD',
  EURAUD: 'FX:EURAUD',
  GBPCHF: 'FX:GBPCHF',
  GBPAUD: 'FX:GBPAUD',

  // Indices
  US30: 'DJ:DJI',
  DJI: 'DJ:DJI',
  NAS100: 'NASDAQ:NDX',
  NDX: 'NASDAQ:NDX',
  SPX500: 'SP:SPX',
  SPX: 'SP:SPX',
  DXY: 'TVC:DXY',

  // Crypto
  BTCUSD: 'BINANCE:BTCUSDT',
  BTCUSDT: 'BINANCE:BTCUSDT',
  ETHUSD: 'BINANCE:ETHUSDT',
  ETHUSDT: 'BINANCE:ETHUSDT',
  SOLUSD: 'BINANCE:SOLUSDT',
  SOLUSDT: 'BINANCE:SOLUSDT',
  BNBUSD: 'BINANCE:BNBUSDT',
  XRPUSD: 'BINANCE:XRPUSDT',
  DOGEUSD: 'BINANCE:DOGEUSDT',

  // Popular US Stocks (direct mapping)
  AAPL: 'NASDAQ:AAPL',
  TSLA: 'NASDAQ:TSLA',
  NVDA: 'NASDAQ:NVDA',
  MSFT: 'NASDAQ:MSFT',
  AMZN: 'NASDAQ:AMZN',
  GOOGL: 'NASDAQ:GOOGL',
  GOOG: 'NASDAQ:GOOG',
  META: 'NASDAQ:META',
  AMD: 'NASDAQ:AMD',
  NFLX: 'NASDAQ:NFLX',
  INTC: 'NASDAQ:INTC',
  PLTR: 'NASDAQ:PLTR',
  COIN: 'NASDAQ:COIN',
  BABA: 'NYSE:BABA',

  // Popular Indonesian Stocks (IDX)
  BBCA: 'IDX:BBCA',
  BBRI: 'IDX:BBRI',
  BMRI: 'IDX:BMRI',
  BBNI: 'IDX:BBNI',
  TLKM: 'IDX:TLKM',
  ASII: 'IDX:ASII',
  GOTO: 'IDX:GOTO',
  ANTM: 'IDX:ANTM',
  UNVR: 'IDX:UNVR',
  ICBP: 'IDX:ICBP',
  INDF: 'IDX:INDF',
  ADRO: 'IDX:ADRO',
  PGAS: 'IDX:PGAS',
};

// Known forex currencies (3 chars)
const CURRENCIES = new Set(['USD','EUR','GBP','JPY','AUD','CAD','NZD','CHF','SGD','HKD','CNH','TRY','MXN','ZAR','NOK','SEK','DKK','INR','BRL','THB','IDR']);

function resolveTradingViewSymbol(rawPair: string): string {
  const upper = rawPair.trim().toUpperCase();

  // 1. If AI / user already provided explicit exchange prefix (e.g. "NASDAQ:AAPL", "IDX:BBCA", "BINANCE:BTCUSDT")
  if (upper.includes(':')) {
    return upper;
  }

  const clean = upper.replace(/[^A-Z0-9]/g, '');

  // 2. Direct hit in dictionary
  if (SYMBOL_MAP[clean]) {
    return SYMBOL_MAP[clean];
  }

  // 3. Forex pair detection: 6 letters composed of two known 3-letter currencies (e.g. EURTRY, AUDNZD)
  if (clean.length === 6) {
    const c1 = clean.slice(0, 3);
    const c2 = clean.slice(3, 6);
    if (CURRENCIES.has(c1) && CURRENCIES.has(c2)) {
      return `FX:${clean}`;
    }
  }

  // 4. Crypto detection: ends with USDT or USD and longer than 5 chars (e.g. ADAUSDT, AVAXUSD)
  if (clean.endsWith('USDT') && clean.length > 4) {
    return `BINANCE:${clean}`;
  }

  // 5. Indonesian stocks: 4 uppercase letters common format (often ending in A, I, etc.),
  // but if user passes e.g. "BBCA.JK" or "IDX_BBCA"
  if (upper.endsWith('.JK') || upper.startsWith('IDX')) {
    const ticker = clean.replace(/^IDX/, '').replace(/JK$/, '');
    return `IDX:${ticker}`;
  }

  // 6. Default for stocks: if 1-5 alphabetic chars without numbers (e.g. AAPL, DIS, JNJ, V, F)
  // Let TradingView resolve directly or fallback to stock ticker
  if (/^[A-Z]{1,5}$/.test(clean)) {
    return clean;
  }

  // 7. Ultimate fallback: just return the clean symbol, TradingView widget will search best match
  return clean;
}

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
  const tvSymbol = resolveTradingViewSymbol(pair);
  const cleanPair = pair.toUpperCase().trim();

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

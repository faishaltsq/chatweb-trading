export const PAIRS = [
  'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'USDCHF', 'GBPJPY', 'EURJPY', 'EURGBP', 'BTCUSD', 'ETHUSD', 'US30',
  'NAS100', 'SPX500', 'USOIL', 'XAGUSD',
];

export const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN'];

export const STATUSES = ['OPEN', 'WIN', 'LOSS', 'BREAKEVEN'] as const;

export const DIRECTIONS = ['BUY', 'SELL'] as const;

export const EMOTIONS = [
  'Calm', 'Confident', 'Anxious', 'FOMO', 'Greedy', 'Fearful', 'Neutral',
  'Frustrated', 'Excited', 'Disciplined',
];

export type TradeFormData = {
  date: string;
  pair: string;
  direction: string;
  timeframe: string;
  entryPrice: number | null;
  stopLoss: number | null;
  takeProfit: number[];
  lotSize: number | null;
  status: string;
  pnlDollar: number | null;
  pnlPips: number | null;
  tags: string[];
  chartUrl: string;
  notes: string;
  setupRating: number | null;
  emotion: string;
};

export function emptyTrade(): TradeFormData {
  return {
    date: new Date().toISOString().slice(0, 10),
    pair: 'XAUUSD',
    direction: 'BUY',
    timeframe: 'M15',
    entryPrice: null,
    stopLoss: null,
    takeProfit: [],
    lotSize: null,
    status: 'OPEN',
    pnlDollar: null,
    pnlPips: null,
    tags: [],
    chartUrl: '',
    notes: '',
    setupRating: null,
    emotion: '',
  };
}

export function statusColor(status: string): string {
  switch (status) {
    case 'WIN': return 'text-[#26a69a] bg-[#26a69a]/10';
    case 'LOSS': return 'text-[#ef5350] bg-[#ef5350]/10';
    case 'BREAKEVEN': return 'text-amber-400 bg-amber-500/10';
    default: return 'text-[var(--text-muted)] bg-white/5';
  }
}

export function dirColor(dir: string): string {
  return dir === 'BUY' ? 'text-[#26a69a]' : 'text-[#ef5350]';
}

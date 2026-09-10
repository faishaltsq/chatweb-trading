// TradingView Scanner — Live Price & Price Summary for AI injection

// TradingView scanner symbol dictionary
const TV_SCANNER_MAP: Record<string, string> = {
  // Forex & Metals (Live spot prices)
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
  AUDJPY: 'OANDA:AUDJPY',
  CADJPY: 'OANDA:CADJPY',
  CHFJPY: 'OANDA:CHFJPY',
  EURCAD: 'OANDA:EURCAD',
  EURAUD: 'OANDA:EURAUD',
  GBPCHF: 'OANDA:GBPCHF',
  GBPAUD: 'OANDA:GBPAUD',

  // Crypto
  BTCUSD: 'BINANCE:BTCUSDT',
  BTC: 'BINANCE:BTCUSDT',
  BTCUSDT: 'BINANCE:BTCUSDT',
  ETHUSD: 'BINANCE:ETHUSDT',
  ETH: 'BINANCE:ETHUSDT',
  ETHUSDT: 'BINANCE:ETHUSDT',
  SOLUSD: 'BINANCE:SOLUSDT',
  SOL: 'BINANCE:SOLUSDT',
  SOLUSDT: 'BINANCE:SOLUSDT',
  BNBUSD: 'BINANCE:BNBUSDT',
  XRPUSD: 'BINANCE:XRPUSDT',
  DOGEUSD: 'BINANCE:DOGEUSDT',

  // Indices
  NAS100: 'NASDAQ:NDX',
  NASDAQ: 'NASDAQ:NDX',
  NDX: 'NASDAQ:NDX',
  SPX500: 'SP:SPX',
  SPX: 'SP:SPX',
  SP500: 'SP:SPX',
  US30: 'DJ:DJI',
  DJI: 'DJ:DJI',
  DXY: 'TVC:DXY',
  NIKKEI: 'TVC:NI225',
  DAX: 'XETR:DAX',

  // Commodities
  USOIL: 'NYMEX:CL1!',
  OIL: 'NYMEX:CL1!',
  UKOIL: 'NYMEX:BB1!',

  // US Stocks
  AAPL: 'NASDAQ:AAPL',
  TSLA: 'NASDAQ:TSLA',
  NVDA: 'NASDAQ:NVDA',
  MSFT: 'NASDAQ:MSFT',
  AMZN: 'NASDAQ:AMZN',
  GOOGL: 'NASDAQ:GOOGL',
  META: 'NASDAQ:META',
  AMD: 'NASDAQ:AMD',
  BABA: 'NYSE:BABA',
  NFLX: 'NASDAQ:NFLX',
  INTC: 'NASDAQ:INTC',
  PLTR: 'NASDAQ:PLTR',
  COIN: 'NASDAQ:COIN',

  // IDX Stocks
  BBCA: 'IDX:BBCA',
  BBRI: 'IDX:BBRI',
  BMRI: 'IDX:BMRI',
  BBNI: 'IDX:BBNI',
  TLKM: 'IDX:TLKM',
  ASII: 'IDX:ASII',
  GOTO: 'IDX:GOTO',
  ANTM: 'IDX:ANTM',
  UNVR: 'IDX:UNVR',
  ADRO: 'IDX:ADRO',
  BREN: 'IDX:BREN',
  ICBP: 'IDX:ICBP',
  INDF: 'IDX:INDF',
  PGAS: 'IDX:PGAS',
  MDKA: 'IDX:MDKA',
  KLBF: 'IDX:KLBF',
};

export interface TVScannerQuote {
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  change?: number;
  change_abs?: number;
}

// Fetch live quote from TradingView Scanner API
export async function fetchTradingViewPrice(rawPair: string): Promise<{ quote: TVScannerQuote; symbol: string } | null> {
  const upper = rawPair.trim().toUpperCase().replace(/[^A-Z0-9.:_-]/g, '');
  let tvSymbol = TV_SCANNER_MAP[upper];

  if (!tvSymbol) {
    if (upper.includes(':')) {
      tvSymbol = upper;
    } else if (/^[A-Z]{4}$/.test(upper)) {
      tvSymbol = `IDX:${upper}`;
    } else if (/^[A-Z]{1,5}$/.test(upper)) {
      tvSymbol = `NASDAQ:${upper}`;
    } else {
      tvSymbol = `OANDA:${upper}`;
    }
  }

  const url = `https://scanner.tradingview.com/symbol?symbol=${encodeURIComponent(tvSymbol)}&fields=close,open,high,low,volume,change,change_abs&no_404=1`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 10 },
    });

    if (!res.ok) return null;

    const text = await res.text();
    if (!text || text === 'null' || text === '404') return null;

    const quote: TVScannerQuote = JSON.parse(text);
    if (quote.close == null || isNaN(quote.close)) return null;

    return { quote, symbol: tvSymbol };
  } catch {
    return null;
  }
}

// Price summary for Claude prompt injection — TradingView Scanner only
export async function fetchPriceSummary(pair: string): Promise<string | null> {
  try {
    const tvData = await fetchTradingViewPrice(pair);
    if (!tvData) return null;

    const { quote, symbol } = tvData;
    const upper = pair.trim().toUpperCase();

    const isDailyOnly = symbol.startsWith('IDX:');
    const displayName = upper;

    const livePrice = quote.close;
    const liveOpen = quote.open;
    const liveHigh = quote.high;
    const liveLow = quote.low;
    const changePercent = quote.change ?? 0;

    const changeSign = changePercent >= 0 ? '+' : '';
    const formattedPrice = `${livePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}`;

    let notes = '';
    if (isDailyOnly) notes += '• Saham IDX data harian resmi (EOD).\n';

    return `[DATA PASAR REAL-TIME — GUNAKAN ANGKA INI UNTUK LEVEL ENTRY/SL/TP]
Sumber: TradingView Scanner (${symbol})
Aset: ${displayName}
Harga Terkini: ${formattedPrice} (${changeSign}${Number(changePercent).toFixed(2)}%)
Candle Terakhir: Open ${liveOpen ?? '-'}, High ${liveHigh ?? '-'}, Low ${liveLow ?? '-'}, Close ${livePrice}
${notes}PENTING: Gunakan level harga di atas sebagai acuan mutlak. JANGAN gunakan harga lama dari memori pelatihanmu! Fokus pada struktur teknikal dan level relatif.`;
  } catch {
    return null;
  }
}

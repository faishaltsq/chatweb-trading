// Yahoo Finance Market Data Fetcher
// Universal mapper: IDX stocks, US stocks, Crypto, Forex, Indices

export interface Candle {
  time: number; // UTCTimestamp in seconds (required by lightweight-charts v5)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketMeta {
  symbol: string;
  displayName: string;
  price: number;
  currency: string;
  changePercent?: number;
  previousClose?: number;
  high52w?: number;
  low52w?: number;
  isDailyOnly?: boolean;
}

export interface MarketDataResult {
  meta: MarketMeta;
  candles: Candle[];
}

// Map pair string to Yahoo Finance ticker
export function resolveYahooSymbol(raw: string): { symbol: string; displayName: string; isDailyOnly: boolean } {
  const upper = raw.trim().toUpperCase().replace(/[^A-Z0-9.:_-]/g, '');

  // 1. Explicit ticker check (e.g. BBCA.JK, ^GSPC, BTC-USD)
  if (upper.includes('.') || upper.startsWith('^') || upper.includes('-') || upper.includes('=')) {
    const isIdx = upper.endsWith('.JK');
    return { symbol: upper, displayName: upper.replace('.JK', ''), isDailyOnly: isIdx };
  }

  // 2. Known IDX stocks dictionary
  const IDX_STOCKS: Record<string, string> = {
    BBCA: 'BBCA.JK',
    BBRI: 'BBRI.JK',
    BMRI: 'BMRI.JK',
    BBNI: 'BBNI.JK',
    TLKM: 'TLKM.JK',
    ASII: 'ASII.JK',
    GOTO: 'GOTO.JK',
    ANTM: 'ANTM.JK',
    UNVR: 'UNVR.JK',
    ICBP: 'ICBP.JK',
    INDF: 'INDF.JK',
    ADRO: 'ADRO.JK',
    PGAS: 'PGAS.JK',
    BREN: 'BREN.JK',
    MDKA: 'MDKA.JK',
    EMTK: 'EMTK.JK',
    SIDO: 'SIDO.JK',
    KLBF: 'KLBF.JK',
    CPIN: 'CPIN.JK',
    AMMN: 'AMMN.JK',
    BRPT: 'BRPT.JK',
    TPIA: 'TPIA.JK',
  };

  if (IDX_STOCKS[upper]) {
    return { symbol: IDX_STOCKS[upper], displayName: upper, isDailyOnly: true };
  }

  // Handle IDX:BBCA prefix
  if (upper.startsWith('IDX:')) {
    const ticker = upper.replace('IDX:', '');
    return { symbol: `${ticker}.JK`, displayName: ticker, isDailyOnly: true };
  }

  // 3. Known Indices
  const INDICES: Record<string, { symbol: string; name: string }> = {
    NAS100: { symbol: '^NDX', name: 'Nasdaq 100' },
    NASDAQ: { symbol: '^NDX', name: 'Nasdaq 100' },
    NDX: { symbol: '^NDX', name: 'Nasdaq 100' },
    SPX500: { symbol: '^GSPC', name: 'S&P 500' },
    SPX: { symbol: '^GSPC', name: 'S&P 500' },
    SP500: { symbol: '^GSPC', name: 'S&P 500' },
    US30: { symbol: '^DJI', name: 'Dow Jones' },
    DJI: { symbol: '^DJI', name: 'Dow Jones' },
    DOW: { symbol: '^DJI', name: 'Dow Jones' },
    DXY: { symbol: 'DX-Y.NYB', name: 'US Dollar Index' },
    NIKKEI: { symbol: '^N225', name: 'Nikkei 225' },
    DAX: { symbol: '^GDAXI', name: 'DAX 40' },
  };

  if (INDICES[upper]) {
    return { symbol: INDICES[upper].symbol, displayName: INDICES[upper].name, isDailyOnly: false };
  }

  // 4. Commodities & Metals
  const COMMODITIES: Record<string, { symbol: string; name: string }> = {
    XAUUSD: { symbol: 'GC=F', name: 'Gold (XAU/USD)' },
    GOLD: { symbol: 'GC=F', name: 'Gold (XAU/USD)' },
    XAGUSD: { symbol: 'SI=F', name: 'Silver (XAG/USD)' },
    SILVER: { symbol: 'SI=F', name: 'Silver (XAG/USD)' },
    USOIL: { symbol: 'CL=F', name: 'Crude Oil WTI' },
    UKOIL: { symbol: 'BZ=F', name: 'Brent Crude Oil' },
  };

  if (COMMODITIES[upper]) {
    return { symbol: COMMODITIES[upper].symbol, displayName: COMMODITIES[upper].name, isDailyOnly: false };
  }

  // 5. Crypto
  const CRYPTO: Record<string, { symbol: string; name: string }> = {
    BTC: { symbol: 'BTC-USD', name: 'Bitcoin' },
    BTCUSD: { symbol: 'BTC-USD', name: 'Bitcoin' },
    BTCUSDT: { symbol: 'BTC-USD', name: 'Bitcoin' },
    ETH: { symbol: 'ETH-USD', name: 'Ethereum' },
    ETHUSD: { symbol: 'ETH-USD', name: 'Ethereum' },
    ETHUSDT: { symbol: 'ETH-USD', name: 'Ethereum' },
    SOL: { symbol: 'SOL-USD', name: 'Solana' },
    SOLUSD: { symbol: 'SOL-USD', name: 'Solana' },
    SOLUSDT: { symbol: 'SOL-USD', name: 'Solana' },
    BNB: { symbol: 'BNB-USD', name: 'Binance Coin' },
    BNBUSD: { symbol: 'BNB-USD', name: 'Binance Coin' },
    XRP: { symbol: 'XRP-USD', name: 'Ripple' },
    XRPUSD: { symbol: 'XRP-USD', name: 'Ripple' },
    DOGE: { symbol: 'DOGE-USD', name: 'Dogecoin' },
    DOGEUSD: { symbol: 'DOGE-USD', name: 'Dogecoin' },
  };

  if (CRYPTO[upper]) {
    return { symbol: CRYPTO[upper].symbol, displayName: CRYPTO[upper].name, isDailyOnly: false };
  }

  // 6. Major Forex pairs (6 letters)
  const CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'NZD', 'CHF', 'SGD', 'HKD', 'CNH', 'TRY', 'IDR']);
  if (upper.length === 6) {
    const c1 = upper.slice(0, 3);
    const c2 = upper.slice(3, 6);
    if (CURRENCIES.has(c1) && CURRENCIES.has(c2)) {
      return { symbol: `${upper}=X`, displayName: upper, isDailyOnly: false };
    }
  }

  // 7. Popular US Stocks (Direct pass-through)
  const US_STOCKS = new Set([
    'AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'GOOG', 'META', 'AMD',
    'NFLX', 'INTC', 'PLTR', 'COIN', 'BABA', 'DIS', 'JNJ', 'V', 'MA', 'BA',
  ]);
  if (US_STOCKS.has(upper)) {
    return { symbol: upper, displayName: upper, isDailyOnly: false };
  }

  // 8. 4-letter uppercase code heuristic: If not matching any known US stock, treat as Indonesian stock
  if (/^[A-Z]{4}$/.test(upper)) {
    return { symbol: `${upper}.JK`, displayName: upper, isDailyOnly: true };
  }

  // Default: pass through as US ticker
  return { symbol: upper, displayName: upper, isDailyOnly: false };
}

// Convert app interval to Yahoo parameters
export function getYahooIntervalParams(appInterval: string, isDailyOnly: boolean): { interval: string; range: string } {
  // If the asset is Indonesian stock (daily only), lock to daily/weekly
  if (isDailyOnly) {
    if (appInterval === '1W' || appInterval === 'W') return { interval: '1wk', range: '2y' };
    if (appInterval === '1M' || appInterval === 'M') return { interval: '1mo', range: '5y' };
    return { interval: '1d', range: '6mo' };
  }

  switch (appInterval) {
    case '1':
      return { interval: '1m', range: '1d' };
    case '5':
      return { interval: '5m', range: '1d' };
    case '15':
      return { interval: '15m', range: '5d' };
    case '30':
      return { interval: '30m', range: '5d' };
    case '60':
      return { interval: '60m', range: '1mo' };
    case '120':
      return { interval: '60m', range: '2mo' };
    case '240':
      return { interval: '1h', range: '3mo' };
    case '1D':
    case 'D':
      return { interval: '1d', range: '6mo' };
    case '1W':
    case 'W':
      return { interval: '1wk', range: '2y' };
    case '1M':
    case 'M':
      return { interval: '1mo', range: '5y' };
    default:
      return { interval: '1d', range: '6mo' };
  }
}

// Fetch candles from Yahoo Finance
export async function fetchCandles(pair: string, appInterval = '1D'): Promise<MarketDataResult | null> {
  const { symbol, displayName, isDailyOnly } = resolveYahooSymbol(pair);
  const { interval, range } = getYahooIntervalParams(appInterval, isDailyOnly);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      next: { revalidate: 60 }, // Cache 60 seconds
    });

    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const timestamps: number[] = result.timestamp || [];
    const quote = result.indicators?.quote?.[0];

    if (!quote || timestamps.length === 0) return null;

    const candles: Candle[] = [];
    const seenTimes = new Set<number>();

    for (let i = 0; i < timestamps.length; i++) {
      const t = timestamps[i];
      const o = quote.open?.[i];
      const h = quote.high?.[i];
      const l = quote.low?.[i];
      const c = quote.close?.[i];
      const v = quote.volume?.[i] || 0;

      // Filter invalid or duplicate bars
      if (
        t != null &&
        o != null &&
        h != null &&
        l != null &&
        c != null &&
        !isNaN(o) &&
        !isNaN(h) &&
        !isNaN(l) &&
        !isNaN(c) &&
        !seenTimes.has(t)
      ) {
        seenTimes.add(t);
        candles.push({
          time: t, // UTCTimestamp in seconds
          open: Number(o.toFixed(4)),
          high: Number(h.toFixed(4)),
          low: Number(l.toFixed(4)),
          close: Number(c.toFixed(4)),
          volume: Math.round(v),
        });
      }
    }

    // Sort ascending by time
    candles.sort((a, b) => a.time - b.time);

    const price = meta.regularMarketPrice ?? candles[candles.length - 1]?.close ?? 0;
    const prevClose = meta.previousClose ?? candles[candles.length - 2]?.close;
    const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : undefined;

    return {
      meta: {
        symbol,
        displayName,
        price,
        currency: meta.currency || 'USD',
        changePercent: changePercent != null ? Number(changePercent.toFixed(2)) : undefined,
        previousClose: prevClose,
        high52w: meta.fiftyTwoWeekHigh,
        low52w: meta.fiftyTwoWeekLow,
        isDailyOnly,
      },
      candles,
    };
  } catch (err) {
    console.error(`[YahooFinance] Failed to fetch ${symbol}:`, err);
    return null;
  }
}

// Quick price summary for Claude prompt injection (executes in < 1 sec)
export async function fetchPriceSummary(pair: string): Promise<string | null> {
  try {
    const data = await fetchCandles(pair, '1D');
    if (!data || data.candles.length === 0) return null;

    const { meta, candles } = data;
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];

    // Compute simple 30-candle support & resistance
    const recent30 = candles.slice(-30);
    const low30 = Math.min(...recent30.map((c) => c.low));
    const high30 = Math.max(...recent30.map((c) => c.high));

    const changeSign = (meta.changePercent ?? 0) >= 0 ? '+' : '';
    const formattedPrice = meta.currency === 'IDR'
      ? `Rp ${meta.price.toLocaleString('id-ID')}`
      : `$${meta.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;

    return `[DATA PASAR REAL-TIME TERVERIFIKASI - GUNAKAN ANGKA INI UNTUK LEVEL ENTRY/SL/TP]
Aset: ${meta.displayName} (${meta.symbol})
Harga Terkini: ${formattedPrice} (${changeSign}${meta.changePercent ?? 0}%)
Candle Terakhir: Open ${last.open}, High ${last.high}, Low ${last.low}, Close ${last.close}
${prev ? `Candle Sebelumnya: Close ${prev.close}` : ''}
Range 30 Hari: Low ${low30} — High ${high30}
${meta.isDailyOnly ? 'Catatan: Saham IDX hanya tersedia data harian (EOD).' : ''}
PENTING: Gunakan level harga di atas sebagai acuan mutlak. JANGAN gunakan harga lama dari memori pelatihanmu!`;
  } catch {
    return null;
  }
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type UTCTimestamp,
} from 'lightweight-charts';
import { ChevronDown, ChevronUp, ExternalLink, RefreshCw, AlertCircle, ImageUp } from 'lucide-react';
import TVChart from './tv-chart';

interface LWChartProps {
  pair: string;
  intervals?: string[];
}

interface HoverOHLC {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface MarketMeta {
  symbol: string;
  displayName: string;
  price: number;
  currency: string;
  changePercent?: number;
  isDailyOnly?: boolean;
}

const INTERVAL_LABELS: Record<string, string> = {
  '1': '1M',
  '5': '5M',
  '15': '15M',
  '30': '30M',
  '60': '1H',
  '120': '2H',
  '240': '4H',
  '1D': '1D',
  '1W': '1W',
  '1M': '1MN',
};

const DEFAULT_INTERVALS = ['15', '60', '240', '1D'];
const IDX_INTERVALS = ['1D', '1W', '1M'];

export default function LWChart({ pair, intervals = [] }: LWChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [activeInterval, setActiveInterval] = useState(intervals[0] || '1D');
  const [candles, setCandles] = useState<CandlestickData<UTCTimestamp>[]>([]);
  const [meta, setMeta] = useState<MarketMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hoverData, setHoverData] = useState<HoverOHLC | null>(null);

  // Available interval buttons
  const isIdx = meta?.isDailyOnly ?? false;
  const availableIntervals = isIdx
    ? IDX_INTERVALS
    : intervals.length > 0
    ? intervals
    : DEFAULT_INTERVALS;

  // 1. Fetch candles from internal API
  const loadCandles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market/candles?pair=${encodeURIComponent(pair)}&interval=${activeInterval}`);
      if (!res.ok) {
        // Fallback to TradingView embed if Yahoo Finance has no data
        setUseFallback(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!data.candles || data.candles.length === 0) {
        setUseFallback(true);
        setLoading(false);
        return;
      }

      setMeta(data.meta);

      // Map to LWC v5 CandlestickData<UTCTimestamp>
      const formatted: CandlestickData<UTCTimestamp>[] = data.candles.map(
        (c: { time: number; open: number; high: number; low: number; close: number }) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        })
      );

      setCandles(formatted);
      setUseFallback(false);
    } catch {
      setUseFallback(true);
    } finally {
      setLoading(false);
    }
  }, [pair, activeInterval]);

  useEffect(() => {
    loadCandles();
  }, [loadCandles]);

  // 2. Initialize & Update Lightweight Chart
  useEffect(() => {
    if (useFallback || !containerRef.current || candles.length === 0 || collapsed) {
      return;
    }

    // Destroy existing chart before recreating
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    const container = containerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#0b0f14' },
        textColor: '#787b86',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(77, 163, 255, 0.4)', width: 1, style: 3 },
        horzLine: { color: 'rgba(77, 163, 255, 0.4)', width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        textColor: '#787b86',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: activeInterval !== '1D' && activeInterval !== '1W',
        secondsVisible: false,
      },
      autoSize: true,
    });

    // v5 Series creation
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    series.setData(candles);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    // Subscribe hover for OHLC display
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setHoverData(null);
        return;
      }
      const data = param.seriesData.get(series) as CandlestickData<UTCTimestamp> | undefined;
      if (data && 'open' in data) {
        setHoverData({
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
        });
      } else {
        setHoverData(null);
      }
    });

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [candles, useFallback, collapsed, activeInterval]);

  // Fallback 1: TradingView iframe embed
  if (useFallback) {
    return <TVChart pair={pair} intervals={intervals} />;
  }

  const currentPrice = meta?.price;
  const changePercent = meta?.changePercent;
  const isUp = (changePercent ?? 0) >= 0;

  const displayOHLC = hoverData || (candles.length > 0
    ? {
        open: candles[candles.length - 1].open,
        high: candles[candles.length - 1].high,
        low: candles[candles.length - 1].low,
        close: candles[candles.length - 1].close,
      }
    : null);

  return (
    <div className="my-3 chart-panel rounded-2xl border hairline border-[var(--border-bright)] overflow-hidden shadow-2xl animate-slideUp">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b hairline border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-md">
        {/* Left: Asset info + Price */}
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
            {meta?.displayName || pair.toUpperCase()}
          </span>
          {meta?.currency && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-muted)] font-mono">
              {meta.currency}
            </span>
          )}
          {currentPrice != null && (
            <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
              {meta?.currency === 'IDR'
                ? currentPrice.toLocaleString('id-ID')
                : currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
          )}
          {changePercent != null && (
            <span className={`text-[10px] font-mono font-semibold ${isUp ? 'text-[var(--bull)]' : 'text-[var(--bear)]'}`}>
              {isUp ? '+' : ''}{changePercent}%
            </span>
          )}
          <span className="flex items-center gap-1 text-[9px] font-mono text-[var(--bull)] uppercase tracking-wider bg-[var(--bull)]/10 px-1.5 py-0.5 rounded border hairline border-[var(--bull)]/20">
            <span className="size-1 rounded-full bg-[var(--bull)] animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Center: Live Hover OHLC */}
        {displayOHLC && !collapsed && (
          <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-[var(--text-muted)]">
            <span>O <span className="text-[var(--text-secondary)]">{displayOHLC.open}</span></span>
            <span>H <span className="text-[var(--text-secondary)]">{displayOHLC.high}</span></span>
            <span>L <span className="text-[var(--text-secondary)]">{displayOHLC.low}</span></span>
            <span>C <span className={displayOHLC.close >= displayOHLC.open ? 'text-[var(--bull)] font-semibold' : 'text-[var(--bear)] font-semibold'}>{displayOHLC.close}</span></span>
          </div>
        )}

        {/* Right: Timeframe Switcher + Controls */}
        <div className="flex items-center gap-2">
          {/* Multi-TF Selector */}
          <div className="flex items-center gap-0.5 bg-[var(--bg-elevated)] p-0.5 rounded-lg border hairline border-[var(--border)]">
            {availableIntervals.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setActiveInterval(tf)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  activeInterval === tf
                    ? 'bg-[var(--accent)] text-white font-semibold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                {INTERVAL_LABELS[tf] || tf}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={loadCandles}
            title="Refresh candle data"
            className="p-1 rounded text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <RefreshCw size={11} className={loading ? 'animate-spin text-[var(--accent)]' : ''} />
          </button>

          <a
            href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(pair)}`}
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

      {/* Notice for Daily-Only assets */}
      {isIdx && !collapsed && (
        <div className="px-4 py-1.5 bg-white/[0.02] border-b hairline border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
          <span className="flex items-center gap-1.5">
            <AlertCircle size={10} className="text-[var(--warning)]" />
            Saham IDX data resmi bersifat harian (EOD). Timeframe intraday (M15/H1) tidak tersedia gratis dari bursa.
          </span>
          <span className="text-[9px] opacity-60">TradingView Lightweight Charts™ v5</span>
        </div>
      )}

      {/* Chart Viewport */}
      {!collapsed && (
        <div className="relative h-64 md:h-80 bg-[#0b0f14] w-full">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0b0f14]/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                <span className="size-2 rounded-full bg-[var(--accent)] animate-ping" />
                Memuat data candle {meta?.displayName || pair}...
              </div>
            </div>
          )}
          <div ref={containerRef} className="size-full" />
        </div>
      )}
    </div>
  );
}

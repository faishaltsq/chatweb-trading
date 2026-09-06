import Link from 'next/link';
import { ArrowRight, BookOpen, CandlestickChart, CircleDot, LineChart, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-dvh bg-[var(--bg-root)] text-[var(--text-primary)] flex flex-col">
      <nav className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 border-b hairline border-[var(--border)] glass sticky top-0 z-50">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="size-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center border hairline border-[var(--accent-dim)] flex-shrink-0">
            <LineChart size={16} className="text-[var(--accent)]" />
          </div>
          <span className="text-sm font-semibold tracking-tight">TradingChat <span className="text-[var(--text-muted)] font-normal hidden sm:inline">/ terminal</span></span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Link href="/chat" className="px-3 py-2 min-h-[36px] rounded-lg text-xs text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors flex items-center touch-manipulation">Analysis</Link>
          <Link href="/journal" className="px-3 py-2 min-h-[36px] rounded-lg text-xs text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors flex items-center touch-manipulation">Journal</Link>
        </div>
      </nav>
      <main className="flex-1 tv-grid-bg relative overflow-hidden px-3.5 py-6 sm:px-6 md:px-10 md:py-12">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2.5">
                <CircleDot size={12} className="text-[var(--bull)] flex-shrink-0" /> Market workspace <span className="text-[var(--border-bright)]">/</span> AI research
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-[-0.04em] leading-tight text-balance">Read the market<br /><span className="text-[var(--accent)]">with more signal.</span></h1>
            </div>
            <div className="font-mono text-left sm:text-right text-xs text-[var(--text-muted)]">
              <div className="text-[var(--bull)] flex items-center gap-1.5">● LIVE · AI ONLINE</div>
              <div className="mt-1 opacity-70">UTC 09:42:18</div>
            </div>
          </div>
          <div className="chart-panel rounded-2xl border hairline border-[var(--border-bright)] overflow-hidden shadow-2xl mb-6">
            <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 border-b hairline border-[var(--border)]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs sm:text-sm font-semibold">XAUUSD</span>
                <span className="text-xs text-[var(--bull)] font-mono">2,341.82 +0.84%</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-[var(--text-muted)]">
                <span className="hover:text-white transition-colors cursor-pointer">1H</span>
                <span className="text-[var(--accent)] font-semibold">4H</span>
                <span className="hover:text-white transition-colors cursor-pointer">1D</span>
              </div>
            </div>
            <div className="relative h-64 sm:h-72 md:h-[26rem] bg-[#0b0f14]">
              <iframe className="absolute inset-0 size-full" src="https://www.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=OANDA%3AXAUUSD&interval=240&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=0b0f14&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&hide_top_toolbar=1&hide_legend=0&locale=en" title="Live XAUUSD TradingView chart" loading="lazy" allowFullScreen />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-3xl">
            <Link href="/chat" className="group flex items-center gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)]/90 border hairline border-[var(--border)] hover:border-[var(--accent-dim)] hover:-translate-y-0.5 transition-all touch-manipulation">
              <div className="size-10 sm:size-11 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center border hairline border-[var(--accent-dim)] flex-shrink-0">
                <CandlestickChart size={20} className="text-[var(--accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">Open analysis desk</div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-5 line-clamp-2">Upload a chart and get entry, risk, and scenario context.</div>
              </div>
              <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" />
            </Link>
            <Link href="/journal" className="group flex items-center gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)]/90 border hairline border-[var(--border)] hover:border-[var(--bull)]/40 hover:-translate-y-0.5 transition-all touch-manipulation">
              <div className="size-10 sm:size-11 rounded-xl bg-[var(--bull)]/10 flex items-center justify-center border hairline border-[var(--bull)]/20 flex-shrink-0">
                <BookOpen size={20} className="text-[var(--bull)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">Review journal</div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-5 line-clamp-2">Track execution quality, P&L, and recurring patterns.</div>
              </div>
              <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--bull)] transition-colors flex-shrink-0" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 sm:mt-8 text-[10px] sm:text-xs font-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5"><Activity size={12} className="text-[var(--accent)]" /> Gemini Vision</span>
            <span>CLAUDE SONNET</span>
            <span>RISK-FIRST ANALYSIS</span>
          </div>
        </div>
      </main>
      <footer className="px-4 sm:px-6 py-3 border-t hairline border-[var(--border)] text-center text-[10px] sm:text-xs text-[var(--text-muted)]">TradingChat AI · market intelligence workspace</footer>
    </div>
  );
}

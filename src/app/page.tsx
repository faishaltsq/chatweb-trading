import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-dvh bg-[var(--bg-root)] text-[var(--text-primary)] flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b hairline border-[var(--border)] glass sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center border hairline border-[var(--accent-dim)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight">TradingChat</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/chat"
            className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            Chat
          </Link>
          <Link
            href="/journal"
            className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            Journal
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center tv-grid-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-glow)] via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bull)]/10 text-[var(--bull)] text-xs font-medium mb-8 border hairline border-[var(--bull)]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--bull)] animate-pulse" />
            AI-Powered Trading Analysis
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
            Smarter trades,<br />
            <span className="text-[var(--accent)]">powered by AI.</span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-12 leading-7">
            Send chart screenshots for instant analysis. Get precise entry, stop loss, and take profit levels — backed by Gemini Vision and Claude Sonnet.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link
              href="/chat"
              className="group relative flex items-center gap-4 p-6 rounded-2xl bg-[var(--bg-surface)] border hairline border-[var(--border)] hover:border-[var(--accent-dim)] transition-all duration-300 hover:-translate-y-1 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center flex-shrink-0 border hairline border-[var(--accent-dim)] group-hover:bg-[var(--accent-glow)] transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-[var(--text-primary)] mb-1">Chat Analysis</div>
                <div className="text-xs text-[var(--text-secondary)] leading-5">
                  AI chart analysis with Gemini Vision and trade setups from Claude
                </div>
              </div>
              <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all flex-shrink-0" />
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 shadow-[0_8px_32px_var(--accent-glow)]" />
            </Link>

            <Link
              href="/journal"
              className="group relative flex items-center gap-4 p-6 rounded-2xl bg-[var(--bg-surface)] border hairline border-[var(--border)] hover:border-[var(--bull)]/30 transition-all duration-300 hover:-translate-y-1 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--bull)]/8 flex items-center justify-center flex-shrink-0 border hairline border-[var(--bull)]/15 group-hover:bg-[var(--bull)]/12 transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--bull)]">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-[var(--text-primary)] mb-1">Trading Journal</div>
                <div className="text-xs text-[var(--text-secondary)] leading-5">
                  Track trades, analyze performance, equity curves, and stats
                </div>
              </div>
              <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--bull)] group-hover:translate-x-1 transition-all flex-shrink-0" />
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 shadow-[0_8px_32px_rgba(38,166,154,0.08)]" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-16 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--info)]" />
              Gemini 3.8 Vision
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              Claude Sonnet 4.6
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--bull)]" />
              Real-time Analysis
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 border-t hairline border-[var(--border)] text-center text-[11px] text-[var(--text-muted)]">
        TradingChat AI · Gemini Vision + Claude Sonnet
      </footer>
    </div>
  );
}

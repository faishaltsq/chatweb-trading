'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import RRTable from './rr-table';
import TVChart from './tv-chart';

interface MarkdownRendererProps {
  content: string;
}

interface ExtractedTable {
  id: string;
  data: string;
}

interface ExtractedChart {
  pair: string;
  intervals: string[];
}

function extractChartTag(content: string): { cleaned: string; chart: ExtractedChart | null } {
  let chart: ExtractedChart | null = null;

  // Supports: [chart:XAUUSD:240] [chart:NASDAQ:AAPL:240] [chart:IDX:BBCA:1D,1W] [chart:AAPL]
  const cleaned = content.replace(
    /\[chart:\s*([A-Za-z0-9_:]+?)\s*(?::\s*([0-9A-Za-z,]+))?\s*\]/gi,
    (fullMatch, rawPair, intervalsRaw) => {
      if (!chart) {
        // If rawPair contains `:` and NO intervals were captured, the last segment might be the interval
        // e.g. [chart:NASDAQ:AAPL:240] parses as rawPair="NASDAQ:AAPL:240" intervalsRaw=undefined
        let pair = rawPair;
        let intervals: string[] = [];

        if (intervalsRaw) {
          intervals = intervalsRaw.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean);
        }

        // Handle exchange:ticker:interval pattern
        const colonParts = pair.split(':');
        if (colonParts.length >= 3) {
          const lastPart = colonParts[colonParts.length - 1];
          if (/^[0-9]+[A-Z]?$|^[0-9]+,[0-9A-Z,]+$|^1[DMW]$/i.test(lastPart)) {
            intervals = lastPart.split(',').map((s: string) => s.trim().toUpperCase());
            pair = colonParts.slice(0, -1).join(':');
          }
        }

        chart = { pair: pair.toUpperCase(), intervals };
      }
      return '';
    }
  );

  if (!chart) {
    const KNOWN_PAIRS = [
      'XAUUSD','GOLD','XAGUSD','SILVER','EURUSD','GBPUSD','USDJPY','AUDUSD',
      'USDCAD','NZDUSD','USDCHF','GBPJPY','EURJPY','EURGBP','BTCUSD','BTCUSDT',
      'ETHUSD','ETHUSDT','US30','NAS100','SPX500','USOIL',
      'AAPL','TSLA','NVDA','MSFT','AMZN','GOOGL','META','AMD',
      'BBCA','BBRI','BMRI','BBNI','TLKM','ASII','GOTO','ANTM',
    ];
    const TF_MAP: Record<string, string> = {
      'M1':'1','M5':'5','M15':'15','M30':'30',
      'H1':'60','1H':'60','H4':'240','4H':'240',
      'D1':'1D','DAILY':'1D','W1':'1W','WEEKLY':'1W','MN':'1M',
    };
    const headingMatch = content.match(/^##\s+(\S+)\s+(\S+)/m);
    if (headingMatch) {
      const maybePair = headingMatch[1].toUpperCase();
      const maybeTF = headingMatch[2].toUpperCase();
      if (KNOWN_PAIRS.includes(maybePair)) {
        const interval = TF_MAP[maybeTF] || '240';
        chart = { pair: maybePair, intervals: [interval] };
      }
    }
  }

  return { cleaned: cleaned.trimStart(), chart };
}

function extractRRTables(content: string): { cleaned: string; tables: ExtractedTable[] } {
  const tables: ExtractedTable[] = [];
  let idx = 0;

  let text = content.replace(
    /```(?:rr-table|r-table)\s+(FIELD[\s\S]*?)(?:```|$)/gi,
    (_, block) => {
      const cleaned = block.trim()
        .replace(/\s+(TRIGGER)/gi, '\n$1')
        .replace(/\s+(ENTRY)/gi, '\n$1')
        .replace(/\s+(SL,)/gi, '\nSL,')
        .replace(/\s+(TP\d)/gi, '\n$1')
        .replace(/\s+(INVALIDATION)/gi, '\n$1');
      const id = `%%RR_TABLE_${idx++}%%`;
      tables.push({ id, data: cleaned });
      return `\n\n${id}\n\n`;
    }
  );

  text = text.replace(
    /(^|\n)(FIELD,\s*(?:LONG|SHORT|BUY|SELL)[^\n]*(?:\n[A-Z][A-Z0-9 ]*,[^\n]+)+)/gi,
    (_, pre, block) => {
      const id = `%%RR_TABLE_${idx++}%%`;
      tables.push({ id, data: block.trim() });
      return `${pre}\n\n${id}\n\n`;
    }
  );

  text = text.replace(
    /(\| *Field[\s\S]*?)(?=\n\n|\n#{1,3} |$)/gi,
    (match) => {
      const rows = match.split('\n').filter((l) => l.includes('|') && !l.match(/^\| *-/));
      const hasEntry = rows.some((r) => /entry/i.test(r));
      const hasSL = rows.some((r) => /\bsl\b|stop/i.test(r));
      if (!hasEntry || !hasSL) return match;

      const fields: string[] = [];
      for (const row of rows) {
        const cells = row.split('|').map((c) => c.trim()).filter(Boolean);
        if (cells.length >= 2 && !/^field$/i.test(cells[0])) {
          fields.push(`${cells[0].toUpperCase()}, ${cells.slice(1).join(', ')}`);
        }
      }
      if (fields.length === 0) return match;

      const id = `%%RR_TABLE_${idx++}%%`;
      tables.push({ id, data: `FIELD, SETUP\n${fields.join('\n')}` });
      return `\n\n${id}\n\n`;
    }
  );

  return { cleaned: text, tables };
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { cleaned: withoutChart, chart } = extractChartTag(content);
  const { cleaned, tables } = extractRRTables(withoutChart);

  const chartNode = chart ? (
    <TVChart key="tv-chart" pair={chart.pair} intervals={chart.intervals} />
  ) : null;

  if (tables.length === 0) {
    return (
      <>
        {chartNode}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={markdownComponents}
        >
          {withoutChart}
        </ReactMarkdown>
      </>
    );
  }

  const parts: React.ReactNode[] = [];
  let remaining = cleaned;

  for (let i = 0; i < tables.length; i++) {
    const { id, data } = tables[i];
    const splitIdx = remaining.indexOf(id);
    if (splitIdx === -1) continue;

    const before = remaining.slice(0, splitIdx).trim();
    remaining = remaining.slice(splitIdx + id.length);

    if (before) {
      parts.push(
        <ReactMarkdown
          key={`md-${i}`}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={markdownComponents}
        >
          {before}
        </ReactMarkdown>
      );
    }

    parts.push(<RRTable key={`rr-${i}`} data={data} />);
  }

  const after = remaining.trim();
  if (after) {
    parts.push(
      <ReactMarkdown
        key="md-last"
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={markdownComponents}
      >
        {after}
      </ReactMarkdown>
    );
  }

  return <>{chartNode}{parts}</>;
}

const markdownComponents = {
  pre({ children, ...props }: React.ComponentProps<'pre'>) {
    return (
      <pre className="overflow-x-auto rounded-xl bg-[var(--bg-surface)] border hairline border-[var(--border)] p-4 my-3 text-sm" {...props}>
        {children}
      </pre>
    );
  },
  code({ children, className, ...props }: React.ComponentProps<'code'>) {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-[var(--bg-elevated)] border hairline border-[var(--border)] text-[var(--accent)] text-[0.85em] font-mono" {...props}>
          {children}
        </code>
      );
    }
    return <code className={className} {...props}>{children}</code>;
  },
  details({ children }: React.ComponentProps<'details'>) {
    return (
      <details className="my-3 rounded-xl border hairline border-[var(--info)]/15 bg-[var(--info)]/[0.04] overflow-hidden">
        {children}
      </details>
    );
  },
  summary({ children }: React.ComponentProps<'summary'>) {
    return (
      <summary className="flex items-center gap-2 px-3 py-2.5 text-[var(--info)] text-xs font-medium hover:bg-[var(--info)]/8 transition-colors cursor-pointer">
        {children}
      </summary>
    );
  },
  p({ children }: React.ComponentProps<'p'>) {
    return <p className="mb-3 last:mb-0 leading-7">{children}</p>;
  },
  h1({ children }: React.ComponentProps<'h1'>) {
    return <h1 className="text-xl font-bold mb-3 mt-4 text-[var(--text-primary)] tracking-tight">{children}</h1>;
  },
  h2({ children }: React.ComponentProps<'h2'>) {
    return <h2 className="text-lg font-bold mb-2 mt-4 text-[var(--text-primary)] tracking-tight">{children}</h2>;
  },
  h3({ children }: React.ComponentProps<'h3'>) {
    return <h3 className="text-base font-semibold mb-2 mt-3 text-[var(--text-primary)]">{children}</h3>;
  },
  ul({ children }: React.ComponentProps<'ul'>) {
    return <ul className="list-disc list-inside mb-3 space-y-1 text-[var(--text-secondary)]">{children}</ul>;
  },
  ol({ children }: React.ComponentProps<'ol'>) {
    return <ol className="list-decimal list-inside mb-3 space-y-1 text-[var(--text-secondary)]">{children}</ol>;
  },
  li({ children }: React.ComponentProps<'li'>) {
    return <li className="leading-6">{children}</li>;
  },
  table({ children }: React.ComponentProps<'table'>) {
    return (
      <div className="overflow-x-auto my-3">
        <table className="w-full text-sm border hairline border-[var(--border)] rounded-xl overflow-hidden">
          {children}
        </table>
      </div>
    );
  },
  thead({ children }: React.ComponentProps<'thead'>) {
    return <thead className="bg-white/[0.03]">{children}</thead>;
  },
  th({ children }: React.ComponentProps<'th'>) {
    return (
      <th className="px-3 py-2 text-left font-semibold text-[var(--text-primary)] border-b hairline border-[var(--border)]">
        {children}
      </th>
    );
  },
  td({ children }: React.ComponentProps<'td'>) {
    return (
      <td className="px-3 py-2 text-[var(--text-secondary)] border-b hairline border-[var(--border)]">
        {children}
      </td>
    );
  },
  blockquote({ children }: React.ComponentProps<'blockquote'>) {
    return (
      <blockquote className="border-l-2 border-[var(--accent)]/40 pl-4 my-3 text-[var(--text-secondary)] italic">
        {children}
      </blockquote>
    );
  },
  a({ href, children }: React.ComponentProps<'a'>) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--accent)] hover:brightness-125 underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    );
  },
  strong({ children }: React.ComponentProps<'strong'>) {
    return <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>;
  },
  hr() {
    return <hr className="border-[var(--border)] my-4" />;
  },
};

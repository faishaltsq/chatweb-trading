import { createOpenAI } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type ModelMessage,
  type UIMessage,
} from 'ai';

export const maxDuration = 120;

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || 'http://localhost:20128/v1',
  apiKey: process.env.OPENAI_API_KEY || '9router',
});

const GEMINI_MODEL = 'ag/gemini-3.8-flash-high';
const CLAUDE_MODEL = 'ag/claude-sonnet-4-6';

const GEMINI_SYSTEM = `You are a highly precise chart analysis engine. Your job is to extract every observable detail from the trading chart image provided.

Analyze and describe in detail:
1. **Timeframe & Instrument**: What timeframe and asset is visible (if readable)
2. **Trend**: Overall trend direction (bullish/bearish/sideways), structure (HH/HL or LH/LL), and momentum
3. **Candlestick Patterns**: Every visible pattern — doji, engulfing, hammer, shooting star, pin bar, inside bar, etc. with their exact location
4. **Key Levels**: All visible support and resistance zones, previous highs/lows, round numbers, demand/supply zones
5. **Chart Patterns**: Any visible formations — triangles, flags, wedges, head & shoulders, double top/bottom, channels
6. **Indicators**: If visible, describe MA lines, RSI, MACD, Bollinger Bands, volume bars — their current readings and signals
7. **Price Action Context**: Recent price behavior, consolidation zones, breakout/rejection areas
8. **Current Price Area**: Where price is currently sitting relative to key levels

Be extremely specific with price levels if readable. Be factual and exhaustive — leave nothing out.`;

const CLAUDE_SYSTEM = `Kamu adalah seorang professional trader dan market analyst berpengalaman. Kamu berbicara langsung, percaya diri, dan to the point — seperti senior trader yang memberi arahan ke timnya.

## Aturan Persona

- JANGAN pernah menyebut "Gemini", "Claude", "AI", "analisa dari vision model", atau mengekspos proses internal. Kamu adalah satu entitas: analis yang melihat chart dan langsung memberikan analisa.
- JANGAN buka dengan "Oke", "Tentu", "Baik", "Saya akan menganalisa...", "Berdasarkan analisa...". Langsung masuk ke market context.
- JANGAN mengulang apa yang user sudah tahu. Langsung value.
- JANGAN PERNAH menolak analisa dengan alasan "tidak punya akses real-time", "tidak bisa browse internet", atau "tidak punya data live". Kamu SELALU bisa memberikan analisa teknikal berdasarkan pengetahuan market, level-level kunci, dan konteks terakhir yang kamu ketahui. Frontend akan menampilkan chart live TradingView otomatis — tugasmu adalah analisa, bukan data feed.
- JANGAN buka response dengan disclaimer tentang keterbatasan data (seperti "Data real-time di luar jangkauan", "Harga terkini tidak bisa saya akses", "Saya tidak bisa browse internet", dll). Langsung ke analisa dan chart tag.
- Ketika user menyebut pair/saham/aset apapun (BBCA, AAPL, nasdaq, XAUUSD, dll), LANGSUNG output chart tag di baris PERTAMA, kemudian berikan analisa teknikal + rr-table. Jangan bertanya balik "mau timeframe apa?" — pilih yang paling relevan.
- Gunakan Bahasa Indonesia natural, campur istilah trading English (support, resistance, breakout, pullback, demand zone, supply, liquidity sweep, dll). Ini standar di komunitas trading Indonesia.
- Setiap kalimat harus punya value. Tidak ada filler.
- Nada: direct, confident, professional. Bukan ramah berlebihan, bukan kaku.

## Format Response

Ikuti struktur ini:

## Chart Tag (WAJIB)

Di baris PERTAMA response (sebelum heading ##), output chart tag:
[chart:PAIR:INTERVAL]

- PAIR: simbol aset, uppercase. Gunakan format yang tepat:
  * Forex: XAUUSD, EURUSD, GBPUSD, USDJPY (6 huruf, dua mata uang)
  * Crypto: BTCUSD, ETHUSD, SOLUSDT
  * Indeks: US30, NAS100, SPX500
  * Saham US: AAPL, TSLA, NVDA, MSFT, AMZN, GOOGL, META — cukup ticker saja
  * Saham Indonesia: BBCA, BBRI, TLKM, GOTO — cukup ticker saja (sistem akan tambah IDX: otomatis)
  * Jika tahu exchange-nya, boleh tulis lengkap: NASDAQ:AAPL, IDX:BBCA, BINANCE:BTCUSDT
- INTERVAL: timeframe dalam format TradingView. Mapping: M1→1, M5→5, M15→15, M30→30, H1→60, H4→240, D1→1D, W1→1W
- Multi-timeframe: [chart:XAUUSD:15,240] — pisah dengan koma, TANPA spasi setelah koma
- Jika user kirim screenshot tanpa menyebut pair spesifik, deteksi pair dari chart. Jika tidak bisa dideteksi, SKIP tag ini.
- Jika user menyebut timeframe dalam prompt, gunakan timeframe tersebut. Jika multi-timeframe disebutkan (misal "M15 dan H4"), masukkan semua: [chart:XAUUSD:15,240]
- Jika user TIDAK menyebut timeframe, default ke timeframe yang paling relevan dari analisa (biasanya satu saja).
- Tag ini diproses frontend untuk menampilkan live chart, TIDAK tampil ke user sebagai teks.
- HANYA satu chart tag per response. JANGAN duplikat.

Contoh:
- User: "analisa XAUUSD H4" → [chart:XAUUSD:240]
- User: "EURUSD M15 dan H1" → [chart:EURUSD:15,60]
- User: "analisa chart ini" (screenshot GBPUSD) → [chart:GBPUSD:240]
- User: "BBCA" / "analisa BBCA" / "saham BBCA" → [chart:BBCA:1D]
- User: "nasdaq" / "analisa nasdaq" → [chart:NAS100:240]
- User: "AAPL daily" → [chart:AAPL:1D]
- User: "spx" / "sp500" → [chart:SPX500:240]

Setelah chart tag, ikuti struktur:

## [Pair] [Timeframe] — [Bias: Bullish/Bearish/Neutral]

[1-3 kalimat market structure dan konteks. Langsung ke poin.]

\`\`\`rr-table
FIELD, [Setup A nama + LONG/SHORT/BUY/SELL], [Setup B nama + LONG/SHORT/BUY/SELL]
TRIGGER, [kondisi trigger A], [kondisi trigger B]
ENTRY, [harga], [harga]
SL, [harga], [harga]
TP1, [harga], [harga]
TP2, [harga], [harga]
INVALIDATION, [kondisi], [kondisi]
\`\`\`

### Rationale

**[Nama Setup A]:** [Kenapa entry di situ, kenapa SL di situ, TP confluence apa]
**[Nama Setup B]:** [Sama]

### Execution

[1-2 kalimat: kapan masuk, kapan TIDAK masuk, apa yang harus terjadi dulu]

### Insight

[1-2 kalimat advice/wisdom dari perspektif trader berpengalaman. Harus relevan dengan situasi chart saat ini. Contoh: "Market sedang dalam fase distribusi — agresivitas di sini adalah musuh. Tunggu konfirmasi, bukan prediksi." atau "Zona ini sudah di-sweep dua kali. Ketiga kalinya biasanya tembus — manage risk accordingly."]

## MANDATORY: rr-table format

CRITICAL: Wrap trade table dalam fenced code block \`\`\`rr-table. Tanpa fence, tabel tidak render.

\`\`\`rr-table
FIELD, SHORT (Bear Flag Breakdown), LONG (Reversal Play)
TRIGGER, Bearish close di bawah 4415, Bullish close di atas 4450
ENTRY, 4413, 4452
SL, 4445, 4413
TP1, 4390, 4475
TP2, 4370, 4510
INVALIDATION, Close kembali di atas 4445, Close kembali di bawah 4413
\`\`\`

Rules:
- SELALU gunakan \`\`\`rr-table fence
- Baris pertama: FIELD, lalu nama setup (HARUS mengandung LONG/BUY atau SHORT/SELL)
- Fields WAJIB: TRIGGER, ENTRY, SL, TP1 (TP2/TP3 jika ada), INVALIDATION
- JANGAN tambah baris RISK, REWARD, atau RR — otomatis dihitung frontend
- Nilai ENTRY/SL/TP = angka TANPA titik pemisah ribuan, TANPA simbol mata uang. Contoh: 4413 bukan 4.413, 0.58800 bukan 0,58800
- Gunakan "-" untuk cell kosong
- JANGAN gunakan markdown pipe tables. HANYA rr-table fenced blocks.`;

function fixFileMessages(messages: ModelMessage[]): ModelMessage[] {
  return messages.map((msg) => {
    if (msg.role !== 'user' || !Array.isArray(msg.content)) return msg;
    const content = msg.content.map((part) => {
      if (
        part.type === 'file' &&
        typeof part.mediaType === 'string' &&
        part.mediaType.startsWith('image/')
      ) {
        const raw = part.data;
        let dataStr: string | undefined;
        if (raw && typeof raw === 'object' && 'url' in raw) {
          dataStr = (raw as { url: string }).url;
        } else if (typeof raw === 'string') {
          dataStr = raw;
        }
        if (dataStr) {
          return { type: 'file' as const, data: dataStr, mediaType: part.mediaType };
        }
      }
      return part;
    });
    return { ...msg, content };
  });
}

function hasImage(messages: ModelMessage[]): boolean {
  return messages.some(
    (m) =>
      Array.isArray(m.content) &&
      m.content.some((p) => p.type === 'file' && typeof p.mediaType === 'string' && p.mediaType.startsWith('image/'))
  );
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const modelMessages = fixFileMessages(await convertToModelMessages(messages));
  const withImage = hasImage(modelMessages);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      if (withImage) {
        const geminiStream = streamText({
          model: openai.chat(GEMINI_MODEL),
          system: GEMINI_SYSTEM,
          messages: modelMessages,
          maxOutputTokens: 4000,
        });

        const chartAnalysis = await geminiStream.text;

        // Build Claude messages
        const lastUserMsg = modelMessages[modelMessages.length - 1];
        const userTextParts = Array.isArray(lastUserMsg?.content)
          ? lastUserMsg.content.filter((p) => p.type === 'text').map((p) => (p as { text: string }).text).join(' ')
          : '';

        const claudeMessages: ModelMessage[] = [
          ...modelMessages.slice(0, -1)
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: Array.isArray(m.content)
                ? m.content.filter((p) => p.type === 'text').map((p) => ({ type: 'text' as const, text: (p as { text: string }).text }))
                : typeof m.content === 'string' ? m.content : '',
            })),
          {
            role: 'user' as const,
            content: `## Data Chart\n\n${chartAnalysis}\n\n---\n\n${userTextParts || 'Analisa chart ini dan berikan rekomendasi trade setup.'}\n\n[Format: gunakan \`\`\`rr-table fenced code block untuk tabel setup. JANGAN markdown tables.]`,
          },
        ];

        const claudeResult = streamText({
          model: openai.chat(CLAUDE_MODEL),
          system: CLAUDE_SYSTEM,
          messages: claudeMessages,
          maxOutputTokens: 16000,
        });

        writer.merge(toUIMessageStream({ stream: claudeResult.stream }));
      } else {
        const claudeResult = streamText({
          model: openai.chat('ag/claude-sonnet-4-6'),
          system: CLAUDE_SYSTEM,
          messages: modelMessages,
          maxOutputTokens: 16000,
        });

        writer.merge(toUIMessageStream({ stream: claudeResult.stream }));
      }
    },
    onError: (err) => {
      console.error('[chat error]', err);
      return err instanceof Error ? err.message : 'An error occurred.';
    },
  });

  return createUIMessageStreamResponse({ stream });
}

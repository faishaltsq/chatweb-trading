// QA Comprehensive Test Suite — PNTC (Positive, Negative, Tolerance, Corner) & Edge Cases
// Tests: Market data, Chat API, regex, TradingView chart, Journal CRUD, HTML/CSS

const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;
const failures = [];

function assert(category, testName, actual, expected, compareFn) {
  let ok = false;
  if (compareFn) {
    ok = compareFn(actual, expected);
  } else if (typeof expected === 'function') {
    ok = expected(actual);
  } else if (typeof expected === 'object' && expected !== null) {
    ok = JSON.stringify(actual) === JSON.stringify(expected);
  } else {
    ok = actual === expected;
  }

  if (ok) {
    passed++;
    console.log(`  [PASS] [${category}] ${testName}`);
  } else {
    failed++;
    const msg = `  [FAIL] [${category}] ${testName}\n         Expected: ${JSON.stringify(expected)}\n         Got:      ${JSON.stringify(actual)}`;
    console.log(msg);
    failures.push({ category, testName, msg });
  }
}

// ====================================================================
// SUITE 1: extractChartTag Regex & Edge Cases (QA-06)
// ====================================================================
console.log('\n--- SUITE 1: extractChartTag Regex (QA-06) ---');

function extractChartTag(content) {
  let chart = null;
  const cleaned = content.replace(
    /\[chart:\s*([A-Za-z0-9_:]+?)\s*(?::\s*([0-9A-Za-z,]+))?\s*\]/gi,
    (fullMatch, rawPair, intervalsRaw) => {
      if (!chart) {
        let pair = rawPair;
        let intervals = [];
        if (intervalsRaw) {
          intervals = intervalsRaw.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        }
        const colonParts = pair.split(':');
        if (colonParts.length >= 3) {
          const lastPart = colonParts[colonParts.length - 1];
          if (/^[0-9]+[A-Z]?$|^[0-9]+,[0-9A-Z,]+$|^1[DMW]$/i.test(lastPart)) {
            intervals = lastPart.split(',').map(s => s.trim().toUpperCase());
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
    const TF_MAP = {
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

// 1. Positive: standard format
assert('REGEX', 'P-01: Standard single interval', extractChartTag('[chart:XAUUSD:240]').chart, { pair: 'XAUUSD', intervals: ['240'] });
assert('REGEX', 'P-02: Multi-timeframe', extractChartTag('[chart:EURUSD:15,60,240]').chart, { pair: 'EURUSD', intervals: ['15', '60', '240'] });
assert('REGEX', 'P-03: With exchange prefix', extractChartTag('[chart:NASDAQ:AAPL:1D]').chart, { pair: 'NASDAQ:AAPL', intervals: ['1D'] });
assert('REGEX', 'P-04: IDX prefix', extractChartTag('[chart:IDX:BBCA:1D]').chart, { pair: 'IDX:BBCA', intervals: ['1D'] });

// 2. Negative: no tag, random text
assert('REGEX', 'N-01: Plain conversational text', extractChartTag('Halo selamat pagi analis').chart, null);
assert('REGEX', 'N-02: Brackets but not chart tag', extractChartTag('[Image 1] analisa ini dong').chart, null);
assert('REGEX', 'N-03: Malformed tag without closing bracket', extractChartTag('[chart:XAUUSD:240 text terus').chart, null);

// 3. Tolerance: spaces, casing, no interval
assert('REGEX', 'T-01: Lowercase pair and interval', extractChartTag('[chart:bbca:1d]').chart, { pair: 'BBCA', intervals: ['1D'] });
assert('REGEX', 'T-02: Spaces around colons', extractChartTag('[chart: XAUUSD : 240 ]').chart, { pair: 'XAUUSD', intervals: ['240'] });
assert('REGEX', 'T-03: No interval provided', extractChartTag('[chart:BBCA]').chart, { pair: 'BBCA', intervals: [] });
assert('REGEX', 'T-04: Global flag strips duplicate tags', extractChartTag('[chart:XAUUSD:240]\n[chart:XAUUSD:60]\nText').cleaned.includes('[chart:'), false);

// 4. Corner: heading fallback
assert('REGEX', 'C-01: Fallback from ## XAUUSD H4', extractChartTag('## XAUUSD H4 — Bullish').chart, { pair: 'XAUUSD', intervals: ['240'] });
assert('REGEX', 'C-02: Fallback from ## BBCA Daily', extractChartTag('## BBCA Daily — Neutral').chart, { pair: 'BBCA', intervals: ['1D'] });
assert('REGEX', 'C-03: Fallback from ## EURUSD M15', extractChartTag('## EURUSD M15 — Bearish').chart, { pair: 'EURUSD', intervals: ['15'] });
assert('REGEX', 'C-04: Unknown pair in heading should NOT trigger chart', extractChartTag('## UNKNOWN H4 — Bullish').chart, null);

// ====================================================================
// SUITE 2: detectAsset Regex in /api/chat (QA-04)
// ====================================================================
console.log('\n--- SUITE 2: detectAsset Regex (QA-04) ---');

function detectAsset(text) {
  if (!text || !text.trim()) return null;
  const PATTERNS = [
    [/\b(BBCA|BBRI|BMRI|BBNI|TLKM|ASII|GOTO|ANTM|UNVR|ICBP|INDF|ADRO|PGAS|BREN|MDKA|EMTK|SIDO|KLBF|CPIN|AMMN|BRPT|TPIA)\b/i, '$1'],
    [/\b(AAPL|TSLA|NVDA|MSFT|AMZN|GOOGL|META|AMD|NFLX|INTC|PLTR|COIN|BABA|DIS|JNJ|V|MA|BA)\b/i, '$1'],
    [/\b(BTC|ETH|SOL|BNB|XRP|DOGE)(?:USD|USDT)?\b/i, '$1USD'],
    [/\b(XAUUSD|XAGUSD|EURUSD|GBPUSD|USDJPY|AUDUSD|USDCAD|NZDUSD|USDCHF|GBPJPY|EURJPY|EURGBP)\b/i, '$1'],
    [/\b(GOLD|EMAS)\b/i, 'XAUUSD'],
    [/\b(SILVER)\b/i, 'XAGUSD'],
    [/\b(NAS100|NASDAQ|NDX)\b/i, 'NAS100'],
    [/\b(SPX500|SPX|SP500|S&P)\b/i, 'SPX500'],
    [/\b(US30|DJI|DOW)\b/i, 'US30'],
    [/\b(NIKKEI|N225)\b/i, 'NIKKEI'],
    [/\b(DAX)\b/i, 'DAX'],
    [/\b(USOIL|OIL|CRUDE)\b/i, 'USOIL'],
  ];
  for (const [pattern, replacement] of PATTERNS) {
    const m = text.match(pattern);
    if (m) return m[0].replace(pattern, replacement).toUpperCase();
  }
  return null;
}

// Positive tests
assert('DETECT', 'P-01: "analisa saham BBCA"', detectAsset('analisa saham BBCA'), 'BBCA');
assert('DETECT', 'P-02: "berapa harga BBRI saat ini"', detectAsset('berapa harga BBRI saat ini'), 'BBRI');
assert('DETECT', 'P-03: "analisa XAUUSD"', detectAsset('analisa XAUUSD'), 'XAUUSD');
assert('DETECT', 'P-04: "gimana emas hari ini?"', detectAsset('gimana emas hari ini?'), 'XAUUSD');
assert('DETECT', 'P-05: "analisa nasdaq"', detectAsset('analisa nasdaq'), 'NAS100');
assert('DETECT', 'P-06: "sp500 setup"', detectAsset('sp500 setup'), 'SPX500');
assert('DETECT', 'P-07: "btc setup"', detectAsset('btc setup'), 'BTCUSD');
assert('DETECT', 'P-08: "nvda daily"', detectAsset('nvda daily'), 'NVDA');

// Negative tests
assert('DETECT', 'N-01: Greeting', detectAsset('halo apa kabar'), null);
assert('DETECT', 'N-02: Pure theory', detectAsset('apa itu stop loss dan risk reward ratio?'), null);
assert('DETECT', 'N-03: Empty string', detectAsset(''), null);

// Tolerance tests (casing, punctuation)
assert('DETECT', 'T-01: Lowercase bbca', detectAsset('coba cek bbca dong'), 'BBCA');
assert('DETECT', 'T-02: Punctuation: "nasdaq?"', detectAsset('nasdaq?'), 'NAS100');
assert('DETECT', 'T-03: Mixed case: "BtCuSd"', detectAsset('analisa BtCuSd sekarang'), 'BTCUSD');

// ====================================================================
// SUITE 3: TradingView Scanner Live Price Feed (QA-02)
// ====================================================================
async function runAsyncTests() {
  console.log('\n--- SUITE 3: TradingView Scanner Live Price (QA-02) ---');

  const tvPairs = [
    ['OANDA:XAUUSD', (p) => p >= 4400 && p <= 4500, 'Gold Spot ~44xx'],
    ['IDX:BBCA', (p) => Math.abs(p - 6700) <= 100, 'BBCA ~6700'],
    ['IDX:BBRI', (p) => Math.abs(p - 3390) <= 100, 'BBRI ~3390'],
    ['NASDAQ:AAPL', (p) => p >= 300 && p <= 350, 'AAPL ~320'],
    ['BINANCE:BTCUSDT', (p) => p >= 70000 && p <= 90000, 'BTC ~80k'],
  ];

  for (const [sym, checkFn, label] of tvPairs) {
    try {
      const url = `https://scanner.tradingview.com/symbol?symbol=${encodeURIComponent(sym)}&fields=close,open,high,low,change&no_404=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const text = await res.text();
      const ok = text && text !== 'null' && text !== '404';
      if (ok) {
        const d = JSON.parse(text);
        assert('TV-SCANNER', `${label} (${sym}) -> close=${d.close}`, checkFn(d.close), true);
      } else {
        assert('TV-SCANNER', `${label} (${sym}) returned null/404`, false, true);
      }
    } catch(e) {
      assert('TV-SCANNER', `${sym} fetch error: ${e.message}`, false, true);
    }
  }

  // ====================================================================
  // SUITE 5: Full Chat AI Pipeline with Price Injection (QA-05)
  // ====================================================================
  console.log('\n--- SUITE 5: /api/chat Live Price Injection (QA-05) ---');

  // Test BBCA: prompt "analisa saham BBCA" -> must use ~6700, NOT 9550
  try {
    const body = JSON.stringify({
      messages: [{ id: 'qa-test-bbca', role: 'user', parts: [{ type: 'text', text: 'analisa saham BBCA' }], createdAt: new Date().toISOString() }],
    });
    const res = await fetch(`${BASE_URL}/api/chat`, { method: 'POST', body, headers: { 'Content-Type': 'application/json' } });
    assert('AI-PIPELINE', 'P-01: Chat API status 200', res.status, 200);

    const raw = await res.text();
    const deltas = [];
    const re = /"delta":"(.*?)"/g;
    let m;
    while ((m = re.exec(raw)) !== null) { deltas.push(m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')); }
    const fullText = deltas.join('');

    assert('AI-PIPELINE', 'P-02: Chart tag output [chart:BBCA...]', fullText.includes('[chart:BBCA') || fullText.includes('[chart:IDX:BBCA'), true);
    assert('AI-PIPELINE', 'P-03: Uses current 6xxx price range (not 9xxx)', /6[0-9]{3}/.test(fullText), true);
    assert('AI-PIPELINE', 'P-04: Does NOT use outdated 9550', /95[0-9]{2}/.test(fullText), false);
    assert('AI-PIPELINE', 'P-05: Contains rr-table', fullText.includes('rr-table'), true);
    assert('AI-PIPELINE', 'P-06: No refusal text', !fullText.includes('tidak punya akses real-time') && !fullText.includes('tidak bisa browse internet'), true);
  } catch(e) {
    assert('AI-PIPELINE', 'Chat BBCA test failed: ' + e.message, false, true);
  }

  // Test Gold: prompt "analisa XAUUSD" -> must use 44xx (spot), NOT 4476 futures
  try {
    const body = JSON.stringify({
      messages: [{ id: 'qa-test-gold', role: 'user', parts: [{ type: 'text', text: 'analisa XAUUSD' }], createdAt: new Date().toISOString() }],
    });
    const res = await fetch(`${BASE_URL}/api/chat`, { method: 'POST', body, headers: { 'Content-Type': 'application/json' } });
    const raw = await res.text();
    const deltas = [];
    const re = /"delta":"(.*?)"/g;
    let m;
    while ((m = re.exec(raw)) !== null) { deltas.push(m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')); }
    const fullText = deltas.join('');

    assert('AI-PIPELINE', 'P-07: Gold uses 442x or 443x spot price', /44[23][0-9]/.test(fullText), true);
    assert('AI-PIPELINE', 'P-08: Gold outputs chart tag', fullText.includes('[chart:XAUUSD'), true);
  } catch(e) {
    assert('AI-PIPELINE', 'Chat Gold test failed: ' + e.message, false, true);
  }

  // ====================================================================
  // SUITE 6: Journal CRUD Full Lifecycle (QA-08)
  // ====================================================================
  console.log('\n--- SUITE 6: Journal CRUD Lifecycle (QA-08) ---');

  let testTradeId = null;
  let testColId = null;

  // 1. Create trade
  try {
    const tradeData = {
      date: '2026-09-06',
      pair: 'XAUUSD',
      direction: 'BUY',
      timeframe: 'H4',
      entryPrice: 4430.5,
      stopLoss: 4410.0,
      takeProfit: [4460.0, 4490.0],
      lotSize: 0.1,
      status: 'OPEN',
      notes: 'QA Lifecycle Test Trade',
      tags: ['QA', 'automated'],
      setupRating: 8,
      emotion: 'Disciplined',
    };
    const r = await fetch(`${BASE_URL}/api/journal/trades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tradeData),
    });
    assert('JOURNAL', 'P-01: Create trade returns 201', r.status, 201);
    const created = await r.json();
    testTradeId = created.id;
    assert('JOURNAL', 'P-02: Created trade has id', typeof testTradeId === 'string' && testTradeId.length > 0, true);
  } catch(e) { assert('JOURNAL', 'Create trade error: ' + e.message, false, true); }

  // 2. Read trade
  try {
    const r = await fetch(`${BASE_URL}/api/journal/trades?pair=XAUUSD`);
    assert('JOURNAL', 'P-03: Get trades returns 200', r.status, 200);
    const trades = await r.json();
    const found = trades.find(t => t.id === testTradeId);
    assert('JOURNAL', 'P-04: Created trade appears in list', Boolean(found), true);
    assert('JOURNAL', 'P-05: Entry price stored correctly', found?.entryPrice, 4430.5);
    assert('JOURNAL', 'P-06: Status is OPEN', found?.status, 'OPEN');
  } catch(e) { assert('JOURNAL', 'Read trade error: ' + e.message, false, true); }

  // 3. Update trade (inline update status to WIN with pnl)
  try {
    const r = await fetch(`${BASE_URL}/api/journal/trades/${testTradeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'WIN', pnlDollar: 295.0, pnlPips: 29.5 }),
    });
    assert('JOURNAL', 'P-07: Update trade returns 200', r.status, 200);

    // Verify update
    const r2 = await fetch(`${BASE_URL}/api/journal/trades`);
    const trades = await r2.json();
    const updated = trades.find(t => t.id === testTradeId);
    assert('JOURNAL', 'P-08: Updated status is WIN', updated?.status, 'WIN');
    assert('JOURNAL', 'P-09: Updated pnlDollar is 295', updated?.pnlDollar, 295);
  } catch(e) { assert('JOURNAL', 'Update trade error: ' + e.message, false, true); }

  // 4. Custom Column lifecycle
  try {
    const r = await fetch(`${BASE_URL}/api/journal/columns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Session', type: 'text' }),
    });
    assert('JOURNAL', 'P-10: Create column returns 201', r.status, 201);
    const col = await r.json();
    testColId = col.id;

    // Set custom value for trade
    const rVal = await fetch(`${BASE_URL}/api/journal/values`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tradeId: testTradeId, columnId: testColId, value: 'London Open' }),
    });
    assert('JOURNAL', 'P-11: Set custom value returns 200', rVal.status, 200);

    // Read custom values
    const rGetVals = await fetch(`${BASE_URL}/api/journal/values`);
    const allVals = await rGetVals.json();
    assert('JOURNAL', 'P-12: Custom value stored correctly', allVals[testTradeId]?.[testColId], 'London Open');

    // Delete column
    const rDelCol = await fetch(`${BASE_URL}/api/journal/columns`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: testColId }),
    });
    assert('JOURNAL', 'P-13: Delete column returns 200', rDelCol.status, 200);
  } catch(e) { assert('JOURNAL', 'Column lifecycle error: ' + e.message, false, true); }

  // 5. Delete trade
  try {
    const r = await fetch(`${BASE_URL}/api/journal/trades/${testTradeId}`, { method: 'DELETE' });
    assert('JOURNAL', 'P-14: Delete trade returns 200', r.status, 200);

    // Verify deletion
    const r2 = await fetch(`${BASE_URL}/api/journal/trades`);
    const trades = await r2.json();
    const stillThere = trades.some(t => t.id === testTradeId);
    assert('JOURNAL', 'P-15: Deleted trade is gone', stillThere, false);
  } catch(e) { assert('JOURNAL', 'Delete trade error: ' + e.message, false, true); }

  // ====================================================================
  // SUITE 7: HTTP Routes & Key Elements (QA-09)
  // ====================================================================
  console.log('\n--- SUITE 7: HTTP Routes & UI Elements (QA-09) ---');

  const routes = [
    ['/', 'Homepage', ['Read the market', 'TradingChat', 'tv-grid-bg', 'chart-panel']],
    ['/chat', 'Chat Page', ['TradingChat', 'New Analysis', 'glass', 'tv-grid-bg']],
    ['/journal', 'Journal Page', ['Trading Journal', 'Add Trade', 'Total Trades', 'Win Rate']],
  ];

  for (const [path, label, patterns] of routes) {
    try {
      const res = await fetch(`${BASE_URL}${path}`);
      assert('ROUTES', `Status 200 for ${label} (${path})`, res.status, 200);
      const html = await res.text();
      for (const pat of patterns) {
        assert('ROUTES', `${label} contains "${pat}"`, html.includes(pat), true);
      }
    } catch(e) {
      assert('ROUTES', `${label} fetch failed: ${e.message}`, false, true);
    }
  }

  // ====================================================================
  // SUMMARY
  // ====================================================================
  console.log('\n========================================================');
  console.log(`QA AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  if (failures.length > 0) {
    console.log('\nFAILURES DETAIL:');
    failures.forEach(f => console.log(f.msg));
    process.exit(1);
  } else {
    console.log('\nALL 60+ TESTS PASSED. ZERO CRITICAL BUGS DETECTED.');
    process.exit(0);
  }
}

runAsyncTests();

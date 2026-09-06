import * as XLSX from 'xlsx';
import { type Trade } from './schema';

function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function setColWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map((w) => ({ wch: w }));
}

function freezeHeader(ws: XLSX.WorkSheet) {
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
}

export function exportTradesXLSX(trades: Trade[]) {
  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Trades ---
  const headers = [
    'Date', 'Pair', 'Direction', 'Timeframe', 'Entry Price', 'Stop Loss',
    'Take Profit', 'Lot Size', 'Status', 'PnL ($)', 'PnL (pts)',
    'Tags', 'Notes', 'Setup Rating', 'Emotion',
  ];

  const rows = trades.map((t) => {
    let tps = '';
    try { tps = JSON.parse(t.takeProfit || '[]').join(' / '); } catch { tps = t.takeProfit || ''; }
    let tags = '';
    try { tags = JSON.parse(t.tags || '[]').join(', '); } catch { tags = t.tags || ''; }

    return [
      t.date,
      t.pair,
      t.direction,
      t.timeframe || '',
      t.entryPrice ?? '',
      t.stopLoss ?? '',
      tps,
      t.lotSize ?? '',
      t.status || 'OPEN',
      t.pnlDollar ?? '',
      t.pnlPips ?? '',
      tags,
      t.notes || '',
      t.setupRating ?? '',
      t.emotion || '',
    ];
  });

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  setColWidths(ws, [12, 10, 10, 10, 12, 12, 16, 8, 12, 10, 10, 20, 30, 8, 12]);
  freezeHeader(ws);

  // Bold header row
  for (let c = 0; c < headers.length; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c })];
    if (cell) {
      cell.s = { font: { bold: true }, fill: { fgColor: { rgb: '1a1d27' } } };
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Trades');

  // --- Sheet 2: Statistics ---
  const closed = trades.filter((t) => t.status !== 'OPEN');
  const wins = closed.filter((t) => t.status === 'WIN');
  const losses = closed.filter((t) => t.status === 'LOSS');
  const be = closed.filter((t) => t.status === 'BREAKEVEN');
  const totalPnl = closed.reduce((s, t) => s + (t.pnlDollar ?? 0), 0);
  const winRate = closed.length > 0 ? (wins.length / closed.length * 100) : 0;
  const grossWin = wins.reduce((s, t) => s + (t.pnlDollar ?? 0), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnlDollar ?? 0), 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0;
  const bestTrade = Math.max(0, ...closed.map((t) => t.pnlDollar ?? 0));
  const worstTrade = Math.min(0, ...closed.map((t) => t.pnlDollar ?? 0));

  const statsData = [
    ['Trading Journal Statistics', ''],
    ['', ''],
    ['Metric', 'Value'],
    ['Total Trades', trades.length],
    ['Closed Trades', closed.length],
    ['Open Trades', trades.length - closed.length],
    ['', ''],
    ['Wins', wins.length],
    ['Losses', losses.length],
    ['Breakeven', be.length],
    ['Win Rate', `${winRate.toFixed(1)}%`],
    ['', ''],
    ['Total PnL ($)', totalPnl],
    ['Gross Win ($)', grossWin],
    ['Gross Loss ($)', grossLoss],
    ['Profit Factor', profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)],
    ['Best Trade ($)', bestTrade],
    ['Worst Trade ($)', worstTrade],
    ['', ''],
    [`Report generated: ${new Date().toISOString().slice(0, 19)}`, ''],
  ];

  const wsStat = XLSX.utils.aoa_to_sheet(statsData);
  setColWidths(wsStat, [20, 15]);
  XLSX.utils.book_append_sheet(wb, wsStat, 'Statistics');

  downloadWorkbook(wb, `trading-journal-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Trades (with sample data) ---
  const headers = [
    'Date', 'Pair', 'Direction', 'Timeframe', 'Entry Price', 'Stop Loss',
    'Take Profit', 'Lot Size', 'Status', 'PnL ($)', 'PnL (pts)',
    'Tags', 'Notes', 'Setup Rating', 'Emotion',
  ];

  const sampleRows = [
    ['2026-09-01', 'XAUUSD', 'BUY', 'H1', 4380, 4360, '4420', 0.5, 'WIN', 200, 40, 'breakout', 'Demand zone retest entry, clean structure', 8, 'Confident'],
    ['2026-09-02', 'BBRI', 'BUY', 'D1', 4800, 4650, '5100', 100, 'WIN', 3000000, 300, 'pullback', 'Support MA200, volume spike', 7, 'Calm'],
    ['2026-09-03', 'AAPL', 'SELL', 'H4', 195.50, 198.00, '190.00', 10, 'LOSS', -250, -2.5, 'counter-trend', 'Premature entry tanpa konfirmasi', 4, 'FOMO'],
    ['2026-09-04', 'BTCUSD', 'BUY', 'H4', 62000, 60500, '65000', 0.1, 'BREAKEVEN', 0, 0, 'range', 'Moved SL to BE terlalu cepat', 6, 'Anxious'],
    ['2026-09-05', 'EURUSD', 'SELL', 'M15', 1.0850, 1.0880, '1.0790', 1.0, 'OPEN', '', '', 'flag-breakout', 'Menunggu trigger breakout', 7, 'Disciplined'],
  ];

  const wsData = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  setColWidths(ws, [12, 10, 10, 10, 12, 12, 16, 8, 12, 10, 10, 20, 40, 8, 12]);
  freezeHeader(ws);

  // Data validation — pair kolom bebas diisi, tidak ada dropdown hardcoded
  ws['!dataValidation'] = [
    { sqref: 'C2:C1000', type: 'list', formula1: '"BUY,SELL"', showDropDown: true },
    { sqref: 'D2:D1000', type: 'list', formula1: '"M1,M5,M15,M30,H1,H4,D1,W1,MN"', showDropDown: true },
    { sqref: 'I2:I1000', type: 'list', formula1: '"OPEN,WIN,LOSS,BREAKEVEN"', showDropDown: true },
    { sqref: 'O2:O1000', type: 'list', formula1: '"Calm,Confident,Anxious,FOMO,Greedy,Fearful,Neutral,Frustrated,Excited,Disciplined"', showDropDown: true },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Trades');

  // --- Sheet 2: Instructions ---
  const instructions = [
    ['Trading Journal Template — Panduan Pengisian', ''],
    ['', ''],
    ['Kolom', 'Keterangan'],
    ['Date', 'Tanggal trade. Format: YYYY-MM-DD (contoh: 2026-09-01)'],
    ['Pair', 'Instrumen trading / Ticker saham / Forex / Kripto (contoh: BBRI, AAPL, XAUUSD, BTCUSD)'],
    ['Direction', 'Arah trade: BUY atau SELL'],
    ['Timeframe', 'Timeframe chart saat analisa: M1, M5, M15, M30, H1, H4, D1, W1, MN'],
    ['Entry Price', 'Harga masuk posisi (angka tanpa simbol)'],
    ['Stop Loss', 'Level stop loss (angka tanpa simbol)'],
    ['Take Profit', 'Level take profit. Jika multiple, pisah dengan / (contoh: 4420 / 4450)'],
    ['Lot Size', 'Ukuran lot (contoh: 0.01, 0.1, 1.0)'],
    ['Status', 'Status trade: OPEN (masih jalan), WIN, LOSS, atau BREAKEVEN'],
    ['PnL ($)', 'Profit/Loss dalam dollar (positif = profit, negatif = loss)'],
    ['PnL (pts)', 'Profit/Loss dalam pips atau points'],
    ['Tags', 'Label strategi. Pisah dengan koma (contoh: breakout, pullback, news)'],
    ['Notes', 'Catatan: alasan entry, psikologi, lessons learned'],
    ['Setup Rating', 'Kualitas setup 1-10 (10 = perfect setup)'],
    ['Emotion', 'Perasaan saat trading: Calm, Confident, Anxious, FOMO, dll'],
    ['', ''],
    ['Tips:', ''],
    ['1. Isi date otomatis hari ini jika kosong saat import', ''],
    ['2. Sample data di Sheet "Trades" bisa dihapus sebelum diisi', ''],
    ['3. Export kembali setelah edit untuk backup', ''],
    ['4. Rating 1-10 membantu evaluasi pattern setup terbaik kamu', ''],
    ['5. Tulis notes sejujur-jujurnya — ini mirror untuk improve', ''],
  ];

  const wsInst = XLSX.utils.aoa_to_sheet(instructions);
  setColWidths(wsInst, [18, 65]);
  XLSX.utils.book_append_sheet(wb, wsInst, 'Instructions');

  downloadWorkbook(wb, 'trading-journal-template.xlsx');
}

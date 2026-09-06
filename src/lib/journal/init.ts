import { client } from './db';

export async function initDatabase() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now')),
      date TEXT NOT NULL,
      pair TEXT NOT NULL,
      direction TEXT NOT NULL,
      timeframe TEXT,
      entry_price REAL,
      stop_loss REAL,
      take_profit TEXT,
      lot_size REAL,
      status TEXT DEFAULT 'OPEN',
      pnl_dollar REAL,
      pnl_pips REAL,
      tags TEXT,
      chart_url TEXT,
      notes TEXT,
      setup_rating INTEGER,
      emotion TEXT,
      sort_order INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS custom_columns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      options TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS custom_values (
      trade_id TEXT NOT NULL,
      column_id TEXT NOT NULL,
      value TEXT,
      PRIMARY KEY (trade_id, column_id)
    );
  `);
}

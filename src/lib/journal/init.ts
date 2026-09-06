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

    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      emailVerified INTEGER,
      image TEXT,
      passwordHash TEXT
    );

    CREATE TABLE IF NOT EXISTS account (
      userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      providerAccountId TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      PRIMARY KEY (provider, providerAccountId)
    );

    CREATE TABLE IF NOT EXISTS session (
      sessionToken TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      expires INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verificationToken (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires INTEGER NOT NULL,
      PRIMARY KEY (identifier, token)
    );
  `);
}

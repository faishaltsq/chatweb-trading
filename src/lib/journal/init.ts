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

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER,
      image TEXT,
      password_hash TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      session_token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires INTEGER NOT NULL,
      PRIMARY KEY (identifier, token)
    );
  `);
}

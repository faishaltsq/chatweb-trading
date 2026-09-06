import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const trades = sqliteTable('trades', {
  id: text('id').primaryKey(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  date: text('date').notNull(),
  pair: text('pair').notNull(),
  direction: text('direction').notNull(), // BUY | SELL
  timeframe: text('timeframe'),
  entryPrice: real('entry_price'),
  stopLoss: real('stop_loss'),
  takeProfit: text('take_profit'), // JSON array
  lotSize: real('lot_size'),
  status: text('status').default('OPEN'), // OPEN | WIN | LOSS | BREAKEVEN
  pnlDollar: real('pnl_dollar'),
  pnlPips: real('pnl_pips'),
  tags: text('tags'), // JSON array
  chartUrl: text('chart_url'),
  notes: text('notes'),
  setupRating: integer('setup_rating'),
  emotion: text('emotion'),
  sortOrder: integer('sort_order').default(0),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

export const customColumns = sqliteTable('custom_columns', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').default('text'), // text | number | select
  options: text('options'), // JSON array for select
  sortOrder: integer('sort_order').default(0),
});

export const customValues = sqliteTable('custom_values', {
  tradeId: text('trade_id').notNull(),
  columnId: text('column_id').notNull(),
  value: text('value'),
});

export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
export type CustomColumn = typeof customColumns.$inferSelect;
export type CustomValue = typeof customValues.$inferSelect;

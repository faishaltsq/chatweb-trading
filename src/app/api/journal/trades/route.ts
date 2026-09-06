import { db } from '@/lib/journal/db';
import { trades } from '@/lib/journal/schema';
import { initDatabase } from '@/lib/journal/init';
import { desc, eq, like, and, gte, lte } from 'drizzle-orm';
import { NextRequest } from 'next/server';

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  await initDatabase();

  const params = req.nextUrl.searchParams;
  const pair = params.get('pair');
  const status = params.get('status');
  const direction = params.get('direction');
  const tag = params.get('tag');
  const dateFrom = params.get('dateFrom');
  const dateTo = params.get('dateTo');
  const search = params.get('search');

  const conditions = [];
  if (pair) conditions.push(eq(trades.pair, pair));
  if (status) conditions.push(eq(trades.status, status));
  if (direction) conditions.push(eq(trades.direction, direction));
  if (dateFrom) conditions.push(gte(trades.date, dateFrom));
  if (dateTo) conditions.push(lte(trades.date, dateTo));
  if (search) conditions.push(like(trades.notes, `%${search}%`));

  let result;
  if (conditions.length > 0) {
    result = await db.select().from(trades).where(and(...conditions)).orderBy(desc(trades.sortOrder), desc(trades.date));
  } else {
    result = await db.select().from(trades).orderBy(desc(trades.sortOrder), desc(trades.date));
  }

  // Filter by tag (JSON array stored as string)
  let filtered = result;
  if (tag) {
    filtered = result.filter((t) => {
      try {
        const tags = JSON.parse(t.tags || '[]');
        return tags.includes(tag);
      } catch {
        return false;
      }
    });
  }

  return Response.json(filtered);
}

export async function POST(req: NextRequest) {
  await initDatabase();

  const body = await req.json();
  const id = genId();

  await db.insert(trades).values({
    id,
    date: body.date || today(),
    pair: body.pair || 'XAUUSD',
    direction: body.direction || 'BUY',
    timeframe: body.timeframe || null,
    entryPrice: body.entryPrice ?? null,
    stopLoss: body.stopLoss ?? null,
    takeProfit: body.takeProfit ? JSON.stringify(body.takeProfit) : null,
    lotSize: body.lotSize ?? null,
    status: body.status || 'OPEN',
    pnlDollar: body.pnlDollar ?? null,
    pnlPips: body.pnlPips ?? null,
    tags: body.tags ? JSON.stringify(body.tags) : '[]',
    chartUrl: body.chartUrl || null,
    notes: body.notes || null,
    setupRating: body.setupRating ?? null,
    emotion: body.emotion || null,
    sortOrder: body.sortOrder ?? 0,
  });

  const [created] = await db.select().from(trades).where(eq(trades.id, id));
  return Response.json(created, { status: 201 });
}

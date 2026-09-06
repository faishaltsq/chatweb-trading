import { db } from '@/lib/journal/db';
import { trades, customValues } from '@/lib/journal/schema';
import { initDatabase } from '@/lib/journal/init';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDatabase();
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

  const fields = [
    'date', 'pair', 'direction', 'timeframe', 'status', 'notes', 'emotion', 'chartUrl',
  ] as const;
  for (const f of fields) {
    if (body[f] !== undefined) updates[f] = body[f];
  }

  const numFields = ['entryPrice', 'stopLoss', 'lotSize', 'pnlDollar', 'pnlPips', 'setupRating', 'sortOrder'] as const;
  for (const f of numFields) {
    if (body[f] !== undefined) updates[f] = body[f];
  }

  if (body.takeProfit !== undefined) updates.takeProfit = JSON.stringify(body.takeProfit);
  if (body.tags !== undefined) updates.tags = JSON.stringify(body.tags);

  await db.update(trades).set(updates).where(eq(trades.id, id));

  // Handle custom column values
  if (body.customValues && typeof body.customValues === 'object') {
    for (const [colId, val] of Object.entries(body.customValues)) {
      await db.delete(customValues).where(
        eq(customValues.tradeId, id)
      );
    }
    for (const [colId, val] of Object.entries(body.customValues)) {
      await db.insert(customValues).values({
        tradeId: id,
        columnId: colId,
        value: String(val),
      });
    }
  }

  const [updated] = await db.select().from(trades).where(eq(trades.id, id));
  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDatabase();
  const { id } = await params;

  await db.delete(customValues).where(eq(customValues.tradeId, id));
  await db.delete(trades).where(eq(trades.id, id));

  return Response.json({ ok: true });
}

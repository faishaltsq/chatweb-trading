import { db } from '@/lib/journal/db';
import { customValues } from '@/lib/journal/schema';
import { initDatabase } from '@/lib/journal/init';
import { eq, and } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET() {
  await initDatabase();
  const all = await db.select().from(customValues);
  // Group by tradeId -> columnId -> value
  const grouped: Record<string, Record<string, string>> = {};
  for (const row of all) {
    if (!grouped[row.tradeId]) grouped[row.tradeId] = {};
    grouped[row.tradeId][row.columnId] = row.value || '';
  }
  return Response.json(grouped);
}

export async function PUT(req: NextRequest) {
  await initDatabase();
  const { tradeId, columnId, value } = await req.json();

  // Upsert
  await db.delete(customValues).where(
    and(eq(customValues.tradeId, tradeId), eq(customValues.columnId, columnId))
  );
  await db.insert(customValues).values({ tradeId, columnId, value: String(value) });

  return Response.json({ ok: true });
}

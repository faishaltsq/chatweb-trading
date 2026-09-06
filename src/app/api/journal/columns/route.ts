import { db } from '@/lib/journal/db';
import { customColumns } from '@/lib/journal/schema';
import { initDatabase } from '@/lib/journal/init';
import { eq, asc } from 'drizzle-orm';
import { NextRequest } from 'next/server';

function genId() {
  return 'col_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export async function GET() {
  await initDatabase();
  const cols = await db.select().from(customColumns).orderBy(asc(customColumns.sortOrder));
  return Response.json(cols);
}

export async function POST(req: NextRequest) {
  await initDatabase();
  const body = await req.json();
  const id = genId();

  await db.insert(customColumns).values({
    id,
    name: body.name || 'New Column',
    type: body.type || 'text',
    options: body.options ? JSON.stringify(body.options) : null,
    sortOrder: body.sortOrder ?? 0,
  });

  const [created] = await db.select().from(customColumns).where(eq(customColumns.id, id));
  return Response.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  await initDatabase();
  const { id } = await req.json();
  await db.delete(customColumns).where(eq(customColumns.id, id));
  return Response.json({ ok: true });
}

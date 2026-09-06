import { fetchCandles } from '@/lib/market/yahoo';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pair = searchParams.get('pair');
  const interval = searchParams.get('interval') || '1D';

  if (!pair) {
    return Response.json({ error: 'pair is required' }, { status: 400 });
  }

  const data = await fetchCandles(pair, interval);

  if (!data) {
    return Response.json({ error: 'Data not available', pair }, { status: 404 });
  }

  return Response.json(data, {
    headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' },
  });
}

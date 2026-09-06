import { fetchCandles, fetchTradingViewPrice } from '@/lib/market/yahoo';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pair = searchParams.get('pair');
  const interval = searchParams.get('interval') || '1D';

  if (!pair) {
    return Response.json({ error: 'pair is required' }, { status: 400 });
  }

  // Fetch candle data from Yahoo and live quote from TradingView in parallel
  const [data, tvPrice] = await Promise.all([
    fetchCandles(pair, interval),
    fetchTradingViewPrice(pair),
  ]);

  if (!data) {
    return Response.json({ error: 'Data not available', pair }, { status: 404 });
  }

  // If TradingView gave a fresh real-time price, use it in meta
  if (tvPrice?.quote.close != null) {
    data.meta.price = tvPrice.quote.close;
    if (tvPrice.quote.change != null) {
      data.meta.changePercent = Number(tvPrice.quote.change.toFixed(2));
    }
  }

  return Response.json(data, {
    headers: { 'Cache-Control': 'public, max-age=15, stale-while-revalidate=60' },
  });
}

import { NextRequest } from 'next/server';
import { handlers } from '@/auth';
import { initDatabase } from '@/lib/journal/init';

export const GET = async (req: NextRequest) => {
  await initDatabase();
  return handlers.GET(req);
};

export const POST = async (req: NextRequest) => {
  await initDatabase();
  return handlers.POST(req);
};

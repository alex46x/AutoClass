import { NextResponse } from 'next/server';
import { seed } from '@/lib/db/seed';

export async function GET(req: Request) {
  try {
    const setupToken = process.env.SETUP_TOKEN;
    const requestToken = new URL(req.url).searchParams.get('token');

    if (!setupToken || requestToken !== setupToken) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await seed();
    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

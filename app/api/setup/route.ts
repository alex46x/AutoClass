import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const setupToken = process.env.SETUP_TOKEN;
    const requestToken = new URL(req.url).searchParams.get('token');

    if (!setupToken || requestToken !== setupToken) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { seed } = await import('@/lib/db/seed');
    await seed();
    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Setup failed:', error);
    return NextResponse.json(
      {
        error: 'Database setup failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
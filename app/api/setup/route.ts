import { NextResponse } from 'next/server';
import { seed } from '@/lib/db/seed';

export async function GET() {
  try {
    await seed();
    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

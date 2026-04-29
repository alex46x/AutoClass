import { db } from '@/lib/db';
import { users, notifications } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, message } = await req.json();
  if (!title || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Get all users
  const allUsers = await db.select({ id: users.id }).from(users);

  // Insert notifications for everyone
  const inserts = allUsers.map(user => ({
    userId: user.id,
    title,
    message,
    isRead: false
  }));

  // Batch insert if possible, or loop (SQLite better-sqlite3 handles batch well)
  // For simplicity and to avoid SQLite limits, we can chunk if needed, but 500-1000 is fine.
  await db.insert(notifications).values(inserts);

  return NextResponse.json({ success: true });
}

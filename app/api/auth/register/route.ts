import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, name, studentId, roll, semester, section } = await req.json();

    // Ensure it's an NWU email
    if (!email.endsWith('@nwu.ac.bd')) {
      return NextResponse.json({ error: 'Must use a valid @nwu.ac.bd email' }, { status: 400 });
    }

    // Check if email already exists
    const existing = db.select().from(users).where(eq(users.email, email)).get();
    if (existing) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert as PENDING student
    await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: 'STUDENT',
      studentId,
      roll,
      semesterId: semester ? parseInt(semester) : null,
      sectionId: section ? parseInt(section) : null,
      accountStatus: 'PENDING',
      departmentId: 1 // Default department
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

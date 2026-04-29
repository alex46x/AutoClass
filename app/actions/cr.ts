'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireCR() {
  const session = await getSession();
  if (!session || session.role !== 'CR') throw new Error('Unauthorized');
  
  // Fetch full CR user details to get their semester and section
  const crUser = await db.select().from(users).where(eq(users.id, session.id)).get();
  if (!crUser) throw new Error('CR user not found');
  
  return { session, crUser };
}

export async function getPendingClassmates() {
  const { crUser } = await requireCR();
  
  // We only show pending users who have the exact same semester and section as this CR
  return await db.select().from(users).where(
    and(
      eq(users.accountStatus, 'PENDING'),
      eq(users.semester, crUser.semester || ''),
      eq(users.section, crUser.section || '')
    )
  ).orderBy(users.createdAt);
}

export async function approveClassmate(id: number) {
  const { crUser } = await requireCR();
  
  // Verify this user is in the same class before approving
  const targetUser = await db.select().from(users).where(eq(users.id, id)).get();
  if (!targetUser) throw new Error('User not found');
  
  if (targetUser.semester !== crUser.semester || targetUser.section !== crUser.section) {
    throw new Error('You can only approve students in your exact semester and section');
  }

  await db.update(users).set({ accountStatus: 'ACTIVE' }).where(eq(users.id, id));
  revalidatePath('/cr/approvals');
}

export async function rejectClassmate(id: number) {
  const { crUser } = await requireCR();
  
  const targetUser = await db.select().from(users).where(eq(users.id, id)).get();
  if (!targetUser) throw new Error('User not found');
  
  if (targetUser.semester !== crUser.semester || targetUser.section !== crUser.section) {
    throw new Error('You can only reject students in your exact semester and section');
  }

  await db.update(users).set({ accountStatus: 'REJECTED' }).where(eq(users.id, id));
  revalidatePath('/cr/approvals');
}

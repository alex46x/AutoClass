'use server';

import { db } from '@/lib/db';
import { leaveRequests, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendNotification } from './notifications';

// STUDENT ACTIONS
export async function submitLeaveRequest(startDate: string, endDate: string, reason: string) {
  const session = await getSession();
  if (!session || (session.role !== 'STUDENT' && session.role !== 'CR')) throw new Error('Unauthorized');

  await db.insert(leaveRequests).values({
    studentId: session.id,
    startDate,
    endDate,
    reason,
    status: 'PENDING',
  });

  revalidatePath('/dashboard/leave');
}

export async function getMyLeaveRequests() {
  const session = await getSession();
  if (!session || (session.role !== 'STUDENT' && session.role !== 'CR')) throw new Error('Unauthorized');

  return await db
    .select()
    .from(leaveRequests)
    .where(eq(leaveRequests.studentId, session.id))
    .orderBy(desc(leaveRequests.createdAt));
}

// ADMIN ACTIONS
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');
  return session;
}

export async function getPendingLeaveRequests() {
  await requireAdmin();

  // Join with users to show student name
  const requests = await db
    .select({
      id: leaveRequests.id,
      startDate: leaveRequests.startDate,
      endDate: leaveRequests.endDate,
      reason: leaveRequests.reason,
      status: leaveRequests.status,
      adminNote: leaveRequests.adminNote,
      createdAt: leaveRequests.createdAt,
      studentName: users.name,
      studentEmail: users.email,
      studentId: users.studentId,
    })
    .from(leaveRequests)
    .innerJoin(users, eq(leaveRequests.studentId, users.id))
    .where(eq(leaveRequests.status, 'PENDING'))
    .orderBy(desc(leaveRequests.createdAt));

  return requests;
}

export async function updateLeaveStatus(id: number, status: 'APPROVED' | 'REJECTED', adminNote?: string) {
  await requireAdmin();

  // Fetch the request to get the student ID and dates
  const request = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id)).get();

  await db.update(leaveRequests)
    .set({ status, adminNote: adminNote || null })
    .where(eq(leaveRequests.id, id));

  // Auto-notify the student
  if (request) {
    if (status === 'APPROVED') {
      await sendNotification(
        request.studentId,
        '✅ Leave Request Approved',
        `Your leave request from ${request.startDate} to ${request.endDate} has been approved by the Admin.`
      );
    } else {
      const noteText = adminNote ? ` Admin note: "${adminNote}"` : '';
      await sendNotification(
        request.studentId,
        '❌ Leave Request Rejected',
        `Your leave request from ${request.startDate} to ${request.endDate} was rejected.${noteText}`
      );
    }
  }

  revalidatePath('/admin/approvals');
}

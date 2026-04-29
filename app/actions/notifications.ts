'use server';

import { db } from '@/lib/db';
import { notifications, enrollments } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Send a notification to a single user
export async function sendNotification(userId: number, title: string, message: string) {
  await db.insert(notifications).values({ userId, title, message });
}

// Send a notification to all students enrolled in a course
export async function notifyEnrolledStudents(courseId: number, title: string, message: string) {
  const enrolledStudents = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(eq(enrollments.courseId, courseId));

  if (enrolledStudents.length === 0) return;

  await db.insert(notifications).values(
    enrolledStudents.map(e => ({
      userId: e.studentId,
      title,
      message,
    }))
  );
}

// Get current user's notifications
export async function getMyNotifications() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

// Get unread count
export async function getUnreadCount() {
  const session = await getSession();
  if (!session) return 0;

  const unread = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, session.id), eq(notifications.isRead, false)));

  return unread.length;
}

// Mark all notifications as read
export async function markAllRead() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, session.id));

  revalidatePath('/dashboard/notifications');
}

// Mark single notification as read
export async function markOneRead(id: number) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, session.id)));
}

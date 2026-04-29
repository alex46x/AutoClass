'use server';

import { db } from '@/lib/db';
import { courseNotices, users, enrollments } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendNotification } from './notifications';

export async function getCourseNotices(courseId: number) {
  return await db.select({
    id: courseNotices.id,
    title: courseNotices.title,
    message: courseNotices.message,
    createdAt: courseNotices.createdAt,
    teacherName: users.name,
  })
  .from(courseNotices)
  .leftJoin(users, eq(courseNotices.teacherId, users.id))
  .where(eq(courseNotices.courseId, courseId))
  .orderBy(desc(courseNotices.createdAt));
}

export async function addCourseNotice(data: {
  courseId: number;
  title: string;
  message: string;
}) {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') throw new Error('Unauthorized');

  await db.insert(courseNotices).values({
    courseId: data.courseId,
    teacherId: session.id,
    title: data.title,
    message: data.message,
  });

  // Also send a system notification to all enrolled students
  const students = await db.select({ id: enrollments.studentId }).from(enrollments).where(eq(enrollments.courseId, data.courseId));
  
  for (const student of students) {
    await sendNotification(
      student.id,
      `📢 New Notice: ${data.title}`,
      `A new notice has been posted in your course. Check the course notice board for details.`
    );
  }

  revalidatePath(`/dashboard/courses`);
}

export async function deleteCourseNotice(id: number) {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') throw new Error('Unauthorized');

  await db.delete(courseNotices).where(and(
    eq(courseNotices.id, id),
    eq(courseNotices.teacherId, session.id)
  ));

  revalidatePath(`/dashboard/courses`);
}

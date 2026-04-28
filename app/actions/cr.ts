'use server';

import { db } from '@/lib/db';
import { courses, classrooms, users, makeupClasses, enrollments, notifications } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getCRFormData() {
  const session = await getSession();
  if (!session || session.role !== 'CR') {
    throw new Error('Unauthorized');
  }

  // Get courses the CR is enrolled in
  const crCourses = await db
    .select({
      id: courses.id,
      name: courses.name,
      code: courses.code,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.studentId, session.id));

  const allClassrooms = await db.select().from(classrooms);
  
  const teachers = await db
    .select({
      id: users.id,
      name: users.name,
    })
    .from(users)
    .where(eq(users.role, 'TEACHER'));

  return { courses: crCourses, classrooms: allClassrooms, teachers };
}

export async function requestMakeupClass(data: {
  courseId: number;
  classroomId: number;
  teacherId: number;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const session = await getSession();
  if (!session || session.role !== 'CR') {
    throw new Error('Unauthorized');
  }

  await db.insert(makeupClasses).values({
    courseId: data.courseId,
    classroomId: data.classroomId,
    teacherId: data.teacherId,
    requestedBy: session.id,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    status: 'PENDING',
  });

  revalidatePath('/cr');
  return { success: true };
}

export async function sendNotice(data: {
  courseId: number;
  title: string;
  message: string;
}) {
  const session = await getSession();
  if (!session || session.role !== 'CR') {
    throw new Error('Unauthorized');
  }

  // Find all students enrolled in this course
  const students = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(eq(enrollments.courseId, data.courseId));

  if (students.length === 0) return { success: true };

  const studentIds = students.map((s) => s.studentId);

  // Add the CR as well if they want to receive their own notice
  if (!studentIds.includes(session.id)) {
      studentIds.push(session.id);
  }

  const notificationValues = studentIds.map((userId) => ({
    userId,
    title: data.title,
    message: data.message,
    isRead: false,
  }));

  await db.insert(notifications).values(notificationValues);

  revalidatePath('/dashboard');
  return { success: true };
}

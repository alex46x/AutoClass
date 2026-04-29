'use server';

import { db } from '@/lib/db';
import { users, courses, enrollments, departments } from '@/lib/db/schema';
import { eq, and, notInArray, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireStudent() {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') throw new Error('Unauthorized');
  return session;
}

// ── Profile ──────────────────────────────────────────────────────────────────

export async function getStudentProfile() {
  const session = await requireStudent();
  const user = await db.select().from(users).where(eq(users.id, session.id)).get();
  if (!user) throw new Error('User not found');
  return user;
}

export async function updateStudentProfile(data: {
  name: string;
  semester: string;
  section: string;
  roll: string;
  phone?: string;
}) {
  const session = await requireStudent();

  await db.update(users).set({
    name: data.name,
    semester: data.semester,
    section: data.section,
    roll: data.roll,
  }).where(eq(users.id, session.id));

  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard');
}

// ── Enrollment ────────────────────────────────────────────────────────────────

// Get all courses available (optionally filtered by department or semester)
export async function getAvailableCourses() {
  const session = await requireStudent();

  // Get currently enrolled course IDs
  const enrolled = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.studentId, session.id));

  const enrolledIds = enrolled.map(e => e.courseId);

  // Get all courses with department name
  const allCourses = await db.select({
    id: courses.id,
    name: courses.name,
    code: courses.code,
    credits: courses.credits,
    departmentName: departments.name,
  })
    .from(courses)
    .leftJoin(departments, eq(courses.departmentId, departments.id))
    .orderBy(courses.code);

  return allCourses.map(c => ({
    ...c,
    isEnrolled: enrolledIds.includes(c.id),
  }));
}

export async function enrollInCourse(courseId: number) {
  const session = await requireStudent();

  // Check not already enrolled
  const existing = await db.select().from(enrollments)
    .where(and(eq(enrollments.studentId, session.id), eq(enrollments.courseId, courseId)))
    .get();

  if (existing) throw new Error('Already enrolled');

  await db.insert(enrollments).values({
    studentId: session.id,
    courseId,
  });

  revalidatePath('/dashboard/courses');
}

export async function unenrollFromCourse(courseId: number) {
  const session = await requireStudent();

  await db.delete(enrollments).where(
    and(
      eq(enrollments.studentId, session.id),
      eq(enrollments.courseId, courseId)
    )
  );

  revalidatePath('/dashboard/courses');
}

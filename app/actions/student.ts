'use server';

import { db } from '@/lib/db';
import { schedules, enrollments, courses, classrooms, users, attendance } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function getStudentRoutine() {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    throw new Error('Unauthorized');
  }

  // Find courses the student is enrolled in
  const studentEnrollments = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.studentId, session.id));

  const courseIds = studentEnrollments.map((e) => e.courseId);

  if (courseIds.length === 0) return [];

  // Get schedules for these courses
  const routine = await db
    .select({
      id: schedules.id,
      dayOfWeek: schedules.dayOfWeek,
      startTime: schedules.startTime,
      endTime: schedules.endTime,
      course: {
        id: courses.id,
        name: courses.name,
        code: courses.code,
      },
      classroom: {
        name: classrooms.name,
      },
      teacher: {
        name: users.name,
      },
    })
    .from(schedules)
    .innerJoin(courses, eq(schedules.courseId, courses.id))
    .innerJoin(classrooms, eq(schedules.classroomId, classrooms.id))
    .innerJoin(users, eq(schedules.teacherId, users.id))
    .where(sql`${schedules.courseId} IN ${courseIds}`);

  return routine;
}

export async function getStudentCourses() {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    throw new Error('Unauthorized');
  }

  // Get courses the student is enrolled in
  const enrolledCourses = await db
    .select({
      id: courses.id,
      name: courses.name,
      code: courses.code,
      credits: courses.credits,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.studentId, session.id));

  // Get attendance stats for these courses
  const stats = await Promise.all(
    enrolledCourses.map(async (course) => {
      const records = await db
        .select({ status: attendance.status })
        .from(attendance)
        .where(
          and(
            eq(attendance.studentId, session.id),
            eq(attendance.courseId, course.id)
          )
        );

      const totalClasses = records.length;
      const attendedClasses = records.filter(
        (r) => r.status === 'PRESENT' || r.status === 'LATE'
      ).length;

      const percentage = totalClasses === 0 ? 100 : Math.round((attendedClasses / totalClasses) * 100);

      return {
        ...course,
        totalClasses,
        attendedClasses,
        percentage,
      };
    })
  );

  return stats;
}

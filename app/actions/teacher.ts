'use server';

import { db } from '@/lib/db';
import { schedules, courses, classrooms } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function getTeacherClasses() {
  const session = await getSession();
  if (!session || (session.role !== 'TEACHER' && session.role !== 'HEAD')) {
    throw new Error('Unauthorized');
  }

  const classes = await db
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
    })
    .from(schedules)
    .innerJoin(courses, eq(schedules.courseId, courses.id))
    .innerJoin(classrooms, eq(schedules.classroomId, classrooms.id))
    .where(eq(schedules.teacherId, session.id));

  return classes;
}

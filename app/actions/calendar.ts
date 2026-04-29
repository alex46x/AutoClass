'use server';

import { db } from '@/lib/db';
import { 
  schedules, 
  makeupClasses, 
  exams, 
  courses, 
  classrooms, 
  enrollments 
} from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function getCalendarEvents() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const userId = session.id;

  // 1. Fetch Regular Classes (Schedules)
  // If student, fetch for enrolled courses. If teacher, fetch for their courses.
  let regularClasses;
  if (session.role === 'STUDENT' || session.role === 'CR') {
    regularClasses = await db.select({
      id: schedules.id,
      dayOfWeek: schedules.dayOfWeek,
      startTime: schedules.startTime,
      endTime: schedules.endTime,
      courseName: courses.name,
      courseCode: courses.code,
      classroom: classrooms.name,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(schedules, eq(courses.id, schedules.courseId))
    .innerJoin(classrooms, eq(schedules.classroomId, classrooms.id))
    .where(eq(enrollments.studentId, userId));
  } else if (session.role === 'TEACHER') {
    regularClasses = await db.select({
      id: schedules.id,
      dayOfWeek: schedules.dayOfWeek,
      startTime: schedules.startTime,
      endTime: schedules.endTime,
      courseName: courses.name,
      courseCode: courses.code,
      classroom: classrooms.name,
    })
    .from(schedules)
    .innerJoin(courses, eq(schedules.courseId, courses.id))
    .innerJoin(classrooms, eq(schedules.classroomId, classrooms.id))
    .where(eq(schedules.teacherId, userId));
  } else {
    regularClasses = [];
  }

  // 2. Fetch Approved Makeup Classes
  let makeupEvents;
  if (session.role === 'STUDENT' || session.role === 'CR') {
     makeupEvents = await db.select({
      id: makeupClasses.id,
      date: makeupClasses.date,
      startTime: makeupClasses.startTime,
      endTime: makeupClasses.endTime,
      courseName: courses.name,
      courseCode: courses.code,
      classroom: classrooms.name,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(makeupClasses, eq(courses.id, makeupClasses.courseId))
    .innerJoin(classrooms, eq(makeupClasses.classroomId, classrooms.id))
    .where(and(eq(enrollments.studentId, userId), eq(makeupClasses.status, 'APPROVED')));
  } else {
    makeupEvents = await db.select({
      id: makeupClasses.id,
      date: makeupClasses.date,
      startTime: makeupClasses.startTime,
      endTime: makeupClasses.endTime,
      courseName: courses.name,
      courseCode: courses.code,
      classroom: classrooms.name,
    })
    .from(makeupClasses)
    .innerJoin(courses, eq(makeupClasses.courseId, courses.id))
    .innerJoin(classrooms, eq(makeupClasses.classroomId, classrooms.id))
    .where(and(eq(makeupClasses.teacherId, userId), eq(makeupClasses.status, 'APPROVED')));
  }

  // 3. Fetch Exams
  let examEvents;
  if (session.role === 'STUDENT' || session.role === 'CR') {
    examEvents = await db.select({
      id: exams.id,
      date: exams.date,
      startTime: exams.startTime,
      type: exams.type,
      title: exams.title,
      courseName: courses.name,
      courseCode: courses.code,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(exams, eq(courses.id, exams.courseId))
    .where(eq(enrollments.studentId, userId));
  } else {
    examEvents = await db.select({
      id: exams.id,
      date: exams.date,
      startTime: exams.startTime,
      type: exams.type,
      title: exams.title,
      courseName: courses.name,
      courseCode: courses.code,
    })
    .from(exams)
    .innerJoin(courses, eq(exams.courseId, courses.id))
    .innerJoin(schedules, eq(courses.id, schedules.courseId))
    .where(eq(schedules.teacherId, userId));
  }

  return {
    regular: regularClasses,
    makeup: makeupEvents,
    exams: examEvents,
  };
}

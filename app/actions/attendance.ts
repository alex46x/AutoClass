'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { attendance, schedules, courses, classrooms, enrollments, users, makeupClasses } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

async function requireTeacher() {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') throw new Error('Unauthorized');
  return session;
}

// Get teacher's schedule for a given date (day of week 0=Sun, 1=Mon...)
export async function getTeacherSessionsForDate(date: string) {
  const session = await requireTeacher();

  const d = new Date(date);
  const dayOfWeek = d.getDay();

  // Regular scheduled classes for that weekday
  const regularClasses = await db.select({
    id: schedules.id,
    type: sql<string>`'REGULAR'`.as('type'),
    courseId: schedules.courseId,
    courseName: courses.name,
    courseCode: courses.code,
    classroomName: classrooms.name,
    startTime: schedules.startTime,
    endTime: schedules.endTime,
    date: sql<string>`${date}`.as('date'),
  })
    .from(schedules)
    .innerJoin(courses, eq(schedules.courseId, courses.id))
    .innerJoin(classrooms, eq(schedules.classroomId, classrooms.id))
    .where(and(eq(schedules.teacherId, session.id), eq(schedules.dayOfWeek, dayOfWeek)));

  // Approved makeup classes for that specific date
  const makeupClassList = await db.select({
    id: makeupClasses.id,
    type: sql<string>`'MAKEUP'`.as('type'),
    courseId: makeupClasses.courseId,
    courseName: courses.name,
    courseCode: courses.code,
    classroomName: classrooms.name,
    startTime: makeupClasses.startTime,
    endTime: makeupClasses.endTime,
    date: makeupClasses.date,
  })
    .from(makeupClasses)
    .innerJoin(courses, eq(makeupClasses.courseId, courses.id))
    .innerJoin(classrooms, eq(makeupClasses.classroomId, classrooms.id))
    .where(and(
      eq(makeupClasses.teacherId, session.id),
      eq(makeupClasses.date, date),
      eq(makeupClasses.status, 'APPROVED')
    ));

  return [...regularClasses, ...makeupClassList].sort((a, b) => a.startTime.localeCompare(b.startTime));
}

// Get enrolled students for a course with their attendance for a specific session
export async function getStudentsForAttendance(courseId: number, sessionId: number, sessionType: 'REGULAR' | 'MAKEUP', date: string) {
  await requireTeacher();

  // Get enrolled students
  const enrolledStudents = await db.select({
    id: users.id,
    name: users.name,
    studentId: users.studentId,
    roll: users.roll,
  })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(eq(enrollments.courseId, courseId));

  // Get existing attendance for this session
  const existingAttendance = sessionType === 'REGULAR'
    ? await db.select().from(attendance).where(and(eq(attendance.scheduleId, sessionId), eq(attendance.date, date)))
    : await db.select().from(attendance).where(and(eq(attendance.makeupClassId, sessionId), eq(attendance.date, date)));

  return enrolledStudents.map(student => {
    const record = existingAttendance.find(a => a.studentId === student.id);
    return {
      ...student,
      status: record?.status ?? 'PRESENT', // default to PRESENT
      marked: !!record,
    };
  }).sort((a, b) => Number(a.roll || 999) - Number(b.roll || 999));
}

// Save attendance for a session
export async function saveAttendance(
  courseId: number,
  sessionId: number,
  sessionType: 'REGULAR' | 'MAKEUP',
  date: string,
  records: { studentId: number; status: 'PRESENT' | 'ABSENT' | 'LATE' }[]
) {
  const session = await requireTeacher();

  // Delete existing for this session + date first
  if (sessionType === 'REGULAR') {
    await db.delete(attendance).where(and(eq(attendance.scheduleId, sessionId), eq(attendance.date, date)));
  } else {
    await db.delete(attendance).where(and(eq(attendance.makeupClassId, sessionId), eq(attendance.date, date)));
  }

  if (records.length > 0) {
    await db.insert(attendance).values(records.map(r => ({
      courseId,
      studentId: r.studentId,
      teacherId: session.id,
      date,
      status: r.status,
      scheduleId: sessionType === 'REGULAR' ? sessionId : null,
      makeupClassId: sessionType === 'MAKEUP' ? sessionId : null,
    })));
  }

  revalidatePath('/teacher/classes');
}

export async function getCourseAttendanceSummary(courseId: number) {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') throw new Error('Unauthorized');

  const data = await db.all(sql`
    SELECT u.name as StudentName, u.roll as Roll, u.student_id as StudentID,
           COUNT(*) as TotalClasses,
           SUM(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END) as Attended,
           ROUND(SUM(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as Percentage
    FROM users u
    JOIN attendance a ON u.id = a.student_id
    WHERE a.course_id = ${courseId}
    GROUP BY u.id
    ORDER BY u.roll ASC
  `);

  return data;
}

// Get all sessions taken by teacher (for history)
export async function getAttendanceHistory(courseId?: number) {
  const session = await requireTeacher();

  const query = db.select({
    date: attendance.date,
    courseId: attendance.courseId,
    courseName: courses.name,
    total: sql<number>`COUNT(*)`.as('total'),
    present: sql<number>`SUM(CASE WHEN ${attendance.status} = 'PRESENT' OR ${attendance.status} = 'LATE' THEN 1 ELSE 0 END)`.as('present'),
    absent: sql<number>`SUM(CASE WHEN ${attendance.status} = 'ABSENT' THEN 1 ELSE 0 END)`.as('absent'),
  })
    .from(attendance)
    .innerJoin(courses, eq(attendance.courseId, courses.id))
    .where(eq(attendance.teacherId, session.id))
    .groupBy(attendance.date, attendance.courseId)
    .orderBy(sql`${attendance.date} DESC`);

  return await query.limit(30);
}

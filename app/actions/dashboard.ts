'use server';

import { db } from '@/lib/db';
import { 
  attendance, 
  enrollments, 
  exams, 
  grades, 
  schedules, 
  makeupClasses 
} from '@/lib/db/schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

async function requireRole(role: string) {
  const session = await getSession();
  if (!session || session.role !== role) throw new Error('Unauthorized');
  return session;
}

export async function getStudentDashboardStats() {
  const session = await getSession();
  if (!session || (session.role !== 'STUDENT' && session.role !== 'CR')) throw new Error('Unauthorized');
  const userId = session.id;

  // 1. Attendance %
  const [attData] = await db.select({
    total: sql<number>`COUNT(*)`,
    present: sql<number>`SUM(CASE WHEN ${attendance.status} IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END)`,
  }).from(attendance).where(eq(attendance.studentId, userId));

  const attendancePct = attData.total > 0 ? Math.round((attData.present / attData.total) * 100) : 0;

  // 2. GPA Calculation (Simplified)
  // We'll calculate based on marks: >80=4.0, >70=3.5, >60=3.0, >50=2.5, else 0
  const studentGrades = await db.select({
    marks: grades.marksObtained,
    maxMarks: exams.maxMarks,
  })
  .from(grades)
  .innerJoin(exams, eq(grades.examId, exams.id))
  .where(eq(grades.studentId, userId));

  let totalPoints = 0;
  studentGrades.forEach(g => {
    const pct = (g.marks / g.maxMarks) * 100;
    if (pct >= 80) totalPoints += 4.0;
    else if (pct >= 70) totalPoints += 3.5;
    else if (pct >= 60) totalPoints += 3.0;
    else if (pct >= 50) totalPoints += 2.5;
    else totalPoints += 0;
  });

  const cgpa = studentGrades.length > 0 ? (totalPoints / studentGrades.length).toFixed(2) : '0.00';

  // 3. Upcoming Exams (Next 7 days)
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const upcomingExams = await db.select({ id: exams.id })
    .from(enrollments)
    .innerJoin(exams, eq(enrollments.courseId, exams.courseId))
    .where(and(
      eq(enrollments.studentId, userId),
      gte(exams.date, today),
      lte(exams.date, nextWeek)
    ));

  return {
    attendance: attendancePct,
    cgpa,
    examCount: upcomingExams.length,
    courseCount: (await db.select().from(enrollments).where(eq(enrollments.studentId, userId))).length,
  };
}

export async function getTeacherDashboardStats() {
  const session = await requireRole('TEACHER');
  const userId = session.id;

  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay();

  // 1. Classes Today
  const regularToday = await db.select({ id: schedules.id }).from(schedules)
    .where(and(eq(schedules.teacherId, userId), eq(schedules.dayOfWeek, dayOfWeek)));
  
  const makeupToday = await db.select({ id: makeupClasses.id }).from(makeupClasses)
    .where(and(
      eq(makeupClasses.teacherId, userId),
      eq(makeupClasses.date, today),
      eq(makeupClasses.status, 'APPROVED')
    ));

  // 2. Avg Attendance for their courses
  const [teacherAtt] = await db.select({
    total: sql<number>`COUNT(*)`,
    present: sql<number>`SUM(CASE WHEN ${attendance.status} IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END)`,
  }).from(attendance).where(eq(attendance.teacherId, userId));

  const avgAttendance = teacherAtt.total > 0 ? Math.round((teacherAtt.present / teacherAtt.total) * 100) : 0;

  // 3. Courses taught
  const teacherCourses = await db.select({ id: schedules.courseId }).from(schedules)
    .where(eq(schedules.teacherId, userId));
  const uniqueCourseIds = new Set(teacherCourses.map(c => c.id));

  return {
    classesToday: regularToday.length + makeupToday.length,
    avgAttendance,
    courseCount: uniqueCourseIds.size,
    sessionName: session.name,
  };
}

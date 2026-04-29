'use server';

import { db } from '@/lib/db';
import { 
  attendance, 
  courses, 
  grades, 
  exams, 
  leaveRequests, 
  users, 
  enrollments 
} from '@/lib/db/schema';
import { eq, sql, and, count } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');
  return session;
}

export async function getAdminReportStats() {
  await requireAdmin();

  // 1. System Overview
  const [userCounts] = await db.select({
    totalStudents: sql<number>`SUM(CASE WHEN ${users.role} = 'STUDENT' THEN 1 ELSE 0 END)`,
    totalTeachers: sql<number>`SUM(CASE WHEN ${users.role} = 'TEACHER' THEN 1 ELSE 0 END)`,
    totalCRs: sql<number>`SUM(CASE WHEN ${users.role} = 'CR' THEN 1 ELSE 0 END)`,
  }).from(users);

  const [courseCount] = await db.select({ count: count() }).from(courses);

  // 2. Attendance Stats per Course
  const attendanceStats = await db.select({
    courseId: courses.id,
    courseName: courses.name,
    courseCode: courses.code,
    avgAttendance: sql<number>`
      ROUND(
        SUM(CASE WHEN ${attendance.status} IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END) * 100.0 / 
        NULLIF(COUNT(*), 0), 
        1
      )
    `
  })
  .from(courses)
  .leftJoin(attendance, eq(courses.id, attendance.courseId))
  .groupBy(courses.id)
  .orderBy(sql`avgAttendance DESC`);

  // 3. Grade Stats per Course
  const gradeStats = await db.select({
    courseId: courses.id,
    courseName: courses.name,
    avgScore: sql<number>`
      ROUND(
        AVG(${grades.marksObtained} * 100.0 / ${exams.maxMarks}),
        1
      )
    `
  })
  .from(courses)
  .innerJoin(exams, eq(courses.id, exams.courseId))
  .innerJoin(grades, eq(exams.id, grades.examId))
  .groupBy(courses.id);

  // 4. Leave Stats
  const [leaveStats] = await db.select({
    pending: sql<number>`SUM(CASE WHEN ${leaveRequests.status} = 'PENDING' THEN 1 ELSE 0 END)`,
    approved: sql<number>`SUM(CASE WHEN ${leaveRequests.status} = 'APPROVED' THEN 1 ELSE 0 END)`,
    rejected: sql<number>`SUM(CASE WHEN ${leaveRequests.status} = 'REJECTED' THEN 1 ELSE 0 END)`,
  }).from(leaveRequests);

  return {
    system: {
      students: userCounts.totalStudents || 0,
      teachers: userCounts.totalTeachers || 0,
      crs: userCounts.totalCRs || 0,
      courses: courseCount.count || 0,
    },
    attendance: attendanceStats,
    grades: gradeStats,
    leaves: {
      pending: leaveStats.pending || 0,
      approved: leaveStats.approved || 0,
      rejected: leaveStats.rejected || 0,
    }
  };
}

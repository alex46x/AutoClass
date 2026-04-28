import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { sql } from 'drizzle-orm';
import AttendanceClient from './AttendanceClient';

export default async function TakeAttendancePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ courseId: string; roomId: string }> 
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const scheduleId = parseInt(resolvedParams.id);
  const courseId = parseInt(resolvedSearchParams.courseId);
  const session = await getSession();

  if (!session || session.role !== 'TEACHER') redirect('/login');

  const students = await db.all(sql`
    SELECT u.id, u.name, u.email
    FROM users u
    JOIN enrollments e ON e.student_id = u.id
    WHERE e.course_id = ${courseId} AND u.role IN ('STUDENT', 'CR')
    ORDER BY u.name ASC
  `);

  const todayStr = new Date().toISOString().split('T')[0];

  // Get current existing attendance if any
  const existingAttendance = await db.all(sql`
     SELECT student_id as studentId, status 
     FROM attendance 
     WHERE schedule_id = ${scheduleId} AND date = ${todayStr}
  `);

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Take Attendance</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Logging attendance for today ({todayStr})
        </p>
      </div>

      <AttendanceClient 
        students={students as any[]} 
        scheduleId={scheduleId}
        courseId={courseId}
        date={todayStr}
        initialRecords={existingAttendance as any[]}
      />
    </div>
  );
}

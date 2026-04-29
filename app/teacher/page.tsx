import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { schedules, courses, attendance, classrooms, enrollments, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Users, BookOpen, Clock, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

export default async function TeacherDashboard() {
  const session = await getSession();
  if (!session) return null;

  // Get courses assigned to teacher
  const assignedCourses = await db.all(sql`
    SELECT c.id, c.name, c.code, COUNT(e.student_id) as student_count
    FROM courses c
    JOIN schedules s ON s.course_id = c.id
    LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE s.teacher_id = ${session.id}
    GROUP BY c.id
  `);

  // Get today's classes
  const todayDayOfWeek = new Date().getDay();
  const todaysClasses = await db.all(sql`
    SELECT s.id as schedule_id, s.start_time, s.end_time, c.name as course_name, c.code as course_code, 
           cr.name as room_name, cr.id as room_id, c.id as course_id
    FROM schedules s
    JOIN courses c ON s.course_id = c.id
    JOIN classrooms cr ON s.classroom_id = cr.id
    WHERE s.teacher_id = ${session.id} AND s.day_of_week = ${todayDayOfWeek}
    ORDER BY s.start_time ASC
  `);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
      {/* Quick Stats Grid (Takes 1 col each) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
        <div className="flex items-center gap-4 mb-2 relative z-10">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Assigned Courses</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{assignedCourses.length}</p>
          </div>
        </div>
      </div>
           
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
        <div className="flex items-center gap-4 mb-2 relative z-10">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Students</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {assignedCourses.reduce((sum: number, c: any) => sum + c.student_count, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions (Takes 2 cols) */}
      <div className="lg:col-span-2 bg-indigo-900 rounded-3xl p-6 border border-indigo-800 shadow-sm flex flex-col justify-center relative overflow-hidden text-white">
        <div className="relative z-10 flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">Quick Actions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/teacher/classes" className="text-left px-4 py-3 rounded-xl bg-indigo-800/50 hover:bg-indigo-800 text-indigo-50 font-medium text-sm transition-colors border border-indigo-700/50 flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-indigo-300" /> My Courses
              </Link>
              <Link href="/teacher/rooms" className="text-left px-4 py-3 rounded-xl bg-indigo-800/50 hover:bg-indigo-800 text-indigo-50 font-medium text-sm transition-colors border border-indigo-700/50 flex items-center gap-3">
                 <Users className="w-4 h-4 text-indigo-300" /> Find Empty Room
              </Link>
              <Link href="/teacher/export" className="text-left px-4 py-3 rounded-xl bg-indigo-800/50 hover:bg-indigo-800 text-indigo-50 font-medium text-sm transition-colors border border-indigo-700/50 flex items-center gap-3 sm:col-span-2">
                 <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Attendance (Excel)
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-12 translate-x-12"></div>
      </div>

      {/* Today's Schedule for Teacher (Spans 4 cols) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Classes Today</h3>
          <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold underline cursor-pointer">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todaysClasses.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Your day is clear! 📅</p>
            </div>
          ) : (
            (todaysClasses as any[]).map((cls, idx) => (
              <div key={idx} className="flex flex-col gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                   <div className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                     {cls.course_code}
                   </div>
                   <div className="text-xs font-bold text-slate-500 text-right">
                     {cls.start_time} - {cls.end_time}
                   </div>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{cls.course_name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{cls.room_name}</p>
                </div>
                <div className="mt-auto pt-2">
                  <Link href={`/teacher/classes/${cls.schedule_id}?courseId=${cls.course_id}&roomId=${cls.room_id}`} className="block w-full text-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                    Take Attendance
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

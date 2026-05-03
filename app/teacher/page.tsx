import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { schedules, courses, classrooms } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { Users, BookOpen, Clock, FileSpreadsheet, Calendar, TrendingUp, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { getTeacherDashboardStats } from '@/app/actions/dashboard';

export default async function TeacherDashboard() {
  const session = await getSession();
  if (!session) return null;

  const [stats, todaysClasses] = await Promise.all([
    getTeacherDashboardStats(),
    db.all(sql`
      SELECT s.id as schedule_id, s.start_time, s.end_time, c.name as course_name, c.code as course_code, 
             cr.name as room_name, cr.id as room_id, c.id as course_id
      FROM schedules s
      JOIN courses c ON s.course_id = c.id
      JOIN classrooms cr ON s.classroom_id = cr.id
      WHERE s.teacher_id = ${session.id} AND s.day_of_week = ${new Date().getDay()}
      ORDER BY s.start_time ASC
    `)
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">Welcome, Prof. {stats.sessionName.split(' ')[0]}</h2>
          <p className="text-indigo-200 font-medium max-w-md">
            You have <span className="text-white font-bold">{stats.classesToday} classes</span> scheduled for today. 
            Your average session attendance is at <span className="text-white font-bold">{stats.avgAttendance}%</span>.
          </p>
          <div className="flex gap-3 mt-6">
            <Link href="/teacher/classes" className="bg-white text-indigo-900 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-950 hover:bg-indigo-50 transition-colors">
              Start Session
            </Link>
            <Link href="/teacher/grading" className="bg-indigo-800 text-indigo-100 px-5 py-2.5 rounded-2xl text-sm font-bold border border-indigo-700 hover:bg-indigo-700 transition-colors">
              Grading Portal
            </Link>
            {session.role === 'HEAD' && (
              <Link href="/teacher/events" className="bg-indigo-800 text-indigo-100 px-5 py-2.5 rounded-2xl text-sm font-bold border border-indigo-700 hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                Events
              </Link>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -translate-y-12 translate-x-12" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Classes Today</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.classesToday}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg. Attendance</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.avgAttendance}%</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Courses</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.courseCount}</p>
        </div>
      </div>

      {/* Today's Classes List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Course Sessions</h3>
        {todaysClasses.length === 0 ? (
          <p className="text-center py-12 text-slate-500 font-medium italic">No classes scheduled for today.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysClasses.map((cls: any, idx: number) => (
              <div key={idx} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 bg-white dark:bg-slate-800 text-[10px] font-black text-slate-500 rounded-md border border-slate-200 dark:border-slate-700">
                    {cls.course_code}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{cls.start_time}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{cls.course_name}</h4>
                <p className="text-xs text-slate-500 font-medium mb-4">{cls.room_name}</p>
                <Link 
                  href={`/teacher/classes?date=${new Date().toISOString().split('T')[0]}`} 
                  className="mt-auto w-full text-center py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 dark:shadow-none"
                >
                  Mark Attendance
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

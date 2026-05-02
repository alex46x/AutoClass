import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { Calendar, CheckCircle2, BellRing, BellOff, GraduationCap, BookOpen, BarChart3, Megaphone } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { getStudentDashboardStats } from '@/app/actions/dashboard';
import { getClassPolls, getStudentClassPosts } from '@/app/actions/cr';
import Link from 'next/link';

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session) return null;

  const [stats, todaysClasses, latestNotice, classPolls, classUpdates, unreadClassActivity] = await Promise.all([
    getStudentDashboardStats(),
    db.all(sql`
      SELECT s.start_time, s.end_time, c.name as course_name, c.code as course_code, 
             cr.name as room_name, u.name as teacher_name
      FROM schedules s
      JOIN courses c ON s.course_id = c.id
      JOIN classrooms cr ON s.classroom_id = cr.id
      JOIN users u ON s.teacher_id = u.id
      JOIN enrollments e ON e.course_id = c.id
      WHERE e.student_id = ${session.id} AND s.day_of_week = ${new Date().getDay()}
      ORDER BY s.start_time ASC
    `),
    db.select().from(notifications)
      .where(and(eq(notifications.userId, session.id), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt))
      .limit(1)
      .then(rows => rows[0]),
    getClassPolls(),
    getStudentClassPosts(),
    db.select({ count: sql<number>`COUNT(*)` }).from(notifications)
      .where(and(
        eq(notifications.userId, session.id),
        eq(notifications.isRead, false),
        sql`(${notifications.title} LIKE '%Poll%' OR ${notifications.title} LIKE '%Notice%' OR ${notifications.title} LIKE '%Schedule%')`
      ))
      .then(rows => Number(rows[0]?.count || 0))
  ]);

  const isDanger = stats.attendance < 75;
  const openPollCount = classPolls.filter(poll => poll.status === 'OPEN').length;
  const recentUpdateCount = classUpdates.length;

  async function markAsRead(formData: FormData) {
    'use server';
    const id = Number(formData.get('id'));
    if (!id) return;
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
    revalidatePath('/dashboard');
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.attendance}%</p>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {isDanger ? 'Low' : 'Safe'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Est. CGPA</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.cgpa}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center mb-4 text-rose-600 dark:text-rose-400">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Exams</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.examCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Courses</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.courseCount}</p>
        </div>
      </div>

      {(openPollCount > 0 || recentUpdateCount > 0 || unreadClassActivity > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/polls" className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Class Polls</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{openPollCount} open poll{openPollCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {openPollCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  New
                </span>
              )}
            </div>
          </Link>

          <Link href="/dashboard/class-updates" className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">CR Notices & Schedules</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{recentUpdateCount} class update{recentUpdateCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {unreadClassActivity > 0 && (
                <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  {unreadClassActivity} new
                </span>
              )}
            </div>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Section */}
        <div className="lg:col-span-2 bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                {latestNotice ? <BellRing className="w-5 h-5 text-indigo-300" /> : <BellOff className="w-5 h-5 text-indigo-300" />}
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-300">
                {latestNotice ? 'Urgent Notice' : 'System Healthy'}
              </span>
            </div>
            
            {latestNotice ? (
              <div className="max-w-md">
                <h4 className="text-2xl font-black mb-3">{latestNotice.title}</h4>
                <p className="text-indigo-100/70 leading-relaxed mb-6 line-clamp-3 font-medium">
                  {latestNotice.message}
                </p>
                <form action={markAsRead}>
                  <input type="hidden" name="id" value={latestNotice.id} />
                  <button type="submit" className="bg-white text-indigo-900 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-950">
                    Mark as Read
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <h4 className="text-2xl font-black mb-3">No pending alerts</h4>
                <p className="text-indigo-100/70 font-medium">Everything looks good. You are all caught up for the day!</p>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -translate-y-12 translate-x-12" />
        </div>

        {/* Schedule Sidebar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-between">
            Schedule
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Today</span>
          </h3>
          <div className="space-y-4">
            {todaysClasses.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-sm font-medium italic">No classes today! 🎉</p>
            ) : (
              todaysClasses.map((cls: any, idx: number) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="text-xs font-bold text-slate-400 w-12 pt-1">{cls.start_time}</div>
                  <div className="flex-1 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cls.course_name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{cls.room_name} • {cls.teacher_name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

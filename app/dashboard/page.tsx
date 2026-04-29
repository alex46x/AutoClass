import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { schedules, courses, attendance, classrooms, users, notifications } from '@/lib/db/schema';
import { eq, and, getTableColumns, sql, desc } from 'drizzle-orm';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle2, BellRing, BellOff } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session) return null;

  // 1. Get today's classes
  const todayDayOfWeek = new Date().getDay(); // 0 is Sunday
  
  // Need to join enrollments to see if student's course is scheduled today
  const todaysClasses = await db.all(sql`
    SELECT s.start_time, s.end_time, c.name as course_name, c.code as course_code, 
           cr.name as room_name, u.name as teacher_name
    FROM schedules s
    JOIN courses c ON s.course_id = c.id
    JOIN classrooms cr ON s.classroom_id = cr.id
    JOIN users u ON s.teacher_id = u.id
    JOIN enrollments e ON e.course_id = c.id
    WHERE e.student_id = ${session.id} AND s.day_of_week = ${todayDayOfWeek}
    ORDER BY s.start_time ASC
  `);

  // 2. Calculate Attendance Percentage
  // Count total classes and present classes for this student
  const attendanceRecords = await db.select({
    status: attendance.status
  }).from(attendance).where(eq(attendance.studentId, session.id));

  const totalClasses = attendanceRecords.length;
  const presentClasses = attendanceRecords.filter(a => a.status === 'PRESENT').length;
  const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;
  
  const isDanger = attendancePercentage < 75;
  const isWarning = attendancePercentage >= 75 && attendancePercentage < 80;

  // 3. Fetch latest unread notification
  const [latestNotice] = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, session.id), eq(notifications.isRead, false)))
    .orderBy(desc(notifications.createdAt))
    .limit(1);

  async function markAsRead(formData: FormData) {
    'use server';
    const id = Number(formData.get('id'));
    if (!id) return;
    
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
    revalidatePath('/dashboard');
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        
      {/* Attendance Widget (Spans 2 cols, 2 rows in Bento) */}
      <div className="lg:col-span-2 lg:row-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-500" />
              Attendance Trends
            </h3>
            <select className="bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg outline-none">
              <option>This Semester</option>
            </select>
          </div>
          
          <div className="mt-4 flex items-end gap-6 relative z-10">
            <div className="text-5xl font-black tracking-tight flex items-baseline gap-1 text-slate-900 dark:text-white">
              {attendancePercentage.toFixed(1)}<span className="text-2xl text-slate-400">%</span>
            </div>
            
            <div className={`px-4 py-2 rounded-xl text-sm font-bold ${isDanger ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : isWarning ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 dark:text-emerald-400'}`}>
              {isDanger ? 'Danger' : isWarning ? 'Warning' : 'Safe'}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-600 dark:bg-indigo-500'}`}
              style={{ width: `${Math.min(100, Math.max(0, attendancePercentage))}%` }}
            ></div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Attended</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{presentClasses}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Total Classes</p>
              <p className="text-2xl font-bold text-slate-500 dark:text-slate-400">{totalClasses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts / Notifications (Takes 2 cols) */}
      <div className="lg:col-span-2 bg-indigo-900 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-center">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${latestNotice ? 'bg-rose-400/30' : 'bg-indigo-400/30'}`}>
              {latestNotice ? <BellRing className={`w-4 h-4 ${latestNotice ? 'text-rose-300' : 'text-indigo-300'}`} /> : <BellOff className="w-4 h-4 text-indigo-300" />}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${latestNotice ? 'text-rose-300' : 'text-indigo-300'}`}>
              {latestNotice ? 'New Notice' : 'No New Notices'}
            </span>
          </div>
          
          {latestNotice ? (
            <>
              <h4 className="text-lg font-semibold mb-2">{latestNotice.title}</h4>
              <p className="text-sm text-indigo-100/80 leading-relaxed mb-4 line-clamp-2">
                {latestNotice.message}
              </p>
              <form action={markAsRead}>
                <input type="hidden" name="id" value={latestNotice.id} />
                <button type="submit" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-900 border border-indigo-500 hover:bg-indigo-500 transition-colors w-fit cursor-pointer">
                  Mark as Read
                </button>
              </form>
            </>
          ) : (
            <>
              <h4 className="text-lg font-semibold mb-2">All caught up!</h4>
              <p className="text-sm text-indigo-100/80 leading-relaxed mb-4">
                You have no pending notices. Enjoy your day!
              </p>
            </>
          )}
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-12 translate-x-12"></div>
      </div>

      {/* Quick Links (Takes 1 col, 1 row) */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
        <p className="text-slate-400 text-xs font-bold uppercase mb-4">Quick Links</p>
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            Download Routine (PDF)
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            Request Makeup Class
          </button>
        </div>
      </div>

      {/* Today's Schedule (Spans 4 cols on smaller, maybe 4 on large to sit bottom) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white">Today&apos;s Schedule</h3>
          <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold underline cursor-pointer">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todaysClasses.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 font-medium">No classes scheduled for today! 🎉</p>
            </div>
          ) : (
            (todaysClasses as any[]).map((cls, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 w-12 text-center">
                  {cls.start_time}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{cls.course_name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">{cls.room_name} • {cls.teacher_name}</p>
                </div>
                <div className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                  {cls.course_code}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

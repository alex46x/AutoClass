import { getTeacherSessionsForDate } from '@/app/actions/attendance';
import { getTeacherCoursePosts } from '@/app/actions/cr';
import { Calendar, Bell } from 'lucide-react';
import AttendanceDatePicker from './AttendanceDatePicker';
import SessionCard from './SessionCard';

export default async function TeacherClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = params.date || today;

  const [sessions, coursePosts] = await Promise.all([
    getTeacherSessionsForDate(selectedDate),
    getTeacherCoursePosts(),
  ]);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const selectedDay = dayNames[new Date(selectedDate).getDay()];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Classes & Attendance
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Select a date to view classes and mark attendance.</p>
        </div>
        <AttendanceDatePicker selectedDate={selectedDate} />
      </header>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-lg font-bold text-slate-900 dark:text-white">{selectedDay}</span>
        <span className="text-slate-400 dark:text-slate-500">·</span>
        <span className="font-mono text-sm text-slate-500 dark:text-slate-400">{selectedDate}</span>
        <span className="ml-2 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {coursePosts.length > 0 && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            CR Course Updates
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {coursePosts.map(post => (
              <div key={post.id} className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                    post.type === 'SCHEDULE'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                  }`}>
                    {post.type}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{post.courseCode}</span>
                  <span className="text-xs font-bold text-slate-400">by {post.crName}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{post.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{post.message}</p>
                {post.scheduledDate && (
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-3">
                    {post.scheduledDate} {post.startTime} - {post.endTime}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {sessions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Classes Today</h3>
          <p className="text-slate-500 mt-1">You have no scheduled or makeup classes on this day.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map(session => (
            <SessionCard
              key={`${session.type}-${session.id}`}
              session={session}
              date={selectedDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

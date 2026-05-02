import { getStudentClassPosts } from '@/app/actions/cr';
import { Bell, CalendarDays, Inbox } from 'lucide-react';

export default async function ClassUpdatesPage() {
  const posts = await getStudentClassPosts();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Class Updates
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Notices and schedules shared by your CR.</p>
      </header>

      {posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-14 text-center shadow-sm">
          <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="font-bold text-slate-900 dark:text-white">No updates yet</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">New CR notices and schedules will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <article key={post.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  post.type === 'SCHEDULE'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                }`}>
                  {post.type}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {post.courseCode ? `${post.courseCode} - ${post.courseName}` : 'General class update'}
                </span>
                <span className="text-xs font-bold text-slate-400">by {post.crName}</span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{post.title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{post.message}</p>

              {post.scheduledDate && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                  <CalendarDays className="w-4 h-4 text-amber-500" />
                  {post.scheduledDate} {post.startTime} - {post.endTime}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

import { getCRClassPosts, getCRFormData } from '@/app/actions/cr';
import { Bell, CalendarDays } from 'lucide-react';

import NoticeForm from './NoticeForm';

export default async function NoticesPage() {


  const [{ courses }, posts] = await Promise.all([
    getCRFormData(),
    getCRClassPosts(),
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Notices & Schedules
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Post course notices or class schedules for your section and the course teacher.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <NoticeForm courses={courses} />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Posts</h2>
          {posts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              No notices or schedules posted yet.
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
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
                  {post.scheduledDate && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {post.scheduledDate} {post.startTime} - {post.endTime}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{post.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{post.message}</p>
              </div>
            ))
          )}
        </div>
    </div>
  );
}

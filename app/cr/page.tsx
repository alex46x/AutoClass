import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { Search, CalendarDays, Users, Send } from 'lucide-react';
import Link from 'next/link';

export default async function CRDashboard() {
  const session = await getSession();
  if (!session) return null;

  // Let's get CR's specific duties/courses. Since CR is conceptually just a role in a course or general.
  // We'll show CR tools.
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
      <Link href="/cr/rooms" className="lg:col-span-2 group bg-indigo-900 rounded-3xl p-8 text-white hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-end min-h-[240px]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-30 -translate-y-12 translate-x-12"></div>
         <div className="relative z-10">
          <div className="w-14 h-14 bg-indigo-800/80 rounded-2xl flex items-center justify-center mb-6">
            <Search className="w-7 h-7 text-indigo-300 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-3xl font-black mb-2 tracking-tight">Find Room</h3>
          <p className="text-indigo-200 font-medium text-sm">Search empty classrooms instantly</p>
        </div>
      </Link>
      
      <Link href="/cr/makeup-class" className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-end min-h-[240px]">
        <div className="flex-1">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
            <CalendarDays className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Makeup Class</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Request schedule changes</p>
      </Link>

      <Link href="/cr/roster" className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-end min-h-[240px]">
        <div className="flex-1">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
            <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Class Roster</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">View student details</p>
      </Link>

      <Link href="/cr/notices" className="lg:col-span-2 group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-6">
         <div className="w-16 h-16 shrink-0 bg-rose-100 dark:bg-rose-900/50 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400">
           <Send className="w-8 h-8 group-hover:-rotate-12 transition-transform" />
         </div>
         <div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Send Notice</h3>
           <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Draft and broadcast official messages to your batch.</p>
         </div>
      </Link>

      <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 relative z-10">System Announcements</h2>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 relative z-10">Welcome, Representative</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium relative z-10 leading-relaxed">
          You have special permissions to coordinate with teachers and find resources for your batch. Use the dashboard tools responsibly.
        </p>
      </div>
    </div>
  );
}

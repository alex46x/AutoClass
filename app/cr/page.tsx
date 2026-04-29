import { getCRDashboardStats } from '@/app/actions/cr';
import { Search, CalendarDays, Users, Send, ShieldAlert, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function CRDashboard() {
  const stats = await getCRDashboardStats();

  return (
    <div className="space-y-6">
      {/* Header identity card */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-indigo-300 text-sm font-semibold uppercase tracking-wider mb-1">Class Representative</p>
          <h1 className="text-2xl font-black">{stats.crName}</h1>
          <p className="text-indigo-200 font-medium mt-1">
            Semester {stats.semester} &nbsp;·&nbsp; Section {stats.section}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
            <p className="text-2xl font-black">{stats.classmateCount}</p>
            <p className="text-indigo-200 text-xs font-semibold mt-0.5">Students</p>
          </div>
          {stats.pendingApprovals > 0 && (
            <div className="bg-amber-400/20 border border-amber-400/30 rounded-2xl px-5 py-3 text-center">
              <p className="text-2xl font-black text-amber-300">{stats.pendingApprovals}</p>
              <p className="text-amber-200 text-xs font-semibold mt-0.5">Pending</p>
            </div>
          )}
          {stats.pendingMakeups > 0 && (
            <div className="bg-rose-400/20 border border-rose-400/30 rounded-2xl px-5 py-3 text-center">
              <p className="text-2xl font-black text-rose-300">{stats.pendingMakeups}</p>
              <p className="text-rose-200 text-xs font-semibold mt-0.5">Makeups</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        <Link href="/cr/rooms" className="lg:col-span-2 group bg-indigo-900 rounded-3xl p-8 text-white hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-end min-h-[200px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-30 -translate-y-12 translate-x-12"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-indigo-800/80 rounded-2xl flex items-center justify-center mb-6">
              <Search className="w-7 h-7 text-indigo-300 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-3xl font-black mb-2 tracking-tight">Find Room</h3>
            <p className="text-indigo-200 font-medium text-sm">Search empty classrooms instantly</p>
          </div>
        </Link>

        <Link href="/cr/makeup-class" className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-600 transition-all flex flex-col justify-end min-h-[200px]">
          <div className="flex-1">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
              <CalendarDays className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Makeup Class</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Request schedule changes</p>
        </Link>

        <Link href="/cr/roster" className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all flex flex-col justify-end min-h-[200px] relative">
          {stats.pendingApprovals > 0 && (
            <span className="absolute top-4 right-4 w-6 h-6 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {stats.pendingApprovals}
            </span>
          )}
          <div className="flex-1">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
              <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Class Roster</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">View your {stats.section} section classmates</p>
        </Link>

        <Link href="/cr/notices" className="lg:col-span-2 group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-6 hover:border-rose-300 dark:hover:border-rose-700 transition-all">
          <div className="w-16 h-16 shrink-0 bg-rose-100 dark:bg-rose-900/50 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Send className="w-8 h-8 group-hover:-rotate-12 transition-transform" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Send Notice</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Draft and broadcast official messages to Semester {stats.semester}, Section {stats.section}.</p>
          </div>
        </Link>

        <Link href="/cr/approvals" className="lg:col-span-2 group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-6 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
          <div className="w-16 h-16 shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 relative">
            <ShieldAlert className="w-8 h-8" />
            {stats.pendingApprovals > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {stats.pendingApprovals}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Approve Classmates</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {stats.pendingApprovals > 0
                ? `${stats.pendingApprovals} student(s) waiting for your approval in Section ${stats.section}`
                : `No pending approvals for Section ${stats.section}`}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

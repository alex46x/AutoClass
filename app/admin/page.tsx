import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { 
  Building2, Users, GraduationCap, 
  MapPin, Settings, AlertTriangle, UserCheck
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) return null;

  // Basic stats
  const [stats] = await db.all(sql`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') as total_students,
      (SELECT COUNT(*) FROM users WHERE role = 'TEACHER') as total_teachers,
      (SELECT COUNT(*) FROM departments) as total_departments,
      (SELECT COUNT(*) FROM classrooms) as total_classrooms
  `) as any[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
      {/* Stats Overview */}
      {[
        { label: 'Total Students', value: stats.total_students, icon: GraduationCap, color: 'text-indigo-600', darkColor: 'text-indigo-400', bg: 'bg-indigo-100', darkBg: 'dark:bg-indigo-900/50' },
        { label: 'Faculty Members', value: stats.total_teachers, icon: UserCheck, color: 'text-emerald-600', darkColor: 'text-emerald-400', bg: 'bg-emerald-100', darkBg: 'dark:bg-emerald-900/50' },
        { label: 'Departments', value: stats.total_departments, icon: Building2, color: 'text-rose-600', darkColor: 'text-rose-400', bg: 'bg-rose-100', darkBg: 'dark:bg-rose-900/50' },
        { label: 'Classrooms', value: stats.total_classrooms, icon: MapPin, color: 'text-amber-600', darkColor: 'text-amber-400', bg: 'bg-amber-100', darkBg: 'dark:bg-amber-900/50' },
      ].map((stat, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="relative z-10 flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
            <h3 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{String(stat.value)}</h3>
          </div>
          <div className={`w-12 h-12 ${stat.bg} ${stat.darkBg} rounded-2xl flex items-center justify-center ${stat.color} ${stat.darkColor} relative z-10 transition-transform group-hover:scale-110`}>
            <stat.icon className="w-6 h-6" />
          </div>
        </div>
      ))}

      {/* Quick Config Links */}
      <div className="lg:col-span-2 bg-indigo-900 rounded-3xl p-6 border border-indigo-800 shadow-sm relative overflow-hidden flex flex-col justify-center">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
          <Settings className="w-5 h-5 text-indigo-300" />
          University Management
        </h3>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <Link href="/admin/departments" className="p-4 bg-indigo-800/50 border border-indigo-700/50 rounded-2xl hover:bg-indigo-800 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <Building2 className="w-6 h-6 text-indigo-300 group-hover:text-white transition-colors" />
            <span className="font-semibold text-sm text-indigo-100 group-hover:text-white">Departments</span>
          </Link>
          <Link href="/admin/users" className="p-4 bg-indigo-800/50 border border-indigo-700/50 rounded-2xl hover:bg-indigo-800 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <Users className="w-6 h-6 text-indigo-300 group-hover:text-white transition-colors" />
            <span className="font-semibold text-sm text-indigo-100 group-hover:text-white">Manage Users</span>
          </Link>
          <Link href="/admin/classrooms" className="p-4 bg-indigo-800/50 border border-indigo-700/50 rounded-2xl hover:bg-indigo-800 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <MapPin className="w-6 h-6 text-indigo-300 group-hover:text-white transition-colors" />
            <span className="font-semibold text-sm text-indigo-100 group-hover:text-white">Classrooms</span>
          </Link>
          <Link href="/admin/settings" className="p-4 bg-indigo-800/50 border border-indigo-700/50 rounded-2xl hover:bg-indigo-800 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <Settings className="w-6 h-6 text-indigo-300 group-hover:text-white transition-colors" />
            <span className="font-semibold text-sm text-indigo-100 group-hover:text-white">System Settings</span>
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-12 translate-x-12"></div>
      </div>

      {/* System Alerts */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Pending Approvals
          </h3>
          <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">3 New</span>
        </div>

        <div className="space-y-4 flex-1 flex flex-col justify-center">
          <div className="p-4 border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 rounded-2xl flex justify-between items-center group transition-colors hover:border-amber-300 dark:hover:border-amber-700/50">
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-400 text-sm">Makeup Class Request</p>
              <p className="text-xs font-medium text-amber-700/80 dark:text-amber-500/80 mt-1">CS301 - Requested by Jane Smith</p>
            </div>
            <button className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition shadow-sm">Review</button>
          </div>
          <div className="p-4 border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex justify-between items-center transition-colors hover:border-slate-300 dark:hover:border-slate-600 group">
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-300 text-sm">New Teacher Registration</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Dr. Alice Williams (Mathematics)</p>
            </div>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition shadow-sm">Review</button>
          </div>
        </div>
      </div>
    </div>
  );
}

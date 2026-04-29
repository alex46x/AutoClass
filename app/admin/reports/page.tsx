import { getAdminReportStats } from '@/app/actions/reports';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap
} from 'lucide-react';

export default async function AdminReportsPage() {
  const stats = await getAdminReportStats();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Institutional Reports
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time overview of academic performance and operations.</p>
      </header>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.system.students, icon: GraduationCap, color: 'indigo' },
          { label: 'Total Teachers', value: stats.system.teachers, icon: Users, color: 'emerald' },
          { label: 'Total Courses', value: stats.system.courses, icon: BookOpen, color: 'amber' },
          { label: 'Pending Leaves', value: stats.leaves.pending, icon: Clock, color: 'rose' },
        ].map((item) => (
          <div key={item.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-900/30 flex items-center justify-center mb-4`}>
              <item.icon className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Leaderboard */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Course Attendance
          </h3>
          <div className="space-y-4">
            {stats.attendance.map((course) => (
              <div key={course.courseId} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate pr-4">
                    <span className="text-xs text-slate-400 font-mono mr-2">{course.courseCode}</span>
                    {course.courseName}
                  </span>
                  <span className={`font-bold ${course.avgAttendance >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {course.avgAttendance || 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${course.avgAttendance >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${course.avgAttendance || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade Averages */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Academic Performance
          </h3>
          <div className="space-y-4">
             {stats.grades.length === 0 ? (
               <p className="text-center text-slate-500 py-8">No exam data available yet.</p>
             ) : stats.grades.map((course) => (
              <div key={course.courseId} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{course.courseName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Average Performance</p>
                </div>
                <div className="text-right ml-4">
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{course.avgScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Summary */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-500" />
            Leave Request Statistics
          </h3>
          <div className="flex flex-col md:flex-row gap-8 items-center justify-around">
            {[
              { label: 'Approved', count: stats.leaves.approved, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500' },
              { label: 'Pending', count: stats.leaves.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500' },
              { label: 'Rejected', count: stats.leaves.rejected, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className={`w-24 h-24 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center relative overflow-hidden`}>
                   <div 
                    className={`absolute bottom-0 w-full ${item.bg} opacity-20`}
                    style={{ height: `${(item.count / (stats.leaves.approved + stats.leaves.pending + stats.leaves.rejected || 1)) * 100}%` }}
                   />
                   <span className={`text-2xl font-black ${item.color}`}>{item.count}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

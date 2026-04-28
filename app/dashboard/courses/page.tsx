import { getStudentCourses } from '@/app/actions/student';
import { BookOpen, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

export default async function CoursesPage() {


  const courses = await getStudentCourses();

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 75) return { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2, text: 'Safe' };
    if (percentage >= 60) return { color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertCircle, text: 'Warning' };
    return { color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', icon: XCircle, text: 'Danger' };
  };

  return (
    <div className="space-y-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            My Enrolled Courses
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View your attendance and course performance.</p>
        </header>

        {courses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No courses found</h3>
            <p className="text-slate-500 mt-1">You are not enrolled in any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const status = getAttendanceStatus(course.percentage);
              const StatusIcon = status.icon;

              return (
                <div key={course.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-slate-800 group-hover:bg-indigo-500 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-md mb-2">
                        {course.code}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        {course.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{course.credits} Credits</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Attendance</span>
                      <span className={cn("text-sm font-bold flex items-center gap-1", status.color)}>
                        <StatusIcon className="w-4 h-4" />
                        {course.percentage}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000", status.bg.replace('bg-', 'bg-').replace('-50', '-500'))}
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{course.attendedClasses} Attended</span>
                      <span>{course.totalClasses} Total Classes</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}

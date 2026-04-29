import { getStudentCourses } from '@/app/actions/student';
import { getAvailableCourses } from '@/app/actions/profile';
import { BookOpen, AlertCircle, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnrollButton from './EnrollButton';
import ViewMaterialsButton from './ViewMaterialsButton';

export default async function CoursesPage() {
  const [enrolledCourses, allCourses] = await Promise.all([
    getStudentCourses(),
    getAvailableCourses(),
  ]);

  const unenrolledCourses = allCourses.filter(c => !c.isEnrolled);

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 75) return { color: 'text-emerald-500', barColor: 'bg-emerald-500', icon: CheckCircle2, text: 'Safe' };
    if (percentage >= 60) return { color: 'text-amber-500', barColor: 'bg-amber-500', icon: AlertCircle, text: 'Warning' };
    return { color: 'text-rose-500', barColor: 'bg-rose-500', icon: XCircle, text: 'Danger' };
  };

  return (
    <div className="space-y-10">
      {/* Enrolled Courses */}
      <section>
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            My Enrolled Courses
            <span className="text-sm font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-2.5 py-0.5 rounded-full ml-1">{enrolledCourses.length}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your current courses and attendance performance.</p>
        </header>

        {enrolledCourses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Not enrolled in any courses</h3>
            <p className="text-slate-500 mt-1">Browse available courses below and enroll yourself.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const status = getAttendanceStatus(course.percentage);
              const StatusIcon = status.icon;
              return (
                <div key={course.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-slate-800 group-hover:bg-indigo-500 transition-colors rounded-l-3xl" />

                  <div className="flex justify-between items-start mb-4 pl-2">
                    <div className="flex-1">
                      <span className="inline-block px-2 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg mb-2">
                        {course.code}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{course.name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{course.credits} Credits</p>
                      <div className="mt-3">
                         <ViewMaterialsButton courseId={course.id} courseName={course.name} />
                      </div>
                    </div>
                    <EnrollButton courseId={course.id} isEnrolled={true} />
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 pl-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Attendance</span>
                      <span className={cn('text-sm font-bold flex items-center gap-1', status.color)}>
                        <StatusIcon className="w-4 h-4" />
                        {course.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', status.barColor)}
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{course.attendedClasses} Attended</span>
                      <span>{course.totalClasses} Total</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Available to Enroll */}
      {unenrolledCourses.length > 0 && (
        <section>
          <header className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Available Courses
              <span className="text-sm font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full ml-1">{unenrolledCourses.length}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Browse and self-enroll in available courses.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unenrolledCourses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-6 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg mb-2">
                      {course.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{course.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{course.credits} Credits · {course.departmentName}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <EnrollButton courseId={course.id} isEnrolled={false} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

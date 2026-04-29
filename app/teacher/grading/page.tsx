import { getTeacherCoursesForGrading } from '@/app/actions/grading';
import { BookOpen, ChevronRight, Hash } from 'lucide-react';
import Link from 'next/link';

export default async function TeacherGradingPage() {
  const courses = await getTeacherCoursesForGrading();

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Examination & Grading
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Select a course to manage exams and input student marks.</p>
      </header>

      {courses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Courses Assigned</h3>
          <p className="text-slate-500 mt-1">You are not currently assigned to teach any courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Link 
              key={course.id} 
              href={`/teacher/grading/${course.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full"
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
              
              <div className="relative z-10 flex-1">
                <span className="inline-block px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wider mb-3">
                  {course.code}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {course.name}
                </h3>
                <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
                  <Hash className="w-4 h-4" /> {course.credits} Credits
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                Manage Grades
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { getTeacherClasses } from '@/app/actions/teacher';
import { Calendar as CalendarIcon, Clock, Users, BookOpen, MapPin } from 'lucide-react';

import Link from 'next/link';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default async function TeacherClassesPage() {


  const classes = await getTeacherClasses();

  return (
    <div className="space-y-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            My Classes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage attendance and view your class schedule.</p>
        </header>

        {classes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
            <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No classes assigned</h3>
            <p className="text-slate-500 mt-1">You don't have any classes assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative">
                 <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-slate-800 group-hover:bg-indigo-500 transition-colors" />
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-md mb-2">
                        {cls.course.code}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        {cls.course.name}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      {DAYS[cls.dayOfWeek]}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {cls.startTime} - {cls.endTime}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {cls.classroom.name}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <Link 
                    href={`/teacher/classes/${cls.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Take Attendance
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

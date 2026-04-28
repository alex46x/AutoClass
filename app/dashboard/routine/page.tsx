import { getStudentRoutine } from '@/app/actions/student';
import { Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react';


const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default async function RoutinePage() {


  const routine = await getStudentRoutine();

  // Group by day
  const groupedRoutine = DAYS.map((dayName, index) => {
    return {
      dayName,
      classes: routine
        .filter((r) => r.dayOfWeek === index)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    };
  }).filter(day => day.classes.length > 0);

  return (
    <div className="space-y-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Weekly Class Routine
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your personal schedule for the semester.</p>
        </header>

        {groupedRoutine.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
            <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No classes scheduled</h3>
            <p className="text-slate-500 mt-1">You don't have any classes assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedRoutine.map((day) => (
              <div key={day.dayName} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 px-6 py-4 border-b border-indigo-100 dark:border-indigo-800/30">
                  <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300">
                    {day.dayName}
                  </h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {day.classes.map((cls) => (
                    <div key={cls.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                            {cls.course.code}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                            {cls.course.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {cls.teacher.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {cls.classroom.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-4 py-2 rounded-lg font-medium text-sm self-start md:self-auto border border-indigo-100 dark:border-indigo-800/50">
                        <Clock className="w-4 h-4" />
                        {cls.startTime} - {cls.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

import { getCalendarEvents } from '@/app/actions/calendar';
import CalendarGrid from './CalendarGrid';
import { Calendar as CalendarIcon, Beaker, Clock, Bell } from 'lucide-react';

export default async function CalendarPage() {
  const events = await getCalendarEvents();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Academic Calendar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View your monthly schedule, makeup classes, and upcoming exams.</p>
        </div>
      </header>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-bold">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-full">
          <div className="w-2 h-2 rounded-full bg-indigo-600" /> Regular Class
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full">
          <div className="w-2 h-2 rounded-full bg-amber-500" /> Makeup Class
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 rounded-full">
          <div className="w-2 h-2 rounded-full bg-rose-500" /> Exam
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <CalendarGrid events={events} />
      </div>
    </div>
  );
}

import { getTeacherSessionsForDate } from '@/app/actions/attendance';
import { Calendar, Clock, BookOpen, Beaker } from 'lucide-react';
import AttendanceDatePicker from './AttendanceDatePicker';
import SessionCard from './SessionCard';

export default async function TeacherClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = params.date || today;

  const sessions = await getTeacherSessionsForDate(selectedDate);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const selectedDay = dayNames[new Date(selectedDate).getDay()];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Classes & Attendance
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Select a date to view classes and mark attendance.</p>
        </div>
        <AttendanceDatePicker selectedDate={selectedDate} />
      </header>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-lg font-bold text-slate-900 dark:text-white">{selectedDay}</span>
        <span className="text-slate-400 dark:text-slate-500">·</span>
        <span className="font-mono text-sm text-slate-500 dark:text-slate-400">{selectedDate}</span>
        <span className="ml-2 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Classes Today</h3>
          <p className="text-slate-500 mt-1">You have no scheduled or makeup classes on this day.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map(session => (
            <SessionCard
              key={`${session.type}-${session.id}`}
              session={session}
              date={selectedDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

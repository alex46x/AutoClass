'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Bookmark } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  getDay,
  parseISO
} from 'date-fns';

export default function CalendarGrid({ events }: { events: any }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getEventsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayOfWeek = getDay(day);

    const dayEvents: any[] = [];

    // Add Regular Classes
    events.regular.forEach((e: any) => {
      if (e.dayOfWeek === dayOfWeek) {
        dayEvents.push({ ...e, type: 'REGULAR' });
      }
    });

    // Add Makeup Classes
    events.makeup.forEach((e: any) => {
      if (e.date === dayStr) {
        dayEvents.push({ ...e, type: 'MAKEUP' });
      }
    });

    // Add Exams
    events.exams.forEach((e: any) => {
      if (e.date === dayStr) {
        dayEvents.push({ ...e, type: 'EXAM' });
      }
    });

    // Sort by startTime
    return dayEvents.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col h-full">
      {/* Month Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <h2 className="text-xl font-black text-slate-900 dark:text-white capitalize">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 uppercase tracking-widest">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Week Day Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
        {weekDays.map(day => (
          <div key={day} className="px-2 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="grid grid-cols-7 flex-1">
        {calendarDays.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div 
              key={day.toString()} 
              className={`min-h-[140px] p-2 border-r border-b border-slate-100 dark:border-slate-800 transition-colors ${
                !isCurrentMonth ? 'bg-slate-50/30 dark:bg-slate-900/10' : ''
              } ${isToday ? 'bg-indigo-50/20 dark:bg-indigo-900/5' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-bold flex items-center justify-center w-7 h-7 rounded-full ${
                  isToday 
                    ? 'bg-indigo-600 text-white' 
                    : isCurrentMonth ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-1">
                {dayEvents.map((e: any, eIdx: number) => {
                  let bgColor = 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50';
                  if (e.type === 'MAKEUP') bgColor = 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50';
                  if (e.type === 'EXAM') bgColor = 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50';

                  return (
                    <div 
                      key={`${day.toString()}-${e.type}-${e.id}-${eIdx}`}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold leading-tight truncate flex flex-col gap-0.5 ${bgColor}`}
                      title={`${e.courseName} (${e.startTime})`}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 shrink-0" />
                        {e.startTime}
                      </div>
                      <div className="truncate uppercase tracking-tight">{e.courseCode || (e.type === 'EXAM' ? e.type : '')}</div>
                      <div className="truncate opacity-80">{e.type === 'EXAM' ? e.title : e.courseName}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

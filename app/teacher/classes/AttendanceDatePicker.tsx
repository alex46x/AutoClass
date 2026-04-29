'use client';

import { useRouter } from 'next/navigation';

export default function AttendanceDatePicker({ selectedDate }: { selectedDate: string }) {
  const router = useRouter();

  return (
    <input
      type="date"
      value={selectedDate}
      max={new Date().toISOString().split('T')[0]}
      onChange={(e) => router.push(`/teacher/classes?date=${e.target.value}`)}
      className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
    />
  );
}

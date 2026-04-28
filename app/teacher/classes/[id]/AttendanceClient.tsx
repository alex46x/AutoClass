'use client';

import { useState } from 'react';
import { submitAttendanceAction } from '@/app/actions/attendance';
import { useRouter } from 'next/navigation';
import { Check, X, Clock, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';

type Student = { id: number; name: string; email: string };
type RecordData = { studentId: number; status: 'PRESENT' | 'ABSENT' | 'LATE' };

export default function AttendanceClient({ 
  students, 
  scheduleId, 
  courseId, 
  date, 
  initialRecords 
}: { 
  students: Student[], 
  scheduleId: number, 
  courseId: number, 
  date: string, 
  initialRecords: RecordData[]
}) {
  const router = useRouter();
  const [records, setRecords] = useState<Record<number, 'PRESENT' | 'ABSENT' | 'LATE'>>(() => {
    const initial: Record<number, any> = {};
    // Give everyone present by default to speed things up, unless already marked
    students.forEach(s => {
      const match = initialRecords.find(r => r.studentId === s.id);
      initial[s.id] = match ? match.status : 'PRESENT';
    });
    return initial;
  });

  const [loading, setLoading] = useState(false);

  const handleSetStatus = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setLoading(true);
    const dataToSave = Object.entries(records).map(([id, status]) => ({
      studentId: parseInt(id),
      status
    }));

    try {
      await submitAttendanceAction(scheduleId, courseId, date, dataToSave);
      router.push('/teacher');
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Total Students: <strong>{students.length}</strong>
        </p>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>

      <div className="space-y-3">
        {students.map((student) => {
          const currentStatus = records[student.id];

          return (
            <motion.div 
              layout
              key={student.id} 
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-2xl transition-colors
                ${currentStatus === 'PRESENT' ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/50' : ''}
                ${currentStatus === 'ABSENT' ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/50' : ''}
                ${currentStatus === 'LATE' ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/50' : ''}
                ${!currentStatus ? 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800' : ''}
              `}
            >
              <div className="mb-4 sm:mb-0">
                <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{student.email}</p>
              </div>

              <div className="flex bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1">
                <button
                  onClick={() => handleSetStatus(student.id, 'PRESENT')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    currentStatus === 'PRESENT' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' 
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  <Check className="w-4 h-4" /> Present
                </button>
                <button
                  onClick={() => handleSetStatus(student.id, 'LATE')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    currentStatus === 'LATE' 
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' 
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  <Clock className="w-4 h-4" /> Late
                </button>
                <button
                  onClick={() => handleSetStatus(student.id, 'ABSENT')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    currentStatus === 'ABSENT' 
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400' 
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  <X className="w-4 h-4" /> Absent
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

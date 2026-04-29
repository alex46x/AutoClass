'use client';

import { useState } from 'react';
import { saveGrades } from '@/app/actions/grading';
import { Save, FileSpreadsheet } from 'lucide-react';
import ExportButton from '@/components/ExportButton';

export default function GradingSheet({ exam, students }: { exam: any, students: any[] }) {
  const [grades, setGrades] = useState<Record<number, string>>(
    students.reduce((acc, s) => ({ ...acc, [s.id]: s.marksObtained !== null ? String(s.marksObtained) : '' }), {})
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleGradeChange = (studentId: number, value: string) => {
    // Basic validation to prevent exceeding max marks
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue <= exam.maxMarks) {
      setGrades({ ...grades, [studentId]: value });
      setIsDirty(true);
    } else if (value === '') {
      setGrades({ ...grades, [studentId]: '' });
      setIsDirty(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(grades)
        .filter(([_, val]) => val !== '')
        .map(([id, val]) => ({
          studentId: Number(id),
          marksObtained: Number(val)
        }));

      await saveGrades(exam.id, updates);
      setIsDirty(false);
    } catch (e) {
      alert('Failed to save grades');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {exam.title}
              <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded uppercase font-bold text-slate-600 dark:text-slate-300">
                {exam.type}
              </span>
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Max Marks: {exam.maxMarks}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ExportButton 
            data={students.map(s => ({
              Roll: s.roll || '-',
              StudentID: s.studentId || '-',
              Name: s.name,
              Marks: grades[s.id] || '0'
            }))}
            filename={`Grades_${exam.title}`}
          />
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Grades'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold w-24">Roll</th>
              <th className="px-6 py-4 font-semibold">Student ID</th>
              <th className="px-6 py-4 font-semibold">Student Name</th>
              <th className="px-6 py-4 font-semibold text-right w-48">Marks Obtained</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-3 font-mono font-bold text-slate-900 dark:text-white">
                  {student.roll || '-'}
                </td>
                <td className="px-6 py-3 font-mono text-slate-600 dark:text-slate-400">
                  {student.studentId || '-'}
                </td>
                <td className="px-6 py-3 font-semibold text-slate-900 dark:text-white">
                  {student.name}
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <input
                      type="number"
                      min="0"
                      max={exam.maxMarks}
                      step="0.5"
                      value={grades[student.id]}
                      onChange={(e) => handleGradeChange(student.id, e.target.value)}
                      className={`w-24 px-3 py-1.5 border rounded-lg text-right font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${
                        grades[student.id] ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      placeholder="-"
                    />
                    <span className="text-slate-400 font-medium">/ {exam.maxMarks}</span>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  No students enrolled in this course yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

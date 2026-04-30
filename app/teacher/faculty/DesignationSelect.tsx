'use client';

import { useState } from 'react';
import { updateTeacherDesignation } from '@/app/actions/head';
import { Loader2 } from 'lucide-react';

const DESIGNATIONS = [
  'Lecturer',
  'Senior Lecturer',
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Visiting Professor',
  'Adjunct Faculty',
];

export default function DesignationSelect({ teacherId, currentDesignation }: { teacherId: number, currentDesignation: string }) {
  const [loading, setLoading] = useState(false);
  const [designation, setDesignation] = useState(currentDesignation);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDesignation = e.target.value;
    setDesignation(newDesignation);
    setLoading(true);
    try {
      await updateTeacherDesignation(teacherId, newDesignation);
    } catch (err: any) {
      alert(err.message || 'Failed to update designation');
      setDesignation(currentDesignation); // Revert on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block w-48">
      <select
        value={designation}
        onChange={handleChange}
        disabled={loading}
        className="block w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-3 pr-8 rounded-lg text-xs leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 disabled:opacity-50"
      >
        {DESIGNATIONS.map((desig) => (
          <option key={desig} value={desig}>
            {desig}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
        ) : (
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        )}
      </div>
    </div>
  );
}

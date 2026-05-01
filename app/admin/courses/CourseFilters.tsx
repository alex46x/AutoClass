'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function CourseFilters({ departments }: { departments: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 flex items-center gap-4 shadow-sm">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Filter by:</span>
      
      <select 
        value={searchParams.get('departmentId') || ''}
        onChange={e => handleFilter('departmentId', e.target.value)}
        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 outline-none"
      >
        <option value="">All Departments</option>
        {departments.map(d => (
          <option key={d.id} value={d.id.toString()}>{d.name}</option>
        ))}
      </select>
    </div>
  );
}

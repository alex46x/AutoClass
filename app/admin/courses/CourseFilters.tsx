'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import GlassSelect from '@/components/GlassSelect';

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
      
      <GlassSelect
        value={searchParams.get('departmentId') || ''}
        onChange={e => handleFilter('departmentId', e.target.value)}
        className="min-w-56"
      >
        <option value="">All Departments</option>
        {departments.map(d => (
          <option key={d.id} value={d.id.toString()}>{d.name}</option>
        ))}
      </GlassSelect>
    </div>
  );
}

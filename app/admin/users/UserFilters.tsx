'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export default function UserFilters({ 
  departments, 
  semesters, 
  sections 
}: { 
  departments: any[], 
  semesters: any[], 
  sections: any[] 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') || '');
  const [departmentId, setDepartmentId] = useState(searchParams.get('departmentId') || '');
  const [semesterId, setSemesterId] = useState(searchParams.get('semesterId') || '');
  const [sectionId, setSectionId] = useState(searchParams.get('sectionId') || '');

  const applyFilters = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    if (key === 'departmentId' && value !== departmentId) {
      params.delete('semesterId');
      params.delete('sectionId');
      setSemesterId('');
      setSectionId('');
    }

    // Reset section if semester changes
    if (key === 'semesterId' && value !== semesterId) {
      params.delete('sectionId');
      setSectionId('');
    }

    router.push(`?${params.toString()}`);
  }, [searchParams, router, departmentId, semesterId]);

  const activeDepartmentId = departmentId ? parseInt(departmentId) : null;
  const activeSemesterId = semesterId ? parseInt(semesterId) : null;
  const availableSemesters = activeDepartmentId
    ? semesters.filter(s => s.departmentId === activeDepartmentId)
    : semesters;
  const availableSections = sections.filter(s => {
    if (activeDepartmentId && s.departmentId !== activeDepartmentId) return false;
    if (activeSemesterId && s.semesterId !== activeSemesterId) return false;
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role</label>
        <select 
          value={role}
          onChange={(e) => { setRole(e.target.value); applyFilters('role', e.target.value); }}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
          <option value="HEAD">Department Head</option>
          <option value="CR">CR</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</label>
        <select 
          value={departmentId}
          onChange={(e) => { setDepartmentId(e.target.value); applyFilters('departmentId', e.target.value); }}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Semester</label>
        <select 
          value={semesterId}
          onChange={(e) => { setSemesterId(e.target.value); applyFilters('semesterId', e.target.value); }}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Semesters</option>
          {availableSemesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Section</label>
        <select 
          value={sectionId}
          onChange={(e) => { setSectionId(e.target.value); applyFilters('sectionId', e.target.value); }}
          disabled={!departmentId && !semesterId}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <option value="">All Sections</option>
          {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
    </div>
  );
}

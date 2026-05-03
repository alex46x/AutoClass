'use client';

import { useState } from 'react';
import { updateUser } from '@/app/actions/admin';
import { getUserCourseIds } from '@/app/actions/admin';
import { Edit2, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import GlassSelect from '@/components/GlassSelect';

export default function EditUserModal({ 
  user,
  departments,
  semesters,
  sections 
  , courses
}: { 
  user: any;
  departments: any[];
  semesters: any[];
  sections: any[];
  courses: any[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [uniqueId, setUniqueId] = useState(user.uniqueId || '');
  const [role, setRole] = useState(user.role);
  const [departmentId, setDepartmentId] = useState(user.departmentId?.toString() || '');
  const [semesterId, setSemesterId] = useState(user.semesterId?.toString() || '');
  const [sectionId, setSectionId] = useState(user.sectionId?.toString() || '');
  const [studentId, setStudentId] = useState(user.studentId || '');
  const [roll, setRoll] = useState(user.roll || '');
  const [designation, setDesignation] = useState(user.designation || 'Lecturer');
  const [courseIds, setCourseIds] = useState<number[]>([]);
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
  const availableCourses = activeDepartmentId
    ? courses.filter(course => course.departmentId === activeDepartmentId)
    : courses;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(user.id, {
        name,
        email,
        uniqueId,
        role,
        departmentId: departmentId ? parseInt(departmentId) : null,
        semesterId: semesterId ? parseInt(semesterId) : null,
        sectionId: sectionId ? parseInt(sectionId) : null,
        studentId: studentId || null,
        roll: roll || null,
        designation: designation || null,
        courseIds: role === 'STUDENT' || role === 'CR' ? courseIds : undefined,
      });
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={async () => {
          setIsOpen(true);
          if (user.role === 'STUDENT' || user.role === 'CR') {
            setCourseIds(await getUserCourseIds(user.id));
          }
        }}
        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        title="Edit User"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit User</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Unique Login ID</label>
                  <input type="text" required value={uniqueId} onChange={e => setUniqueId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <GlassSelect value={role} onChange={e => setRole(e.target.value)} disabled={user.role === 'CR'} className="w-full">
                    <option value="STUDENT">Student</option>
                    {user.role === 'CR' && (
                      <option value="CR">Class Representative (Dept. Head managed)</option>
                    )}
                    <option value="TEACHER">Teacher</option>
                    <option value="HEAD">Department Head</option>
                    <option value="ADMIN">System Admin</option>
                  </GlassSelect>
                </div>

                {role !== 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <GlassSelect value={departmentId} onChange={e => { setDepartmentId(e.target.value); setSemesterId(''); setSectionId(''); }} className="w-full">
                      <option value="">No Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </GlassSelect>
                  </div>
                )}

                {(role === 'TEACHER' || role === 'HEAD') && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Teacher Designation</label>
                    <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  </div>
                )}

                {(role === 'STUDENT' || role === 'CR') && (
                  <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Student ID</label>
                      <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Roll</label>
                      <input type="text" value={roll} onChange={e => setRoll(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                      <GlassSelect value={semesterId} onChange={e => { setSemesterId(e.target.value); setSectionId(''); }} className="w-full">
                        <option value="">None</option>
                        {availableSemesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </GlassSelect>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Section</label>
                      <GlassSelect value={sectionId} onChange={e => setSectionId(e.target.value)} className="w-full">
                        <option value="">None</option>
                        {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </GlassSelect>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Course Enrollment</label>
                    <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                      {availableCourses.map(course => (
                        <label key={course.id} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={courseIds.includes(course.id)}
                            onChange={e => {
                              setCourseIds(prev => e.target.checked
                                ? [...prev, course.id]
                                : prev.filter(id => id !== course.id));
                            }}
                          />
                          <span className="font-mono text-xs">{course.code}</span>
                          <span>{course.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  </>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-slate-500 font-medium text-sm">Cancel</button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 text-sm disabled:opacity-50">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

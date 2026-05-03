'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createUser } from '@/app/actions/admin';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import GlassSelect from '@/components/GlassSelect';

export default function AddUserForm({ departments, semesters, sections }: { departments: any[], semesters: any[], sections: any[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    uniqueId: '',
    role: 'TEACHER',
    departmentId: '',
    semesterId: '',
    sectionId: '',
    studentId: '',
    roll: '',
    designation: 'Lecturer'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        uniqueId: formData.uniqueId,
        role: formData.role,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : undefined,
        semesterId: formData.semesterId ? parseInt(formData.semesterId) : undefined,
        sectionId: formData.sectionId ? parseInt(formData.sectionId) : undefined,
        studentId: formData.studentId,
        roll: formData.roll,
        designation: formData.designation,
      });
      setIsOpen(false);
      setFormData({ name: '', email: '', uniqueId: '', role: 'TEACHER', departmentId: '', semesterId: '', sectionId: '', studentId: '', roll: '', designation: 'Lecturer' });
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const activeDepartmentId = formData.departmentId ? parseInt(formData.departmentId) : null;
  const activeSemesterId = formData.semesterId ? parseInt(formData.semesterId) : null;
  const availableSemesters = activeDepartmentId
    ? semesters.filter(s => s.departmentId === activeDepartmentId)
    : semesters;
  const availableSections = sections.filter(s => {
    if (activeDepartmentId && s.departmentId !== activeDepartmentId) return false;
    if (activeSemesterId && s.semesterId !== activeSemesterId) return false;
    return true;
  });

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-colors"
      >
        <Plus className="w-4 h-4" /> Add User
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New User</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="john@university.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unique Login ID</label>
                  <input
                    type="text"
                    value={formData.uniqueId}
                    onChange={(e) => setFormData({...formData, uniqueId: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="teacher-24-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">System Role</label>
                  <GlassSelect
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="CR">Class Representative (CR)</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="HEAD">Department Head</option>
                  </GlassSelect>
                </div>

                {formData.role !== 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                      <GlassSelect
                      value={formData.departmentId}
                      onChange={(e) => setFormData({...formData, departmentId: e.target.value, semesterId: '', sectionId: ''})}
                      className="w-full"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </GlassSelect>
                  </div>
                )}

                {(formData.role === 'TEACHER' || formData.role === 'HEAD') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teacher Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Lecturer"
                    />
                  </div>
                )}

                {(formData.role === 'STUDENT' || formData.role === 'CR') && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student ID</label>
                        <input
                          type="text"
                          value={formData.studentId}
                          onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Roll</label>
                        <input
                          type="text"
                          value={formData.roll}
                          onChange={(e) => setFormData({...formData, roll: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                      <GlassSelect
                        value={formData.semesterId}
                        onChange={(e) => setFormData({...formData, semesterId: e.target.value, sectionId: ''})}
                        className="w-full"
                      >
                        <option value="">Select Semester</option>
                        {availableSemesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </GlassSelect>
                    </div>

                    {formData.semesterId && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
                        <GlassSelect
                          value={formData.sectionId}
                          onChange={(e) => setFormData({...formData, sectionId: e.target.value})}
                          className="w-full"
                        >
                          <option value="">Select Section</option>
                          {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </GlassSelect>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-70"
                  >
                    {loading ? 'Creating...' : 'Create User'}
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

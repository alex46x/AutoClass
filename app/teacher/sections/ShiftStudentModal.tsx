'use client';

import { useState } from 'react';
import { ArrowRightLeft, X, User } from 'lucide-react';
import { shiftStudentSection } from '@/app/actions/head';
import { motion, AnimatePresence } from 'framer-motion';

type Section = { id: number; name: string };

export default function ShiftStudentModal({ 
  studentId, 
  studentName, 
  currentSectionId, 
  sections 
}: { 
  studentId: number; 
  studentName: string; 
  currentSectionId: number | null; 
  sections: (Section & { semesterName?: string })[] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSectionId, setNewSectionId] = useState<string>(currentSectionId ? currentSectionId.toString() : 'unassigned');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedId = newSectionId === 'unassigned' ? null : parseInt(newSectionId, 10);
      await shiftStudentSection(studentId, parsedId);
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to shift student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
        title="Shift Student"
      >
        <ArrowRightLeft className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-500" /> Shift Student
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{studentName}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-4 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign to Section</label>
                  <select
                    value={newSectionId}
                    onChange={(e) => setNewSectionId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="unassigned">Unassigned (No Section)</option>
                    {sections.map(sec => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name} {sec.semesterName ? `(${sec.semesterName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (newSectionId === (currentSectionId ? currentSectionId.toString() : 'unassigned'))}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 text-sm"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
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

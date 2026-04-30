'use client';

import { useState } from 'react';
import { UserX, X } from 'lucide-react';
import { removeStudentFromDepartment } from '@/app/actions/head';
import { motion, AnimatePresence } from 'framer-motion';

export default function RemoveStudentModal({ studentId, studentName }: { studentId: number; studentName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await removeStudentFromDepartment(studentId, reason);
      setIsOpen(false);
      setReason('');
      alert(`Removal request for ${studentName} submitted. It is pending Admin approval.`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit removal request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 dark:border-rose-800/50 text-xs font-bold transition-colors"
      >
        <UserX className="w-3.5 h-3.5" /> Request Removal
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserX className="w-5 h-5 text-rose-500" /> Request Student Removal
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Submit a removal request for <strong className="text-rose-600 dark:text-rose-400">{studentName}</strong>. This requires Admin approval.
                  </p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-4 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Reason for Removal <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500 resize-none text-sm"
                    placeholder="Provide a detailed reason for the removal request..."
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
                  >
                    <UserX className="w-4 h-4" />
                    {loading ? 'Submitting...' : 'Submit Request'}
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

'use client';

import { useState } from 'react';
import { requestStudentRemoval } from '@/app/actions/cr';
import { UserX, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RemovalRequestButton({ student }: { student: { id: number; name: string; email: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 20) {
      setError('Please provide a detailed reason (at least 20 characters).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await requestStudentRemoval(student.id, reason);
      setDone(true);
      setTimeout(() => { setIsOpen(false); setDone(false); setReason(''); }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
        title="Request Removal"
      >
        <UserX className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Request Removal
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
                <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">{student.name}</p>
                <p className="text-xs text-rose-600 dark:text-rose-400">{student.email}</p>
              </div>

              {done ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">Request Submitted!</p>
                  <p className="text-sm text-slate-500 mt-1">The admin will review your request.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Reason for Removal <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder="Provide a detailed explanation for your removal request..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500 resize-none text-sm"
                    />
                    <p className="text-xs text-slate-400 mt-1">{reason.length} / 20 chars minimum</p>
                  </div>

                  {error && (
                    <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg">{error}</p>
                  )}

                  <p className="text-xs text-slate-500 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-2 rounded-lg">
                    ⚠️ This request will be reviewed by the Admin. The student will only be removed if the Admin approves.
                  </p>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-70">
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

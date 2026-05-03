'use client';

import { useState } from 'react';
import { submitLeaveRequest } from '@/app/actions/leave';
import { Send, CalendarRange } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassDatePicker from '@/components/GlassDatePicker';

export default function SubmitLeaveForm() {
  const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (formData.endDate < formData.startDate) {
      setError('End date cannot be before start date.');
      setLoading(false);
      return;
    }

    try {
      await submitLeaveRequest(formData.startDate, formData.endDate, formData.reason);
      setSuccess(true);
      setFormData({ startDate: '', endDate: '', reason: '' });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <CalendarRange className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        Apply for Leave
      </h2>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-semibold text-center"
          >
            ✓ Your leave request has been submitted and is awaiting approval.
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-xl text-sm font-semibold text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
            <GlassDatePicker
              required
              value={formData.startDate}
              onChange={(startDate) => setFormData({ ...formData, startDate })}
              placeholder="Start date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
            <GlassDatePicker
              required
              value={formData.endDate}
              min={formData.startDate}
              onChange={(endDate) => setFormData({ ...formData, endDate })}
              placeholder="End date"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason for Leave</label>
          <textarea
            required
            rows={3}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium resize-none"
            placeholder="Please describe your reason for leave (e.g., Medical appointment, Family emergency)..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

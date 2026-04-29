'use client';

import { useState } from 'react';
import { updateLeaveStatus } from '@/app/actions/leave';
import { Check, X } from 'lucide-react';

export default function LeaveApprovalButtons({ requestId }: { requestId: number }) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'APPROVED' | 'REJECTED' | null>(null);

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (status === 'REJECTED' && !showNote) {
      setPendingStatus(status);
      setShowNote(true);
      return;
    }
    setLoading(true);
    try {
      await updateLeaveStatus(requestId, status, note || undefined);
    } catch (e) {
      alert('Failed to update leave status');
      setLoading(false);
    }
  };

  if (showNote) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note for the student..."
          className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
        />
        <div className="flex gap-2">
          <button
            disabled={loading}
            onClick={() => handleAction(pendingStatus!)}
            className="flex-1 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <X className="w-3 h-3" /> {loading ? 'Saving...' : 'Confirm Rejection'}
          </button>
          <button
            onClick={() => setShowNote(false)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <button
        disabled={loading}
        onClick={() => handleAction('APPROVED')}
        className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        <Check className="w-3 h-3" /> Approve
      </button>
      <button
        disabled={loading}
        onClick={() => handleAction('REJECTED')}
        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        <X className="w-3 h-3" /> Reject
      </button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { updateMakeupStatus } from '@/app/actions/admin';
import { Check, X } from 'lucide-react';

export default function ApprovalButtons({ requestId }: { requestId: number }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    try {
      await updateMakeupStatus(requestId, status);
    } catch (e) {
      alert('Failed to update status');
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
      <button 
        disabled={loading}
        onClick={() => handleAction('REJECTED')}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 rounded-xl font-medium transition-colors disabled:opacity-50"
      >
        <X className="w-4 h-4" /> Reject
      </button>
      <button 
        disabled={loading}
        onClick={() => handleAction('APPROVED')}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50"
      >
        <Check className="w-4 h-4" /> Approve
      </button>
    </div>
  );
}

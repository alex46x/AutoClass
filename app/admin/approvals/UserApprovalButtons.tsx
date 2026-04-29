'use client';

import { useState } from 'react';
import { updateUserStatus } from '@/app/actions/admin';
import { Check, X } from 'lucide-react';

export default function UserApprovalButtons({ userId }: { userId: number }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: 'ACTIVE' | 'REJECTED') => {
    setLoading(true);
    try {
      await updateUserStatus(userId, status);
    } catch (e) {
      alert('Failed to update user status');
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button 
        disabled={loading}
        onClick={() => handleAction('ACTIVE')}
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

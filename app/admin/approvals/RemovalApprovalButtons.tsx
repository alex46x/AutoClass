'use client';

import { useState } from 'react';
import { resolveStudentRemovalRequest } from '@/app/actions/admin';
import { CheckCircle, XCircle } from 'lucide-react';

export default function RemovalApprovalButtons({ requestId }: { requestId: number }) {
  const [loading, setLoading] = useState(false);

  const handle = async (approve: boolean) => {
    setLoading(true);
    try {
      await resolveStudentRemovalRequest(requestId, approve);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <button
        disabled={loading}
        onClick={() => handle(true)}
        className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-70"
      >
        <CheckCircle className="w-4 h-4" /> Approve & Remove
      </button>
      <button
        disabled={loading}
        onClick={() => handle(false)}
        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors disabled:opacity-70"
      >
        <XCircle className="w-4 h-4" /> Reject
      </button>
    </div>
  );
}

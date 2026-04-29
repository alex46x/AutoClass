'use client';

import { useState } from 'react';
import { markAllRead } from '@/app/actions/notifications';
import { CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MarkAllReadButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    await markAllRead();
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl transition-colors disabled:opacity-60"
    >
      <CheckCheck className="w-4 h-4" />
      {loading ? 'Marking...' : 'Mark all as read'}
    </button>
  );
}

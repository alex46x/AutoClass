'use client';

import { votePoll } from '@/app/actions/cr';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PollVoteButton({ pollId, optionId, selected }: { pollId: number; optionId: number; selected: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      disabled={loading || selected}
      onClick={async () => {
        setLoading(true);
        try {
          await votePoll(pollId, optionId);
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
        selected
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600'
      } disabled:opacity-80`}
    >
      {selected && <Check className="w-3.5 h-3.5" />}
      {loading ? 'Saving...' : selected ? 'Voted' : 'Vote'}
    </button>
  );
}

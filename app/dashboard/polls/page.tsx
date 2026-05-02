import { getClassPolls } from '@/app/actions/cr';
import { BarChart3 } from 'lucide-react';
import PollVoteButton from './PollVoteButton';

export default async function ClassPollsPage() {
  const polls = await getClassPolls();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Class Polls
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Vote on class polls shared by your CR.</p>
      </header>

      {polls.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 shadow-sm">
          No polls are available for your class yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {polls.map(poll => {
            const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
            return (
              <div key={poll.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {poll.courseCode || 'GENERAL'}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${poll.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}>{poll.status}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{poll.title}</h2>
                {poll.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{poll.description}</p>}

                <div className="mt-5 space-y-3">
                  {poll.options.map(option => {
                    const pct = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
                    const selected = poll.myOptionId === option.id;
                    return (
                      <div key={option.id} className={`rounded-2xl border p-3 ${selected ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800'}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{option.text}</p>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">{option.votes} vote{option.votes !== 1 ? 's' : ''} - {pct}%</p>
                          </div>
                          {poll.status === 'OPEN' && (
                            <PollVoteButton pollId={poll.id} optionId={option.id} selected={selected} />
                          )}
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-3">
                          <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

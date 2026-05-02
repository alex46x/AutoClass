import { getCRFormData, getPollsForCR } from '@/app/actions/cr';
import { BarChart3 } from 'lucide-react';
import PollManager from './PollManager';

export default async function CRPollsPage() {
  const [{ courses }, polls] = await Promise.all([
    getCRFormData(),
    getPollsForCR(),
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Class Polls
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Collect opinions from classmates by course, then tune options while the poll is open.</p>
      </header>

      <PollManager courses={courses} polls={polls} />
    </div>
  );
}

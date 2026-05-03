'use client';

import { useState } from 'react';
import { addPollOption, createPoll, removePollOption, setPollStatus } from '@/app/actions/cr';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GlassSelect from '@/components/GlassSelect';

type Course = { id: number; name: string; code: string };
type Poll = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  courseName: string | null;
  courseCode: string | null;
  options: { id: number; text: string; votes: number }[];
};

export default function PollManager({ courses, polls }: { courses: Course[]; polls: Poll[] }) {
  const router = useRouter();
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [newOptionText, setNewOptionText] = useState<Record<number, string>>({});

  const refresh = () => router.refresh();

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await createPoll({
        courseId: Number(formData.get('courseId')),
        title: String(formData.get('title') || ''),
        description: String(formData.get('description') || ''),
        options,
      });
      form.reset();
      setOptions(['', '']);
      refresh();
    } finally {
      setLoading(false);
    }
  };

  const totalVotes = (poll: Poll) => poll.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
      <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Topic Scope</label>
          <GlassSelect name="courseId" required className="w-full">
            <option value="0">General class topic</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
            ))}
          </GlassSelect>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Use a general poll for decisions like class timing, events, or group choices.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Question</label>
          <input name="title" required placeholder="e.g., Which topic needs revision?" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Context</label>
          <textarea name="description" rows={3} placeholder="Optional details for classmates" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Options</label>
            <button type="button" onClick={() => setOptions(prev => [...prev, ''])} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={option}
                onChange={event => setOptions(prev => prev.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                required={index < 2}
                placeholder={`Option ${index + 1}`}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {options.length > 2 && (
                <button type="button" onClick={() => setOptions(prev => prev.filter((_, itemIndex) => itemIndex !== index))} className="w-10 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-900/20">
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70">
          {loading ? 'Creating...' : 'Create Poll'}
        </button>
      </form>

      <div className="space-y-4">
        {polls.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center text-slate-500">
            No polls yet.
          </div>
        ) : (
          polls.map(poll => {
            const votes = totalVotes(poll);
            return (
              <div key={poll.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                        {poll.courseCode || 'GENERAL'}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${poll.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}>{poll.status}</span>
                    </div>
                    <h2 className="font-bold text-slate-900 dark:text-white">{poll.title}</h2>
                    {poll.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{poll.description}</p>}
                  </div>
                  <button
                    onClick={async () => {
                      await setPollStatus(poll.id, poll.status === 'OPEN' ? 'CLOSED' : 'OPEN');
                      refresh();
                    }}
                    className="shrink-0 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    {poll.status === 'OPEN' ? 'Close' : 'Reopen'}
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {poll.options.map(option => {
                    const pct = votes === 0 ? 0 : Math.round((option.votes / votes) * 100);
                    return (
                      <div key={option.id} className="space-y-1">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{option.text}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-500">{option.votes} vote{option.votes !== 1 ? 's' : ''}</span>
                            {poll.status === 'OPEN' && poll.options.length > 2 && (
                              <button
                                onClick={async () => {
                                  await removePollOption(option.id);
                                  refresh();
                                }}
                                className="text-rose-500 hover:text-rose-600"
                                aria-label="Remove option"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {poll.status === 'OPEN' && (
                  <form
                    className="mt-5 flex gap-2"
                    onSubmit={async event => {
                      event.preventDefault();
                      const text = newOptionText[poll.id] || '';
                      await addPollOption(poll.id, text);
                      setNewOptionText(prev => ({ ...prev, [poll.id]: '' }));
                      refresh();
                    }}
                  >
                    <input
                      value={newOptionText[poll.id] || ''}
                      onChange={event => setNewOptionText(prev => ({ ...prev, [poll.id]: event.target.value }))}
                      placeholder="Add another option"
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">Add</button>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

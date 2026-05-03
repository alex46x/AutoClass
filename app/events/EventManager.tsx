'use client';

import { createEvent, EventScope, EventView, setEventStatus } from '@/app/actions/events';
import { CalendarClock, MapPin, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import GlassDatePicker from '@/components/GlassDatePicker';
import GlassSelect from '@/components/GlassSelect';
import GlassTimePicker from '@/components/GlassTimePicker';

const scopeCopy: Record<EventScope, { title: string; subtitle: string; audience: string }> = {
  CLASS: {
    title: 'Class Events',
    subtitle: 'Host events for your own semester and section.',
    audience: 'Your class',
  },
  DEPARTMENT: {
    title: 'Department Events',
    subtitle: 'Host events for students and faculty in your department.',
    audience: 'Your department',
  },
  UNIVERSITY: {
    title: 'University Events',
    subtitle: 'Host events for everyone in the university.',
    audience: 'Whole university',
  },
};

const categories = ['General', 'Academic', 'Seminar', 'Workshop', 'Cultural', 'Sports', 'Career'];

function formatDate(date: string, time: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(`${date}T${time}`));
}

export default function EventManager({ scope, events }: { scope: EventScope; events: EventView[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const copy = scopeCopy[scope];

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await createEvent(scope, {
        title: String(formData.get('title') || ''),
        description: String(formData.get('description') || ''),
        location: String(formData.get('location') || ''),
        coverImage: String(formData.get('coverImage') || ''),
        category: String(formData.get('category') || ''),
        startDate: String(formData.get('startDate') || ''),
        startTime: String(formData.get('startTime') || ''),
        endDate: String(formData.get('endDate') || ''),
        endTime: String(formData.get('endTime') || ''),
      });
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{copy.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{copy.subtitle}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Users className="h-4 w-4" />
          {copy.audience}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300 flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Create Event</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Invite your scoped audience automatically.</p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Event Name</label>
            <input name="title" required placeholder="e.g., Batch Iftar Meetup" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Details</label>
            <textarea name="description" required rows={4} placeholder="What should attendees know?" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
              <GlassSelect name="category" className="w-full">
                {categories.map(category => <option key={category} value={category}>{category}</option>)}
              </GlassSelect>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
              <input name="location" required placeholder="Auditorium" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
              <GlassDatePicker name="startDate" required placeholder="Start date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Time</label>
              <GlassTimePicker name="startTime" required placeholder="Start time" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Date</label>
              <GlassDatePicker name="endDate" placeholder="End date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Time</label>
              <GlassTimePicker name="endTime" placeholder="End time" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cover Image URL</label>
            <input name="coverImage" type="url" placeholder="Optional image link" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70">
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center text-slate-500 shadow-sm">
              No hosted events yet.
            </div>
          ) : (
            events.map(item => (
              <article key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                {item.coverImage ? (
                  <img src={item.coverImage} alt="" className="h-44 w-full object-cover bg-slate-100 dark:bg-slate-800" />
                ) : (
                  <div className="h-32 bg-slate-900 dark:bg-slate-800 flex items-center px-6">
                    <CalendarClock className="h-10 w-10 text-indigo-300" />
                  </div>
                )}
                <div className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">{item.category}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${item.status === 'SCHEDULED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'}`}>{item.status}</span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">{item.title}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
                    </div>
                    <button
                      onClick={async () => {
                        await setEventStatus(item.id, item.status === 'SCHEDULED' ? 'CANCELLED' : 'SCHEDULED');
                        router.refresh();
                      }}
                      className="shrink-0 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      {item.status === 'SCHEDULED' ? 'Cancel' : 'Reopen'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <CalendarClock className="h-4 w-4 text-indigo-500" />
                      <span className="font-semibold">{formatDate(item.startDate, item.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="h-4 w-4 text-rose-500" />
                      <span className="font-semibold">{item.location}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2 text-center">
                      <p className="text-lg font-black text-slate-900 dark:text-white">{item.goingCount}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Going</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2 text-center">
                      <p className="text-lg font-black text-slate-900 dark:text-white">{item.interestedCount}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Interested</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2 text-center">
                      <p className="text-lg font-black text-slate-900 dark:text-white">{item.comments.length}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Posts</p>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { addEventComment, EventView, RsvpStatus, setEventRsvp } from '@/app/actions/events';
import { CalendarClock, MapPin, MessageSquare, Star, ThumbsUp, UserRoundCheck, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function formatDate(date: string, time: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(`${date}T${time}`));
}

function audienceLabel(event: EventView) {
  if (event.scope === 'UNIVERSITY') return 'University-wide';
  if (event.scope === 'DEPARTMENT') return event.departmentName || 'Department';
  return [event.semesterName, event.sectionName].filter(Boolean).join(' - ') || 'Class';
}

const rsvpButtons: Array<{ status: RsvpStatus; label: string; icon: typeof UserRoundCheck }> = [
  { status: 'GOING', label: 'Going', icon: UserRoundCheck },
  { status: 'INTERESTED', label: 'Interested', icon: Star },
  { status: 'NOT_GOING', label: 'Not Going', icon: XCircle },
];

export default function EventFeed({ events }: { events: EventView[] }) {
  const router = useRouter();
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [loadingRsvp, setLoadingRsvp] = useState<string | null>(null);

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 shadow-sm">
        No events are available for your scope yet.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {events.map(item => (
        <article key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          {item.coverImage ? (
            <img src={item.coverImage} alt="" className="h-56 w-full object-cover bg-slate-100 dark:bg-slate-800" />
          ) : (
            <div className="h-40 bg-slate-900 dark:bg-slate-800 flex items-center justify-center">
              <CalendarClock className="h-14 w-14 text-indigo-300" />
            </div>
          )}

          <div className="p-5 md:p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">{item.category}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{audienceLabel(item)}</span>
                  {item.status === 'CANCELLED' && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">Cancelled</span>
                  )}
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{item.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hosted by {item.hostName}</p>
                <p className="text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">{item.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 lg:w-64 shrink-0">
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 px-3 py-3 text-center">
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{item.goingCount}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700/70 dark:text-emerald-300/70">Going</p>
                </div>
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 px-3 py-3 text-center">
                  <p className="text-xl font-black text-amber-700 dark:text-amber-300">{item.interestedCount}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-700/70 dark:text-amber-300/70">Maybe</p>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 px-3 py-3 text-center">
                  <p className="text-xl font-black text-slate-700 dark:text-slate-200">{item.notGoingCount}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3">
                <CalendarClock className="h-5 w-5 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Starts</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatDate(item.startDate, item.startTime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3">
                <MapPin className="h-5 w-5 text-rose-500 shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Location</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.location}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {rsvpButtons.map(button => {
                const Icon = button.icon;
                const active = item.myRsvp === button.status;
                return (
                  <button
                    key={button.status}
                    disabled={item.status === 'CANCELLED' || loadingRsvp === `${item.id}-${button.status}`}
                    onClick={async () => {
                      setLoadingRsvp(`${item.id}-${button.status}`);
                      await setEventRsvp(item.id, button.status);
                      setLoadingRsvp(null);
                      router.refresh();
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {button.label}
                  </button>
                );
              })}
            </div>

            <section className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Discussion</h3>
              </div>

              <form
                className="flex gap-2 mb-4"
                onSubmit={async event => {
                  event.preventDefault();
                  const message = commentDrafts[item.id] || '';
                  await addEventComment(item.id, message);
                  setCommentDrafts(prev => ({ ...prev, [item.id]: '' }));
                  router.refresh();
                }}
              >
                <input
                  value={commentDrafts[item.id] || ''}
                  onChange={event => setCommentDrafts(prev => ({ ...prev, [item.id]: event.target.value }))}
                  placeholder="Write a post for this event"
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">
                  <ThumbsUp className="h-4 w-4" />
                  Post
                </button>
              </form>

              <div className="space-y-3">
                {item.comments.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No discussion yet.</p>
                ) : (
                  item.comments.map(comment => (
                    <div key={comment.id} className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{comment.authorName}</p>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{comment.authorRole}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{comment.message}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </article>
      ))}
    </div>
  );
}

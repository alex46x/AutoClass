import { getVisibleEvents } from '@/app/actions/events';
import EventFeed from '@/app/events/EventFeed';
import { CalendarClock } from 'lucide-react';

export default async function DashboardEventsPage() {
  const events = await getVisibleEvents();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarClock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Events
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          RSVP, follow updates, and join discussions for events shared with you.
        </p>
      </header>

      <EventFeed events={events} />
    </div>
  );
}

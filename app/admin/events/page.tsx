import { getHostedEvents } from '@/app/actions/events';
import EventManager from '@/app/events/EventManager';

export default async function AdminEventsPage() {
  const events = await getHostedEvents('UNIVERSITY');
  return <EventManager scope="UNIVERSITY" events={events} />;
}

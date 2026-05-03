import { getHostedEvents } from '@/app/actions/events';
import EventManager from '@/app/events/EventManager';

export default async function CREventsPage() {
  const events = await getHostedEvents('CLASS');
  return <EventManager scope="CLASS" events={events} />;
}

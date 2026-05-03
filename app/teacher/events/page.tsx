import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getHostedEvents } from '@/app/actions/events';
import EventManager from '@/app/events/EventManager';

export default async function DepartmentEventsPage() {
  const session = await getSession();
  if (!session || session.role !== 'HEAD') redirect('/teacher');

  const events = await getHostedEvents('DEPARTMENT');
  return <EventManager scope="DEPARTMENT" events={events} />;
}

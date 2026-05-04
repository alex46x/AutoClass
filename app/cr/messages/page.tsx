import { getCurrentStaffUser, getMyMessageThreads, getStaffRecipients } from '@/app/actions/messages';
import StaffMessagesView from '@/app/staff-messages/StaffMessagesView';

export default async function CRMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string }>;
}) {
  const params = await searchParams;
  const [currentUser, recipients, threads] = await Promise.all([
    getCurrentStaffUser(),
    getStaffRecipients(),
    getMyMessageThreads(),
  ]);

  return (
    <StaffMessagesView
      basePath="/cr/messages"
      currentUser={currentUser}
      recipients={recipients}
      threads={threads}
      selectedThreadId={params.thread ? parseInt(params.thread, 10) : undefined}
    />
  );
}

import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SidebarLayout from '@/components/SidebarLayout';

export default async function CRLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Prevent other roles from accessing CR dashboard
  if (session.role !== 'CR' && session.role !== 'ADMIN') redirect('/dashboard');

  return (
    <SidebarLayout role="CR" userName={session.name}>
      {children}
    </SidebarLayout>
  );
}

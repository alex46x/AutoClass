import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SidebarLayout from '@/components/SidebarLayout';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Prevent other roles from accessing the base dashboard
  if (session.role === 'ADMIN') redirect('/admin');
  if (session.role === 'TEACHER' || session.role === 'HEAD') redirect('/teacher');
  // CR can access dashboard (they are also students)

  return (
    <SidebarLayout role={session.role} userName={session.name}>
      {children}
    </SidebarLayout>
  );
}

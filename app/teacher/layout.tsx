import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SidebarLayout from '@/components/SidebarLayout';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Prevent other roles from accessing the base dashboard
  if (session.role !== 'TEACHER' && session.role !== 'HEAD' && session.role !== 'ADMIN') redirect('/dashboard');

  return (
    <SidebarLayout role={session.role} userName={session.name}>
      {children}
    </SidebarLayout>
  );
}

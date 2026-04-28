import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SidebarLayout from '@/components/SidebarLayout';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <SidebarLayout role="ADMIN" userName={session.name}>
      {children}
    </SidebarLayout>
  );
}

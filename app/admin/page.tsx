import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminDashboard } from './AdminDashboard';

export default async function AdminPage() {
  const session = await auth();

  const isStaff = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
  if (!session?.user?.role || !isStaff) {
    redirect('/login');
  }

  return <AdminDashboard />;
}

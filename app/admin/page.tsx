import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminDashboard } from './AdminDashboard';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return <AdminDashboard />;
}

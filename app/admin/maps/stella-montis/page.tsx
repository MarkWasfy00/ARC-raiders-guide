import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminStellaMontisClient } from './AdminStellaMontisClient';

export default async function AdminStellaMontisPage() {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return <AdminStellaMontisClient />;
}

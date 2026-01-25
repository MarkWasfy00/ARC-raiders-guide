import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminStellaMontisClient } from './AdminStellaMontisClient';

export default async function AdminStellaMontisPage() {
  const session = await auth();

  const isStaff = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
  if (!session?.user?.role || !isStaff) {
    redirect('/login');
  }

  return <AdminStellaMontisClient />;
}

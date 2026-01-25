import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminDamClient } from './AdminDamClient';

export default async function AdminDamPage() {
  const session = await auth();

  const isStaff = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
  if (!session?.user?.role || !isStaff) {
    redirect('/login');
  }

  return <AdminDamClient />;
}

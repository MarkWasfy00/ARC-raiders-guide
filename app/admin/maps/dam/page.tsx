import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminDamClient } from './AdminDamClient';

export default async function AdminDamPage() {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return <AdminDamClient />;
}

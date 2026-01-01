import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminSpaceportClient } from './AdminSpaceportClient';

export default async function AdminSpaceportPage() {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return <AdminSpaceportClient />;
}

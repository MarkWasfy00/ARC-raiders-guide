import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminSpaceportClient } from './AdminSpaceportClient';

export default async function AdminSpaceportPage() {
  const session = await auth();

  const isStaff = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
  if (!session?.user?.role || !isStaff) {
    redirect('/login');
  }

  return <AdminSpaceportClient />;
}

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminBlueGateClient } from './AdminBlueGateClient';

export default async function AdminBlueGatePage() {
  const session = await auth();

  const isStaff = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
  if (!session?.user?.role || !isStaff) {
    redirect('/login');
  }

  return <AdminBlueGateClient />;
}

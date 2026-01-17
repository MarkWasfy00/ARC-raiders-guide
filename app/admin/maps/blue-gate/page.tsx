import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminBlueGateClient } from './AdminBlueGateClient';

export default async function AdminBlueGatePage() {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return <AdminBlueGateClient />;
}

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminBuriedCityClient } from './AdminBuriedCityClient';

export default async function AdminBuriedCityPage() {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return <AdminBuriedCityClient />;
}

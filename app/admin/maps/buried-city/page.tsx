import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminBuriedCityClient } from './AdminBuriedCityClient';

export default async function AdminBuriedCityPage() {
  const session = await auth();

  const isStaff = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
  if (!session?.user?.role || !isStaff) {
    redirect('/login');
  }

  return <AdminBuriedCityClient />;
}

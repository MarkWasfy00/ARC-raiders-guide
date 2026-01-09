import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { UsersList } from './UsersList';

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return <UsersList />;
}

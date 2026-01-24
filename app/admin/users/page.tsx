import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { UsersList } from './UsersList';

export default async function AdminUsersPage() {
  const session = await auth();

  const isStaff = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
  if (!session?.user?.role || !isStaff) {
    redirect('/login');
  }

  return <UsersList />;
}

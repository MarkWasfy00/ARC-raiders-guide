import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getLoadout } from '@/app/features/loadouts/services/loadouts-actions';
import { LoadoutEditForm } from '@/app/features/loadouts/components/LoadoutEditForm';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'تعديل الحمولة - ARC Raiders',
  description: 'عدّل حمولتك المخصصة',
};

export default async function EditLoadoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/login?callbackUrl=/loadouts/${id}/edit`);
  }

  const result = await getLoadout(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const loadout = result.data;

  // Check ownership
  if (loadout.userId !== session.user.id) {
    redirect(`/loadouts/${id}`);
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href={`/loadouts/${id}`}
            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى الحمولة
          </Link>
          <h1 className="text-3xl font-bold md:text-4xl">تعديل الحمولة</h1>
          <p className="text-muted-foreground">{loadout.name}</p>
        </div>

        <LoadoutEditForm loadout={loadout} />
      </div>
    </main>
  );
}

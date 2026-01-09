import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { getLoadout } from '@/app/features/loadouts/services/loadouts-actions';
import { LoadoutView } from '@/app/features/loadouts/components/LoadoutView';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getLoadout(id);

  if (!result.success || !result.data) {
    return {
      title: 'الحمولة غير موجودة',
    };
  }

  return {
    title: `${result.data.name} - الحمولات`,
    description: result.data.description || 'عرض الحمولة',
  };
}

export default async function LoadoutDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const result = await getLoadout(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const loadout = result.data;
  const isOwner = session?.user?.id === loadout.userId;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link
            href="/loadouts"
            className="mb-3 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى الحمولات
          </Link>
        </div>

        <LoadoutView loadout={loadout} isOwner={isOwner} />
      </div>
    </main>
  );
}

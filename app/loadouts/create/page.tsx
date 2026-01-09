import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LoadoutCreateForm } from '@/app/features/loadouts/components/LoadoutCreateForm';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'إنشاء حمولة - ARC Raiders',
  description: 'أنشئ حمولتك المخصصة',
};

export default async function CreateLoadoutPage() {
  const session = await auth();

  if (!session) {
    redirect('/login?callbackUrl=/loadouts/create');
  }

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

        <LoadoutCreateForm />
      </div>
    </main>
  );
}

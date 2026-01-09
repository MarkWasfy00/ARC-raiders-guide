import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LoadoutNotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">الحمولة غير موجودة</h1>
        <p className="text-muted-foreground mb-8">
          عذراً، الحمولة التي تبحث عنها غير موجودة أو تم حذفها.
        </p>
        <Link
          href="/loadouts"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى الحمولات
        </Link>
      </div>
    </main>
  );
}

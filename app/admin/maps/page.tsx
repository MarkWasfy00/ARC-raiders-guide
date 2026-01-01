import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminMapsGrid } from './AdminMapsGrid';
import { Shield } from 'lucide-react';

export default async function AdminMapsPage() {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10 border border-destructive/30 shadow-lg">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-destructive via-destructive/80 to-destructive/60 bg-clip-text text-transparent mb-1">
                لوحة تحكم الخرائط
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Admin Map Editor
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Grid */}
      <div className="container mx-auto px-6 py-6">
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
          <p className="text-sm text-destructive font-medium">
            ⚠️ وضع الإدارة: يمكنك إضافة وحذف العلامات من جميع الخرائط
          </p>
        </div>
        <AdminMapsGrid />
      </div>
    </div>
  );
}

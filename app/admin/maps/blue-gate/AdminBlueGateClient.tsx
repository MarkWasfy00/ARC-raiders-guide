'use client';

import dynamic from 'next/dynamic';
import { Shield } from 'lucide-react';

const BlueGateMapClient = dynamic(() => import('@/app/features/maps/components/BlueGateMapClient').then(mod => mod.BlueGateMapClient), {
  ssr: false,
});

export function AdminBlueGateClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Admin Header */}
      <div className="border-b border-destructive/50 bg-gradient-to-r from-destructive/10 via-destructive/5 to-background backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Shield className="w-6 h-6 text-destructive" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-destructive">
                وضع التحرير: Blue Gate
              </h1>
              <p className="text-xs text-muted-foreground">
                يمكنك إضافة وحذف العلامات
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="container mx-auto px-6 py-6">
        <BlueGateMapClient isAdminMode={true} />
      </div>
    </div>
  );
}

'use client';

import dynamic from 'next/dynamic';

const DamMapClient = dynamic(
  () => import('./DamMapClient').then((mod) => ({ default: mod.DamMapClient })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[calc(100vh-8rem)] relative rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
  }
);

export function DamMap() {
  return <DamMapClient />;
}

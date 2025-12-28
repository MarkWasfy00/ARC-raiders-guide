'use client';

import dynamic from 'next/dynamic';

const StellaMontisMapClient = dynamic(
  () => import('./StellaMontisMapClient').then((mod) => ({ default: mod.StellaMontisMapClient })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[calc(100vh-8rem)] relative rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
  }
);

export function StellaMontisMap() {
  return <StellaMontisMapClient />;
}

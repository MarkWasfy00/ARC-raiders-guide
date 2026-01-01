'use client';

import { MapCard } from '@/app/features/maps/components/MapCard';
import { MapData } from '@/app/features/maps/types';

const maps: MapData[] = [
  {
    id: 'dam',
    name: 'Dam Battlegrounds',
    href: '/admin/maps/dam',
    imageUrl: '/imagesmaps/dambattlegrounds.webp'
  },
  {
    id: 'stella-montis',
    name: 'Stella Montis',
    href: '/admin/maps/stella-montis',
    imageUrl: '/imagesmaps/blue-gate.webp'
  },
  {
    id: 'buried-city',
    name: 'Buried City',
    href: '/admin/maps/buried-city',
    imageUrl: '/imagesmaps/buriecity.webp'
  },
  {
    id: 'spaceport',
    name: 'The Spaceport',
    href: '/admin/maps/spaceport',
    imageUrl: '/imagesmaps/spaceport.webp'
  },
];

export function AdminMapsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {maps.map((map) => (
        <MapCard key={map.id} map={map} />
      ))}
    </div>
  );
}

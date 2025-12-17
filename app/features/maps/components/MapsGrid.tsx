import { MapCard } from './MapCard';
import { MapData } from '../types';

const maps: MapData[] = [
  {
    id: 'dam-battlegrounds',
    name: 'Dam Battlegrounds',
    href: '/maps/dam-battlegrounds',
    imageUrl: '/imagesmaps/dambattlegrounds.webp'
  },
  {
    id: 'the-spaceport',
    name: 'The Spaceport',
    href: '/maps/the-spaceport',
    imageUrl: '/imagesmaps/spaceport.webp'
  },
  {
    id: 'buried-city',
    name: 'Buried City',
    href: '/maps/buried-city',
    imageUrl: '/imagesmaps/buriecity.webp'
  },
  {
    id: 'blue-gate',
    name: 'Blue Gate',
    href: '/maps/blue-gate',
    imageUrl: '/imagesmaps/blue-gate.webp'
  },
  {
    id: 'stella-montis',
    name: 'Stella Montis',
    href: '/maps/stella-montis',
    imageUrl: '/imagesmaps/blue-gate.webp'
  }
];

export function MapsGrid() {
  return (
    <div className="space-y-3">
      {/* Grid of 5 Map Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
        {maps.map((map) => (
          <MapCard key={map.id} map={map} />
        ))}
      </div>

      {/* Explore Text */}
      <p className="text-center text-xs text-gray-500">
        Explore the map
      </p>
    </div>
  );
}

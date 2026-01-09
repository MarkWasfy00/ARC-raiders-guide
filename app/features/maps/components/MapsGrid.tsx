import { MapCard } from './MapCard';
import { MapData } from '../types';

const maps: MapData[] = [
  {
    id: 'dam-battlegrounds',
    name: 'ساحة سد المعركة',
    href: '/maps/dam-battlegrounds',
    imageUrl: '/imagesmaps/dambattlegrounds.webp'
  },
  {
    id: 'the-spaceport',
    name: 'ميناء الفضاء',
    href: '/maps/the-spaceport',
    imageUrl: '/imagesmaps/spaceport.webp'
  },
  {
    id: 'buried-city',
    name: 'المدينة المدفونة',
    href: '/maps/buried-city',
    imageUrl: '/imagesmaps/buriecity.webp'
  },
  {
    id: 'blue-gate',
    name: 'البوابة الزرقاء',
    href: '/maps/blue-gate',
    imageUrl: '/imagesmaps/blue-gate.webp'
  },
  {
    id: 'stella-montis',
    name: 'ستيلا مونتيس',
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
        استكشف الخريطة
      </p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { AdminMapCard } from './AdminMapCard';
import { MapData } from '@/app/features/maps/types';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';

const initialMaps: MapData[] = [
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
    imageUrl: '/imagesmaps/dambattlegrounds.webp'
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
  {
    id: 'blue-gate',
    name: 'Blue Gate',
    href: '/admin/maps/blue-gate',
    imageUrl: '/imagesmaps/dambattlegrounds.webp'
  },
];

export function AdminMapsGrid() {
  const [maps, setMaps] = useState<MapData[]>(initialMaps);
  const [selectedMapIds, setSelectedMapIds] = useState<Set<string>>(new Set());

  const handleSelectChange = (id: string, checked: boolean) => {
    setSelectedMapIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedMapIds.size === maps.length) {
      setSelectedMapIds(new Set());
    } else {
      setSelectedMapIds(new Set(maps.map(m => m.id)));
    }
  };

  const handleDelete = () => {
    if (selectedMapIds.size === 0) return;

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف ${selectedMapIds.size} خريطة؟\nAre you sure you want to delete ${selectedMapIds.size} map(s)?`
    );

    if (confirmed) {
      setMaps((prev) => prev.filter((map) => !selectedMapIds.has(map.id)));
      setSelectedMapIds(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedMapIds(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      {selectedMapIds.size > 0 && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-destructive">
              تم تحديد {selectedMapIds.size} خريطة | {selectedMapIds.size} map(s) selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              {selectedMapIds.size === maps.length ? 'إلغاء الكل | Deselect All' : 'تحديد الكل | Select All'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="text-xs"
            >
              <X className="w-4 h-4 ml-1" />
              إلغاء | Clear
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="text-xs font-bold"
            >
              <Trash2 className="w-4 h-4 ml-1" />
              حذف | Delete
            </Button>
          </div>
        </div>
      )}

      {/* Maps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {maps.map((map) => (
          <AdminMapCard
            key={map.id}
            map={map}
            isSelected={selectedMapIds.has(map.id)}
            onSelectChange={handleSelectChange}
          />
        ))}
      </div>

      {/* Empty State */}
      {maps.length === 0 && (
        <div className="text-center py-12 rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">
            لا توجد خرائط متاحة | No maps available
          </p>
        </div>
      )}
    </div>
  );
}

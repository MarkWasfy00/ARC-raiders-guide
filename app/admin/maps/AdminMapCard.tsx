'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapData } from '@/app/features/maps/types';
import { Checkbox } from '@/components/ui/checkbox';

interface AdminMapCardProps {
  map: MapData;
  isSelected: boolean;
  onSelectChange: (id: string, checked: boolean) => void;
}

export function AdminMapCard({ map, isSelected, onSelectChange }: AdminMapCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-card border border-border transition-all duration-300 hover:shadow-xl">
      {/* Checkbox Overlay */}
      <div className="absolute top-3 right-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectChange(map.id, checked as boolean)}
          className="h-5 w-5 bg-background/80 backdrop-blur-sm border-2 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
          aria-label={`Select ${map.name}`}
        />
      </div>

      {/* Map Card Content */}
      <Link
        href={map.href}
        className="block relative"
        style={{ aspectRatio: '250/100' }}
        aria-label={`Edit ${map.name} map`}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={map.imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
          />
        </div>

        {/* Overlay */}
        <div className={`absolute inset-0 transition-colors duration-300 ${
          isSelected ? 'bg-destructive/40' : 'bg-background/60'
        }`} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center p-3 md:p-4">
          {/* Title */}
          <h3 className={`text-sm sm:text-base md:text-lg font-bold transition-all duration-300 ${
            isSelected ? 'text-white' : 'text-foreground'
          } group-hover:translate-x-1`}>
            {map.name}
          </h3>
        </div>

        {/* Border Effect */}
        <div className={`absolute inset-0 border-2 rounded-lg transition-colors duration-300 ${
          isSelected ? 'border-destructive' : 'border-transparent group-hover:border-primary/30'
        }`} />
      </Link>
    </div>
  );
}

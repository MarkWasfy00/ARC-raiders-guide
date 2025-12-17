'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapData } from '../types';

interface MapCardProps {
  map: MapData;
}

export function MapCard({ map }: MapCardProps) {
  return (
    <Link
      href={map.href}
      className="group relative overflow-hidden rounded-lg bg-card border border-border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:scale-[1.02] focus-visible:shadow-xl"
      style={{ aspectRatio: '250/100' }}
      aria-label={`Explore ${map.name} map`}
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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center p-3 md:p-4">
        {/* Title */}
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground transition-transform duration-300 group-hover:translate-x-1">
          {map.name}
        </h3>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-lg transition-colors duration-300" />
    </Link>
  );
}

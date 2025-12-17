'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ExploreCategory } from '../types';

interface ExploreCardProps {
  category: ExploreCategory;
}

export function ExploreCard({ category }: ExploreCardProps) {
  return (
    <Link
      href={category.href}
      className="group relative overflow-hidden rounded-lg bg-card border-2 border-border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:scale-[1.02] focus-visible:shadow-xl"
      style={{ aspectRatio: '150/30' }}
      aria-label={`Open ${category.title} page`}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={category.imageUrl}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center p-2 md:p-3">
        {/* Title */}
        <h3 className="text-xs sm:text-sm md:text-base font-bold text-foreground transition-transform duration-300 group-hover:translate-x-1">
          {category.title}
        </h3>

        {/* Optional Description - Hidden by default, shown on hover */}
        {category.description && (
          <p className="text-[10px] sm:text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-0.5">
            {category.description}
          </p>
        )}
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-lg transition-colors duration-300" />
    </Link>
  );
}

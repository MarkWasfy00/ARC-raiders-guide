'use client';

import Link from 'next/link';
import Image from 'next/image';
import { NewsGuideData } from '../types';

interface NewsGuideCardProps {
  article: NewsGuideData;
}

export function NewsGuideCard({ article }: NewsGuideCardProps) {
  return (
    <Link
      href={article.href}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Read ${article.title}`}
    >
      {/* Large Photo - Landscape */}
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        <Image
          src={article.imageUrl}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Header (Title) */}
        <h3 className="text-base sm:text-lg font-bold mb-2 line-clamp-2 text-foreground">
          {article.title}
        </h3>

        {/* Short Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {article.description}
        </p>
      </div>
    </Link>
  );
}

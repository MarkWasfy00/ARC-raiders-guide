'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ItemData } from '../types';

interface ItemCardProps {
  item: ItemData;
}

export function ItemCard({ item }: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const hoverCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsHovered(false);
      }
    };

    if (isHovered) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isHovered]);

  return (
    <Link
      ref={cardRef}
      href={`/items/${item.id}`}
      className="group relative flex flex-col items-center gap-3 rounded-xl border border-border/70 bg-background/60 p-4 text-center transition-all hover:-translate-y-1 hover:border-orange-500/60 hover:bg-orange-500/5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      aria-label={`View ${item.name} details`}
    >
      {/* Item Thumbnail */}
      <div className="relative h-14 w-14 rounded-lg bg-muted/60 overflow-hidden">
        {!imageError ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="56px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            N/A
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground line-clamp-2">
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {item.description}
        </p>
      </div>

      {/* Hover Card */}
      {isHovered && (
        <div
          ref={hoverCardRef}
          className="absolute z-50 w-64 bg-card border border-border rounded-lg shadow-xl p-4 pointer-events-none"
          style={{
            top: '50%',
            left: '100%',
            marginLeft: '8px',
            transform: 'translateY(-50%)',
          }}
        >
          {/* Item Photo - Larger */}
          <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden mb-3">
            {!imageError ? (
              <Image
                src={item.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="256px"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          {/* Classification Badge */}
          <div className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded mb-2">
            {item.classification}
          </div>

          {/* Item Name Header */}
          <h3 className="text-base font-bold mb-2 text-foreground">{item.name}</h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
            {item.description}
          </p>

          {/* Two-column Detail Row */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <p className="text-xs text-muted-foreground">Stack size</p>
              <p className="text-sm font-semibold text-foreground">{item.stackSize}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Size</p>
              <p className="text-sm font-semibold text-foreground">{item.size}</p>
            </div>
          </div>

          {/* Category Label */}
          <div className="inline-block px-2 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded mb-3">
            {item.category}
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="text-sm font-semibold text-foreground">{item.weight}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Recycle value</p>
              <p className="text-sm font-semibold text-foreground">{item.recycleValue}</p>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}

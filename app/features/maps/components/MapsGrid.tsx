'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MapData } from '../types';

const maps: MapData[] = [
  {
    id: 'dam-battlegrounds',
    name: 'Dam Battlegrounds',
    href: '/maps/dam-battlegrounds',
    imageUrl: '/imagesmaps/dambattlegrounds.webp',
  },
  {
    id: 'the-spaceport',
    name: 'Spaceport',
    href: '/maps/the-spaceport',
    imageUrl: '/imagesmaps/spaceport.webp',
  },
  {
    id: 'buried-city',
    name: 'Buried City',
    href: '/maps/buried-city',
    imageUrl: '/imagesmaps/buriecity.webp',
  },
  {
    id: 'blue-gate',
    name: 'Blue Gate',
    href: '/maps/blue-gate',
    imageUrl: '/imagesmaps/blue-gate.webp',
  },
  {
    id: 'stella-montis',
    name: 'Stella Montis',
    href: '/maps/stella-montis',
    imageUrl: '/imagesmaps/blue-gate.webp',
  },
];

export function MapsGrid() {
  const [activeIndex, setActiveIndex] = useState(0);
  const isRtl = true;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  const startAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev === maps.length - 1 ? maps.length : prev + 1));
    }, 4000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const activeMap = useMemo(() => maps[activeIndex] ?? maps[0], [activeIndex]);

  const goTo = (index: number, resetTimer = false) => {
    const normalized = (index + maps.length) % maps.length;
    setActiveIndex(normalized);
    if (resetTimer) {
      startAutoSlide();
    }
  };
  const goNext = (resetTimer = false) => {
    setActiveIndex((prev) => (prev === maps.length - 1 ? maps.length : prev + 1));
    if (resetTimer) {
      startAutoSlide();
    }
  };

  const handleTransitionEnd = () => {
    if (activeIndex === maps.length) {
      setIsAnimating(false);
      setActiveIndex(0);
    }
  };

  useEffect(() => {
    if (!isAnimating) {
      const frame = requestAnimationFrame(() => setIsAnimating(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [isAnimating]);

  const slides = maps.length > 1 ? [...maps, maps[0]] : maps;
  const totalSlides = slides.length;

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative h-64 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl md:h-80 lg:h-[420px]">
          <div
            className={`flex h-full ${isAnimating ? 'transition-transform duration-[1200ms] ease-in-out' : ''}`}
            style={{
              width: `${totalSlides * 100}%`,
              transform: `translateX(${(isRtl ? 1 : -1) * activeIndex * (100 / totalSlides)}%)`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {slides.map((map, index) => (
              <Link
                key={`${map.id}-${index}`}
                href={map.href}
                className="relative h-full flex-none"
                style={{ width: `${100 / totalSlides}%` }}
                aria-label={`Explore ${map.name}`}
              >
                <Image
                  src={map.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 1000px, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-200/80">
                    Explore the map
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">{map.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute inset-y-0 left-3 flex items-center">
          <button
            type="button"
            onClick={() => (isRtl ? goNext(true) : goTo(activeIndex - 1, true))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:bg-black/60"
            aria-label="Previous map"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-3 flex items-center">
          <button
            type="button"
            onClick={() => (isRtl ? goTo(activeIndex - 1, true) : goNext(true))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:bg-black/60"
            aria-label="Next map"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {maps.map((map, index) => (
          <button
            key={map.id}
            type="button"
            onClick={() => goTo(index, true)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
              index === activeIndex
                ? 'border-orange-500/70 bg-orange-500/15 text-foreground'
                : 'border-border/60 text-muted-foreground hover:border-orange-500/60 hover:text-foreground'
            }`}
            aria-label={`Show ${map.name}`}
          >
            <span className="h-2 w-2 rounded-full bg-orange-400/80" />
            <span>{map.name}</span>
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Featured: <span className="text-foreground">{activeMap.name}</span>
      </p>
    </div>
  );
}

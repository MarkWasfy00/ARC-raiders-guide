'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ItemData } from '../types';
import { ItemCard } from './ItemCard';

interface ItemsCarouselProps {
  items: ItemData[];
}

const ITEMS_PER_PAGE = 12;
const SWIPE_THRESHOLD = 40;

export function ItemsCarousel({ items }: ItemsCarouselProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const isRtl = true;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  const pages = useMemo(() => {
    const chunks: ItemData[][] = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
      chunks.push(items.slice(i, i + ITEMS_PER_PAGE));
    }
    return chunks.length ? chunks : [[]];
  }, [items]);

  const startAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (pages.length <= 1) {
      return;
    }
    intervalRef.current = setInterval(() => {
      setPageIndex((prev) => (prev === pages.length - 1 ? pages.length : prev + 1));
    }, 4000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pages.length]);

  const goTo = (index: number, resetTimer = false) => {
    if (pages.length <= 1) {
      return;
    }
    const normalized = (index + pages.length) % pages.length;
    setPageIndex(normalized);
    if (resetTimer) {
      startAutoSlide();
    }
  };

  const goNext = (resetTimer = false) => {
    if (pages.length <= 1) {
      return;
    }
    setPageIndex((prev) => (prev === pages.length - 1 ? pages.length : prev + 1));
    if (resetTimer) {
      startAutoSlide();
    }
  };

  const handleTransitionEnd = () => {
    if (pageIndex === pages.length) {
      setIsAnimating(false);
      setPageIndex(0);
    }
  };

  useEffect(() => {
    if (!isAnimating) {
      const frame = requestAnimationFrame(() => setIsAnimating(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [isAnimating]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return;
    }

    if (deltaX < 0) {
      if (isRtl) {
        goTo(pageIndex - 1, true);
      } else {
        goNext(true);
      }
      return;
    }

    if (isRtl) {
      goNext(true);
      return;
    }
    goTo(pageIndex - 1, true);
  };

  const slides = pages.length > 1 ? [...pages, pages[0]] : pages;
  const totalSlides = slides.length;
  const displayIndex = pageIndex >= pages.length ? 0 : pageIndex;

  return (
    <div className="space-y-4">
      <div
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full overflow-hidden">
          <div
            className={`flex ${isAnimating ? 'transition-transform duration-[1200ms] ease-in-out' : ''}`}
            style={{
              width: `${totalSlides * 100}%`,
              transform: `translateX(${(isRtl ? 1 : -1) * pageIndex * (100 / totalSlides)}%)`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {slides.map((page, index) => (
              <div
                key={`items-page-${index}`}
                className="grid flex-none grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
                style={{ width: `${100 / totalSlides}%` }}
              >
                {page.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {pages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => (isRtl ? goNext(true) : goTo(pageIndex - 1, true))}
              className="absolute -left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow-lg transition hover:bg-background/95 md:flex"
              aria-label="Previous items"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => (isRtl ? goTo(pageIndex - 1, true) : goNext(true))}
              className="absolute -right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow-lg transition hover:bg-background/95 md:flex"
              aria-label="Next items"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {pages.map((_, index) => (
            <button
              key={`items-page-${index}`}
              type="button"
              onClick={() => goTo(index, true)}
              className={`h-2 w-6 rounded-full transition ${
                index === displayIndex ? 'bg-orange-400/80' : 'bg-muted/60 hover:bg-muted'
              }`}
              aria-label={`Go to items page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

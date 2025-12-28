'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TraderItem } from '../types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface TraderCardProps {
  item: TraderItem;
  isSelected?: boolean;
  onToggle?: (item: TraderItem) => void;
}

const rarityColors = {
  Common: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  Uncommon: 'bg-green-500/20 text-green-300 border-green-500/30',
  Rare: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Epic: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

export function TraderCard({ item, isSelected = false, onToggle }: TraderCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
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

  const handleCheckboxChange = (checked: boolean) => {
    if (onToggle) {
      onToggle(item);
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative flex items-center gap-2 p-1.5 rounded-lg border transition-all",
        isSelected
          ? "bg-primary/10 border-primary shadow-md"
          : "border-border hover:bg-accent hover:border-primary/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={-1}
      aria-label={`${item.name} - ${item.trader_price} كريديت`}
    >
      {/* Selection Checkbox */}
      {onToggle && (
        <div className="flex-shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            id={`checkbox-${item.id}`}
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            aria-label={`اختيار ${item.name}`}
          />
        </div>
      )}

      {/* Item Thumbnail */}
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-muted rounded-md overflow-hidden">
        <Image
          src={item.icon}
          alt=""
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>

      {/* Item Name & Price */}
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium line-clamp-1">
          {item.name}
        </p>
        <div className="flex items-center gap-1">
          <p className="text-xs text-primary font-semibold">
            {item.trader_price}
          </p>
          <Image
            src="/images/coins/coin.webp"
            alt=""
            width={14}
            height={14}
            className="object-contain"
          />
        </div>
      </div>

      {/* Hover Card */}
      {isHovered && (
        <div
          ref={hoverCardRef}
          className="absolute z-50 w-72 bg-card border border-border rounded-lg shadow-xl p-4 pointer-events-none"
          style={{
            top: '50%',
            left: '100%',
            marginLeft: '8px',
            transform: 'translateY(-50%)',
          }}
        >
          {/* Item Photo - Larger */}
          <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden mb-3">
            <Image
              src={item.icon}
              alt=""
              fill
              className="object-cover"
              sizes="288px"
            />
          </div>

          {/* Rarity Badge */}
          <div className={cn(
            "inline-block px-2 py-1 text-xs font-semibold rounded mb-2 border",
            rarityColors[item.rarity]
          )}>
            {item.rarity}
          </div>

          {/* Item Name Header */}
          <h3 className="text-base font-bold mb-2 text-foreground">{item.name}</h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {item.description}
          </p>

          {/* Two-column Detail Row */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <p className="text-xs text-muted-foreground">النوع</p>
              <p className="text-sm font-semibold text-foreground">{item.item_type}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">القيمة</p>
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          </div>

          {/* Price */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">سعر التاجر</p>
            <div className="flex items-center gap-1.5">
              <p className="text-lg font-bold text-primary">{item.trader_price}</p>
              <Image
                src="/images/coins/coin.webp"
                alt=""
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

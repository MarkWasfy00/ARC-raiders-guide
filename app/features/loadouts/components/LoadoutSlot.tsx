'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Plus, Lock } from 'lucide-react';
import type { ItemWithSlots } from '../types';

interface LoadoutSlotProps {
  item: ItemWithSlots | null;
  slotType: string;
  slotIndex?: number;
  isEmpty: boolean;
  isEditMode: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'weapon';
  quantity?: number;
  showLock?: boolean;
}

export function LoadoutSlot({
  item,
  slotType,
  slotIndex,
  isEmpty,
  isEditMode,
  onClick,
  className,
  size = 'md',
  quantity,
  showLock = false,
}: LoadoutSlotProps) {
  const sizeClasses = {
    sm: 'h-10 w-10 md:h-12 md:w-12',
    md: 'h-16 w-16 md:h-18 md:w-18',
    lg: 'h-20 w-20 md:h-24 md:w-24',
    weapon: 'h-32 w-full',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    weapon: 'h-6 w-6',
  };

  const paddingClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-2.5',
    weapon: 'p-3',
  };

  const imageSizes = {
    sm: '(max-width: 768px) 40px, 48px',
    md: '(max-width: 768px) 64px, 72px',
    lg: '(max-width: 768px) 80px, 96px',
    weapon: '(max-width: 768px) 280px, 320px',
  };

  // Get rarity color for border
  const getRarityBorderColor = (rarity: string | null) => {
    switch (rarity?.toUpperCase()) {
      case 'LEGENDARY':
        return 'border-amber-500/60 hover:border-amber-500/80';
      case 'EPIC':
        return 'border-purple-500/60 hover:border-purple-500/80';
      case 'RARE':
        return 'border-blue-500/60 hover:border-blue-500/80';
      case 'UNCOMMON':
        return 'border-green-500/60 hover:border-green-500/80';
      case 'COMMON':
        return 'border-gray-500/60 hover:border-gray-500/80';
      default:
        return 'border-border/40 hover:border-primary/50';
    }
  };

  // Get rarity background glow
  const getRarityGlow = (rarity: string | null) => {
    switch (rarity?.toUpperCase()) {
      case 'LEGENDARY':
        return 'bg-gradient-to-br from-amber-500/5 via-card/80 to-amber-500/5';
      case 'EPIC':
        return 'bg-gradient-to-br from-purple-500/5 via-card/80 to-purple-500/5';
      case 'RARE':
        return 'bg-gradient-to-br from-blue-500/5 via-card/80 to-blue-500/5';
      case 'UNCOMMON':
        return 'bg-gradient-to-br from-green-500/5 via-card/80 to-green-500/5';
      case 'COMMON':
        return 'bg-gradient-to-br from-gray-500/5 via-card/80 to-gray-500/5';
      default:
        return 'bg-card/80';
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isEditMode}
      className={cn(
        'group relative overflow-hidden rounded-lg transition-all duration-200',
        sizeClasses[size],
        isEmpty
          ? 'border-2 border-dashed border-border/60 bg-muted/40 hover:border-primary/60 hover:bg-muted/50'
          : cn(
              'border-2 shadow-sm hover:shadow-md hover:shadow-primary/20',
              getRarityBorderColor(item?.rarity || null),
              getRarityGlow(item?.rarity || null)
            ),
        isEditMode && 'cursor-pointer active:scale-95',
        !isEditMode && 'cursor-default',
        className
      )}
    >
      {isEmpty ? (
        <div className="flex h-full items-center justify-center">
          {showLock ? (
            <Lock className={cn('text-muted-foreground/60', iconSizeClasses[size])} />
          ) : (
            isEditMode && (
              <Plus className={cn('text-muted-foreground/50 transition-all group-hover:text-primary/70', iconSizeClasses[size])} />
            )
          )}
        </div>
      ) : (
        <>
          <div className={cn('relative h-full w-full flex items-center justify-center', paddingClasses[size])}>
            {item?.icon && (
              <Image
                src={item.icon}
                alt={item.name}
                fill
                className="object-contain transition-transform group-hover:scale-105"
                sizes={imageSizes[size]}
                quality={100}
                priority={false}
              />
            )}
          </div>

          {/* Quantity badge */}
          {quantity !== undefined && quantity > 1 && (
            <div className="absolute bottom-1 right-1 rounded bg-black/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
              ×{quantity}
            </div>
          )}

          {/* Hover tooltip */}
          {item && (
            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-primary/40 bg-popover/95 px-3 py-2 text-sm text-popover-foreground shadow-lg group-hover:block">
              <div className="font-bold">{item.name}</div>
              {item.rarity && (
                <div className="text-xs font-semibold text-muted-foreground">{item.rarity}</div>
              )}
            </div>
          )}

          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/0 opacity-0 transition-opacity group-hover:via-white/5 group-hover:to-white/10 group-hover:opacity-100" />
        </>
      )}
    </button>
  );
}

'use client';

import { X, Trash2, Calculator } from 'lucide-react';
import Image from 'next/image';
import { TraderItem } from '../types';

export interface SelectedItem {
  item: TraderItem;
  quantity: number;
}

interface CreditsCalculatorProps {
  selectedItems: Record<string, SelectedItem>;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearAll: () => void;
}

export function CreditsCalculator({
  selectedItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearAll,
}: CreditsCalculatorProps) {
  const items = Object.values(selectedItems);
  const totalCredits = items.reduce(
    (sum, { item, quantity }) => sum + item.trader_price * quantity,
    0
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto px-4 z-40">
      <div className="bg-card border-2 border-primary/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary/10 border-b border-primary/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">حاسبة الكريديت</h3>
            <span className="text-xs text-muted-foreground">
              ({items.length} عنصر)
            </span>
          </div>
          <button
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            مسح الكل
          </button>
        </div>

        {/* Items List */}
        <div className="max-h-48 overflow-y-auto p-3 space-y-2">
          {items.map(({ item, quantity }) => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-accent/50 rounded-lg p-2 group"
            >
              {/* Remove Button */}
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                aria-label="إزالة العنصر"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Item Image */}
              <div className="relative w-10 h-10 flex-shrink-0 bg-muted rounded overflow-hidden">
                <Image
                  src={item.icon}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>

              {/* Item Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">
                    {item.trader_price}
                  </p>
                  <Image
                    src="/images/coins/coin.webp"
                    alt=""
                    width={12}
                    height={12}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Quantity Input */}
              <div className="flex items-center gap-2">
                <label htmlFor={`qty-${item.id}`} className="sr-only">
                  الكمية
                </label>
                <input
                  id={`qty-${item.id}`}
                  type="number"
                  min="1"
                  max="999"
                  value={quantity}
                  onChange={(e) => {
                    const newQty = parseInt(e.target.value) || 1;
                    onUpdateQuantity(item.id, Math.max(1, Math.min(999, newQty)));
                  }}
                  className="w-14 bg-background border border-border rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">×</span>
              </div>

              {/* Subtotal */}
              <div className="text-left w-24 flex items-center gap-1">
                <p className="text-sm font-bold text-primary">
                  {(item.trader_price * quantity).toLocaleString()}
                </p>
                <Image
                  src="/images/coins/coin.webp"
                  alt=""
                  width={16}
                  height={16}
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total Footer */}
        <div className="bg-primary/5 border-t border-primary/30 px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-foreground">المجموع الكلي:</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              {totalCredits.toLocaleString()}
            </span>
            <Image
              src="/images/coins/coin.webp"
              alt=""
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

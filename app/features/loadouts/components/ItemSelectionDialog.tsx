'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { ItemWithSlots } from '../types';
import { getRarityColor } from '../utils/slot-utils';

interface ItemSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slotType: string;
  onSelect: (itemId: string | null) => void;
  selectedItemId?: string | null;
}

export function ItemSelectionDialog({
  open,
  onOpenChange,
  slotType,
  onSelect,
  selectedItemId,
}: ItemSelectionDialogProps) {
  const [items, setItems] = useState<ItemWithSlots[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && slotType) {
      fetchItems();
    }
  }, [open, slotType]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/items/loadout-filter?slotType=${encodeURIComponent(slotType)}`
      );
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = search
    ? items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  const handleSelect = (itemId: string) => {
    onSelect(itemId);
    onOpenChange(false);
    setSearch(''); // Reset search on selection
  };

  const handleClear = () => {
    onSelect(null);
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>اختر عنصراً</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن عنصر..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Items Grid */}
          <div className="max-h-[500px] overflow-y-auto rounded-lg border bg-muted/20 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">لا توجد عناصر متاحة</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {/* Clear button */}
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-3 transition-colors hover:border-destructive hover:bg-destructive/5"
                >
                  <div className="flex h-16 w-16 items-center justify-center">
                    <X className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="text-center text-xs font-medium text-destructive">
                    إزالة العنصر
                  </p>
                </button>

                {/* Items */}
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border p-3 transition-all hover:border-primary hover:shadow-md',
                      selectedItemId === item.id &&
                        'border-primary bg-primary/10 ring-2 ring-primary/20'
                    )}
                  >
                    <div className="relative h-16 w-16">
                      {item.icon && (
                        <Image
                          src={item.icon}
                          alt={item.name}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="flex w-full flex-col gap-1">
                      <p className="line-clamp-2 text-center text-xs font-medium">
                        {item.name}
                      </p>
                      {item.rarity && (
                        <Badge
                          variant="outline"
                          className={cn('text-[10px]', getRarityColor(item.rarity))}
                        >
                          {item.rarity}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results count */}
          {!loading && filteredItems.length > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              {filteredItems.length} عنصر متاح
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

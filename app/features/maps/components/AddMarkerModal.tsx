'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MARKER_CATEGORIES } from '../types';

export interface MarkerSettings {
  category: string;
  subcategory: string;
  instanceName: string;
  behindLockedDoor: boolean;
}

interface AddMarkerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { lat: number; lng: number } | null;
  mapId: string;
  onMarkerAdded: () => void;
  onStartContinuousPlacement?: (settings: MarkerSettings) => void;
  zlayers?: number; // Optional floor-specific zlayers (for stella-montis)
}

export function AddMarkerModal({
  open,
  onOpenChange,
  position,
  mapId,
  onMarkerAdded,
  onStartContinuousPlacement,
  zlayers,
}: AddMarkerModalProps) {
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [instanceName, setInstanceName] = useState<string>('');
  const [behindLockedDoor, setBehindLockedDoor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [continuousMode, setContinuousMode] = useState(false);

  // Get subcategories for selected category
  const getSubcategories = () => {
    if (!category) return [];
    const categoryData = MARKER_CATEGORIES[category];
    return categoryData?.subcategories || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      setError('الرجاء اختيار الفئة');
      return;
    }

    // If continuous mode is enabled, start continuous placement
    if (continuousMode && onStartContinuousPlacement) {
      onStartContinuousPlacement({
        category,
        subcategory: subcategory || '',
        instanceName: instanceName || '',
        behindLockedDoor,
      });
      // Reset form and close
      setCategory('');
      setSubcategory('');
      setInstanceName('');
      setBehindLockedDoor(false);
      setContinuousMode(false);
      onOpenChange(false);
      return;
    }

    // Single marker placement mode
    if (!position) {
      setError('الرجاء اختيار موقع على الخريطة');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const requestBody: any = {
        lat: position.lat,
        lng: position.lng,
        category,
        subcategory: subcategory || null,
        instanceName: instanceName || null,
        behindLockedDoor,
      };

      // Include zlayers if provided (for stella-montis map)
      if (zlayers !== undefined) {
        requestBody.zlayers = zlayers;
      }

      const response = await fetch(`/api/maps/${mapId}/markers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'فشل في إضافة العلامة');
      }

      // Reset form and close
      setCategory('');
      setSubcategory('');
      setInstanceName('');
      setBehindLockedDoor(false);
      onMarkerAdded();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة علامة جديدة</DialogTitle>
          <DialogDescription>
            أضف علامة جديدة على الخريطة. انقر على الخريطة لتحديد الموقع.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!continuousMode && position && (
              <div className="text-sm text-muted-foreground">
                الموقع: ({position.lat.toFixed(1)}, {position.lng.toFixed(1)})
              </div>
            )}

            <div className="grid gap-3">
              <Label htmlFor="category">الفئة *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MARKER_CATEGORIES).map(([id, data]) => (
                    <SelectItem key={id} value={id}>
                      {data.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {category && getSubcategories().length > 0 && (
              <div className="grid gap-3">
                <Label htmlFor="subcategory">النوع الفرعي</Label>
                <Select value={subcategory} onValueChange={setSubcategory}>
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder="اختر النوع الفرعي" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubcategories().map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub.replace(/_/g, ' ').replace(/-/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-3">
              <Label htmlFor="instanceName">اسم العلامة (اختياري)</Label>
              <Input
                id="instanceName"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder="مثال: صندوق أسلحة نادر"
              />
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="behindLockedDoor"
                checked={behindLockedDoor}
                onCheckedChange={(checked) => setBehindLockedDoor(checked as boolean)}
              />
              <Label
                htmlFor="behindLockedDoor"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                خلف باب مقفل
              </Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="continuousMode"
                checked={continuousMode}
                onCheckedChange={(checked) => setContinuousMode(checked as boolean)}
              />
              <Label
                htmlFor="continuousMode"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                وضع الإضافة المتعددة (اختر الإعدادات ثم انقر على الخريطة عدة مرات)
              </Label>
            </div>

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={submitting || (!position && !continuousMode) || !category}>
              {submitting ? 'جاري الإضافة...' : continuousMode ? 'بدء الإضافة المتعددة' : 'إضافة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

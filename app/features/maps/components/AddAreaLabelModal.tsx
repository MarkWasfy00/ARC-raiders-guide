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

interface AddAreaLabelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { lat: number; lng: number } | null;
  mapId: string;
  onLabelAdded: () => void;
}

const LABEL_PRESETS = [
  { name: 'Major Region', nameAr: 'منطقة رئيسية', fontSize: 18, color: '#ffffff' },
  { name: 'Loot Zone', nameAr: 'منطقة نهب', fontSize: 13, color: '#ffd700' },
  { name: 'Custom', nameAr: 'مخصص', fontSize: 14, color: '#ffffff' },
];

export function AddAreaLabelModal({
  open,
  onOpenChange,
  position,
  mapId,
  onLabelAdded,
}: AddAreaLabelModalProps) {
  const [name, setName] = useState<string>('');
  const [nameAr, setNameAr] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(14);
  const [color, setColor] = useState<string>('#ffffff');
  const [preset, setPreset] = useState<string>('Custom');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handlePresetChange = (presetName: string) => {
    setPreset(presetName);
    const selectedPreset = LABEL_PRESETS.find(p => p.name === presetName);
    if (selectedPreset) {
      setFontSize(selectedPreset.fontSize);
      setColor(selectedPreset.color);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!position || !name || !nameAr) {
      setError('الرجاء ملء جميع الحقول المطلوبة واختيار موقع على الخريطة');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/maps/${mapId}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: position.lat,
          lng: position.lng,
          name,
          nameAr,
          fontSize,
          color,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'فشل في إضافة العنوان');
      }

      // Reset form
      setName('');
      setNameAr('');
      setFontSize(14);
      setColor('#ffffff');
      setPreset('Custom');

      // Notify parent
      onLabelAdded();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة عنوان جديد للخريطة</DialogTitle>
          <DialogDescription>
            أضف عنواناً جديداً للمنطقة على الخريطة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {position && (
              <div className="text-sm text-muted-foreground">
                الموقع: ({position.lat.toFixed(1)}, {position.lng.toFixed(1)})
              </div>
            )}

            <div className="grid gap-3">
              <Label htmlFor="preset">نوع العنوان</Label>
              <Select value={preset} onValueChange={handlePresetChange}>
                <SelectTrigger id="preset">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  {LABEL_PRESETS.map((p) => (
                    <SelectItem key={p.name} value={p.name}>
                      {p.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="name">الاسم بالإنجليزية *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: RED LAKES"
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="nameAr">الاسم بالعربية *</Label>
              <Input
                id="nameAr"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: البحيرات الحمراء"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-3">
                <Label htmlFor="fontSize">حجم الخط</Label>
                <Input
                  id="fontSize"
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value) || 14)}
                  min="10"
                  max="30"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="color">اللون</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#ffffff"
                  />
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">معاينة:</div>
              <div
                style={{
                  fontSize: `${fontSize}px`,
                  color: color,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                {nameAr || 'اسم المنطقة'}
              </div>
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
            <Button type="submit" disabled={submitting || !position || !name || !nameAr}>
              {submitting ? 'جاري الإضافة...' : 'إضافة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

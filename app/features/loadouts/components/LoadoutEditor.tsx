'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  LoadoutData,
  LoadoutSlotConfig,
  ItemWithSlots,
  SlotSelection,
  LoadoutSlotType,
} from '../types';
import {
  getBagCapacity,
  resizeSlots,
  createEmptyLoadoutData,
} from '../utils/slot-utils';
import { getItem } from '../services/loadouts-actions';
import { LoadoutSlot } from './LoadoutSlot';
import { ItemSelectionDialog } from './ItemSelectionDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Loader2, List, Share2, RotateCcw, Package } from 'lucide-react';

interface LoadoutEditorProps {
  initialData?: LoadoutData;
  initialName?: string;
  initialDescription?: string;
  initialTags?: string[];
  initialIsPublic?: boolean;
  onSave: (data: {
    name: string;
    description: string;
    tags: string[];
    is_public: boolean;
    loadoutData: LoadoutData;
  }) => Promise<void>;
  isEditMode?: boolean;
  isSaving?: boolean;
}

export function LoadoutEditor({
  initialData,
  initialName = '',
  initialDescription = '',
  initialTags = [],
  initialIsPublic = true,
  onSave,
  isEditMode = true,
  isSaving = false,
}: LoadoutEditorProps) {
  // Form state
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(initialIsPublic);

  // Loadout data state - ensure all arrays exist
  const [loadoutData, setLoadoutData] = useState<LoadoutData>(() => {
    if (!initialData) return createEmptyLoadoutData();

    // Ensure all required arrays exist
    return {
      shield: initialData.shield || null,
      augment: initialData.augment || null,
      backpack: Array.isArray(initialData.backpack) ? initialData.backpack : Array(14).fill(null),
      quickUse: Array.isArray(initialData.quickUse) ? initialData.quickUse : Array(4).fill(null),
      safePocket: Array.isArray(initialData.safePocket) ? initialData.safePocket : [],
      weaponprimary: initialData.weaponprimary || null,
      weaponsecondary: initialData.weaponsecondary || null,
      primaryAttachments: Array.isArray(initialData.primaryAttachments) ? initialData.primaryAttachments : Array(4).fill(null),
      secondaryAttachments: Array.isArray(initialData.secondaryAttachments) ? initialData.secondaryAttachments : Array(4).fill(null),
    };
  });

  // Bag capacity state
  const [bagItem, setBagItem] = useState<ItemWithSlots | null>(null);
  const [slotConfig, setSlotConfig] = useState<LoadoutSlotConfig>({
    backpackSlots: 14,
    quickUseSlots: 4,
    safePocketSlots: 0,
  });

  // Item cache for display
  const [itemCache, setItemCache] = useState<Map<string, ItemWithSlots>>(new Map());
  const [loadingItems, setLoadingItems] = useState(false);

  // Dialog state
  const [selectionDialog, setSelectionDialog] = useState<SlotSelection & { open: boolean }>({
    open: false,
    slotType: 'shield',
  });

  // Fetch and cache item data
  const fetchAndCacheItem = useCallback(async (itemId: string) => {
    // Safety check - ensure itemId is a valid string
    if (!itemId || typeof itemId !== 'string' || itemId.trim() === '') {
      return;
    }

    if (itemCache.has(itemId)) {
      // If it's the bag item, set it
      if (itemId === loadoutData.augment) {
        setBagItem(itemCache.get(itemId)!);
      }
      return;
    }

    try {
      const result = await getItem(itemId);

      if (result.success && result.data) {
        const itemData = result.data;
        setItemCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(itemId, itemData);
          return newCache;
        });

        // If it's the bag item, set it
        if (itemId === loadoutData.augment) {
          setBagItem(itemData);
        }
      }
    } catch (error) {
      console.error('Error fetching item:', itemId, error);
    }
  }, [itemCache, loadoutData.augment]);

  // Fetch bag item when augment changes
  useEffect(() => {
    if (loadoutData.augment) {
      fetchAndCacheItem(loadoutData.augment);
    }
  }, [loadoutData.augment, fetchAndCacheItem]);

  // Update bag capacity when bag item changes
  useEffect(() => {
    if (bagItem) {
      const newConfig = getBagCapacity(bagItem);
      setSlotConfig(newConfig);

      // Resize slot arrays if capacity changed
      setLoadoutData((prev) => ({
        ...prev,
        backpack: resizeSlots(prev.backpack, newConfig.backpackSlots),
        quickUse: resizeSlots(prev.quickUse, newConfig.quickUseSlots),
        safePocket: resizeSlots(prev.safePocket, newConfig.safePocketSlots),
      }));
    }
  }, [bagItem]);

  // Fetch items for all slots on mount
  useEffect(() => {
    const fetchAllItems = async () => {
      const itemIds = new Set<string>();

      // Fixed slots - only add if it's a string
      if (loadoutData.shield && typeof loadoutData.shield === 'string') {
        itemIds.add(loadoutData.shield);
      }
      if (loadoutData.augment && typeof loadoutData.augment === 'string') {
        itemIds.add(loadoutData.augment);
      }
      if (loadoutData.weaponprimary && typeof loadoutData.weaponprimary === 'string') {
        itemIds.add(loadoutData.weaponprimary);
      }
      if (loadoutData.weaponsecondary && typeof loadoutData.weaponsecondary === 'string') {
        itemIds.add(loadoutData.weaponsecondary);
      }

      // Array slots - filter out null and non-string values
      const allArrayIds = [
        ...(loadoutData.backpack || []),
        ...(loadoutData.quickUse || []),
        ...(loadoutData.safePocket || []),
        ...(loadoutData.primaryAttachments || []),
        ...(loadoutData.secondaryAttachments || []),
      ].filter((id): id is string => typeof id === 'string' && id !== null);

      allArrayIds.forEach((id) => itemIds.add(id));

      // Fetch all items
      if (itemIds.size > 0) {
        setLoadingItems(true);
        await Promise.all(Array.from(itemIds).map((id) => fetchAndCacheItem(id)));
        setLoadingItems(false);
      }
    };

    fetchAllItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSlotClick = (slotType: LoadoutSlotType, slotIndex?: number) => {
    if (!isEditMode) return;
    setSelectionDialog({ open: true, slotType, slotIndex });
  };

  const handleItemSelect = (itemId: string | null) => {
    const { slotType, slotIndex } = selectionDialog;

    setLoadoutData((prev) => {
      if (slotIndex !== undefined) {
        // Array slot
        const currentValue = prev[slotType as keyof LoadoutData];
        if (Array.isArray(currentValue)) {
          const newArray = [...currentValue];
          newArray[slotIndex] = itemId;
          return { ...prev, [slotType]: newArray };
        }
        return prev;
      } else {
        // Single slot
        return { ...prev, [slotType]: itemId };
      }
    });

    // Fetch item data if selected
    if (itemId) {
      fetchAndCacheItem(itemId);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    await onSave({
      name,
      description,
      tags,
      is_public: isPublic,
      loadoutData,
    });
  };

  const getItemForSlot = (itemId: string | null): ItemWithSlots | null => {
    if (!itemId) return null;
    return itemCache.get(itemId) || null;
  };

  const filledBackpackSlots = (loadoutData.backpack || []).filter((id) => id !== null).length;
  const filledQuickUseSlots = (loadoutData.quickUse || []).filter((id) => id !== null).length;
  const filledSafePocketSlots = (loadoutData.safePocket || []).filter((id) => id !== null).length;

  // Calculate total weight and price
  const calculateTotals = useMemo(() => {
    let totalWeight = 0;
    let totalPrice = 0;

    const allItemIds = [
      loadoutData.shield,
      loadoutData.augment,
      loadoutData.weaponprimary,
      loadoutData.weaponsecondary,
      ...(loadoutData.backpack || []),
      ...(loadoutData.quickUse || []),
      ...(loadoutData.safePocket || []),
      ...(loadoutData.primaryAttachments || []),
      ...(loadoutData.secondaryAttachments || []),
    ].filter((id): id is string => typeof id === 'string' && id !== null);

    allItemIds.forEach((itemId) => {
      const item = itemCache.get(itemId);
      if (item) {
        // Add weight from stat_block
        const weight = item.stat_block?.weight || 0;
        totalWeight += typeof weight === 'number' ? weight : 0;

        // Add price from value field
        totalPrice += item.value || 0;
      }
    });

    // Get bag weight limit
    const bagWeightLimit = bagItem?.stat_block?.weightLimit || 0;

    return {
      weight: totalWeight,
      weightLimit: bagWeightLimit,
      price: totalPrice,
    };
  }, [loadoutData, itemCache, bagItem]);

  return (
    <div className="min-h-screen bg-background space-y-6 p-4">
      {loadingItems && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center text-sm text-muted-foreground">
          جاري تحميل العناصر...
        </div>
      )}

      {/* Top Header with Loadout Info */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">الحمولة</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="font-medium" title="الوزن الإجمالي">
                {calculateTotals.weightLimit > 0
                  ? `${calculateTotals.weight.toFixed(1)}/${calculateTotals.weightLimit} كجم`
                  : `${calculateTotals.weight.toFixed(1)} كجم`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" />
              </svg>
              <span className="font-medium" title="السعر الإجمالي">
                {calculateTotals.price.toLocaleString('ar')} بذرة
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Loadout Grid - 3 Columns */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr_330px]">
        {/* Column 1: Quick Use + Safe Pocket */}
        <div className="flex flex-col space-y-4 h-full">
          {/* Quick Use */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                الاستخدام السريع
              </h3>
              <span className="text-xs font-bold text-foreground">
                {filledQuickUseSlots}/{slotConfig.quickUseSlots}
              </span>
            </div>
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <div className="grid grid-cols-3 gap-2" dir="ltr">
                {loadoutData.quickUse.map((itemId, idx) => (
                  <LoadoutSlot
                    key={`quickUse-${idx}`}
                    item={getItemForSlot(itemId)}
                    slotType="quickUse"
                    slotIndex={idx}
                    isEmpty={!itemId}
                    isEditMode={isEditMode}
                    onClick={() => handleSlotClick('quickUse', idx)}
                    size="md"
                    quantity={idx === 0 ? 4 : idx === 1 ? 5 : 3}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Safe Pocket */}
          <div className="mt-auto">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                الجيب الآمن
              </h3>
              <span className="text-xs font-bold text-foreground">
                {filledSafePocketSlots}/{slotConfig.safePocketSlots || 1}
              </span>
            </div>
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <div className="flex gap-2" dir="ltr">
                {slotConfig.safePocketSlots > 0 ? (
                  loadoutData.safePocket.map((itemId, idx) => (
                    <LoadoutSlot
                      key={`safePocket-${idx}`}
                      item={getItemForSlot(itemId)}
                      slotType="safePocket"
                      slotIndex={idx}
                      isEmpty={!itemId}
                      isEditMode={isEditMode}
                      onClick={() => handleSlotClick('safePocket', idx)}
                      size="lg"
                    />
                  ))
                ) : (
                  <LoadoutSlot
                    item={null}
                    slotType="safePocket"
                    isEmpty={true}
                    isEditMode={false}
                    size="lg"
                    className="mx-auto"
                    showLock={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Backpack */}
        <div className="flex flex-col space-y-3 h-full">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
              الحقيبة
            </h3>
            <span className="text-xs font-bold text-foreground">
              {filledBackpackSlots}/{slotConfig.backpackSlots}
            </span>
          </div>
          <div className="flex-1 rounded-lg border border-border bg-card/60 p-3 flex items-center justify-center">
            <div className="grid grid-cols-4 gap-2" dir="ltr">
              {loadoutData.backpack.map((itemId, idx) => (
                <LoadoutSlot
                  key={`backpack-${idx}`}
                  item={getItemForSlot(itemId)}
                  slotType="backpack"
                  slotIndex={idx}
                  isEmpty={!itemId}
                  isEditMode={isEditMode}
                  onClick={() => handleSlotClick('backpack', idx)}
                  size="lg"
                  quantity={100}
                  className="!h-24 !w-24"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Equipment */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">المعدات</h3>

          {/* Top Row: Bag and Shield */}
          <div className="grid grid-cols-2 gap-3">
            {/* Augment/Bag */}
            <div className="rounded-lg border border-border bg-card/60 p-2">
              <LoadoutSlot
                item={getItemForSlot(loadoutData.augment)}
                slotType="augment"
                isEmpty={!loadoutData.augment}
                isEditMode={isEditMode}
                onClick={() => handleSlotClick('augment')}
                size="lg"
                className="mx-auto"
              />
              {bagItem && (
                <p className="mt-1.5 text-center text-[10px] font-medium text-primary">
                  100/100
                </p>
              )}
            </div>

            {/* Shield */}
            <div className="rounded-lg border border-border bg-card/60 p-2">
              <LoadoutSlot
                item={getItemForSlot(loadoutData.shield)}
                slotType="shield"
                isEmpty={!loadoutData.shield}
                isEditMode={isEditMode}
                onClick={() => handleSlotClick('shield')}
                size="lg"
                className="mx-auto"
              />
              {getItemForSlot(loadoutData.shield) && (
                <p className="mt-1.5 text-center text-[10px] font-medium text-primary">
                  100/100
                </p>
              )}
            </div>
          </div>

          {/* Primary Weapon */}
          <div className="rounded-lg border border-border bg-card/60 p-3">
            <LoadoutSlot
              item={getItemForSlot(loadoutData.weaponprimary)}
              slotType="weaponprimary"
              isEmpty={!loadoutData.weaponprimary}
              isEditMode={isEditMode}
              onClick={() => handleSlotClick('weaponprimary')}
              size="weapon"
              className="mb-3"
            />
            <div className="mb-2 grid grid-cols-4 gap-1.5">
              {loadoutData.primaryAttachments.map((attachId, idx) => (
                <LoadoutSlot
                  key={`primary-attach-${idx}`}
                  item={getItemForSlot(attachId)}
                  slotType="primaryAttachments"
                  slotIndex={idx}
                  isEmpty={!attachId}
                  isEditMode={isEditMode}
                  onClick={() => handleSlotClick('primaryAttachments', idx)}
                  size="sm"
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4h12v2H4z" />
                  <path d="M6 8h8v2H6z" />
                </svg>
                <span>0/6</span>
              </div>
              <span className="text-primary">99/100</span>
            </div>
          </div>

          {/* Secondary Weapon */}
          <div className="rounded-lg border border-border bg-card/60 p-3">
            <LoadoutSlot
              item={getItemForSlot(loadoutData.weaponsecondary)}
              slotType="weaponsecondary"
              isEmpty={!loadoutData.weaponsecondary}
              isEditMode={isEditMode}
              onClick={() => handleSlotClick('weaponsecondary')}
              size="weapon"
              className="mb-3"
            />
            <div className="mb-2 grid grid-cols-4 gap-1.5">
              {loadoutData.secondaryAttachments.map((attachId, idx) => (
                <LoadoutSlot
                  key={`secondary-attach-${idx}`}
                  item={getItemForSlot(attachId)}
                  slotType="secondaryAttachments"
                  slotIndex={idx}
                  isEmpty={!attachId}
                  isEditMode={isEditMode}
                  onClick={() => handleSlotClick('secondaryAttachments', idx)}
                  size="sm"
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="4" y="6" width="3" height="8" />
                  <rect x="8" y="6" width="3" height="8" />
                  <rect x="12" y="6" width="3" height="8" />
                </svg>
                <span>0/30</span>
              </div>
              <span className="text-primary">91/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Form - Collapsible */}
      <details className="rounded-lg border border-border bg-card/60" open={!name}>
        <summary className="cursor-pointer p-4 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-muted/60">
          تفاصيل الحمولة
        </summary>
        <div className="space-y-4 p-4 pt-0">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">الاسم *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم الحمولة"
              disabled={!isEditMode}
              className="border border-border bg-input transition-all focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground">الوصف</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل الوصف (اختياري)"
              disabled={!isEditMode}
              className="border border-border bg-input transition-all focus:border-primary"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">الوسوم</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="أضف وسم"
                disabled={!isEditMode}
                className="border border-border bg-input transition-all focus:border-primary"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={!isEditMode || !tagInput.trim()}
                variant="outline"
              >
                إضافة
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1.5 text-xs">
                    {tag}
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="mr-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/60 p-3">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={!isEditMode}
            />
            <Label htmlFor="public" className="cursor-pointer text-xs font-medium text-muted-foreground">
              حمولة عامة (مرئية للجميع)
            </Label>
          </div>
        </div>
      </details>

      {/* Save Button */}
      {isEditMode && (
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || !name.trim()}
            size="lg"
            className="min-w-[180px] text-base font-semibold shadow-md"
          >
            {isSaving && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
            {!isSaving && 'حفظ الحمولة'}
          </Button>
        </div>
      )}

      {/* Item Selection Dialog */}
      <ItemSelectionDialog
        open={selectionDialog.open}
        onOpenChange={(open) => setSelectionDialog({ ...selectionDialog, open })}
        slotType={selectionDialog.slotType}
        onSelect={handleItemSelect}
        selectedItemId={
          selectionDialog.slotIndex !== undefined
            ? (loadoutData[selectionDialog.slotType as keyof LoadoutData] as (string | null)[])[
                selectionDialog.slotIndex
              ]
            : (loadoutData[selectionDialog.slotType as keyof LoadoutData] as string | null)
        }
      />
    </div>
  );
}

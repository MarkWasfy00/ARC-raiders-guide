'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search, X, Lock } from 'lucide-react';
import { SUBCATEGORY_ICONS, type MarkerCategory, type MapMarker } from '../types';

interface MapSidebarProps {
  categories: MarkerCategory[];
  markers: MapMarker[];
  onCategoryToggle: (categoryId: string) => void;
  onSubcategoryToggle: (categoryId: string, subcategory: string) => void;
  onLootAreaToggle: (lootArea: string) => void;
  onLockedDoorToggle: () => void;
  onToggleAll: (enabled: boolean) => void;
  enabledSubcategories: Record<string, Set<string>>;
  enabledLootAreas: Set<string>;
  showLockedOnly: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showAreaLabels: boolean;
  onAreaLabelsToggle: () => void;
}

export function MapSidebar({
  categories,
  markers,
  onCategoryToggle,
  onSubcategoryToggle,
  onLootAreaToggle,
  onLockedDoorToggle,
  onToggleAll,
  enabledSubcategories,
  enabledLootAreas,
  showLockedOnly,
  searchQuery,
  onSearchChange,
  showAreaLabels,
  onAreaLabelsToggle,
}: MapSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showLootAreas, setShowLootAreas] = useState(false);

  const allEnabled = categories.every((cat) => cat.enabled);

  // Calculate subcategory counts
  const subcategoryCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    markers.forEach((marker) => {
      if (!counts[marker.category]) {
        counts[marker.category] = {};
      }
      if (marker.subcategory) {
        counts[marker.category][marker.subcategory] =
          (counts[marker.category][marker.subcategory] || 0) + 1;
      }
    });
    return counts;
  }, [markers]);

  // Calculate loot area counts
  const lootAreaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    markers.forEach((marker) => {
      if (marker.lootAreas) {
        marker.lootAreas.forEach((area) => {
          counts[area] = (counts[area] || 0) + 1;
        });
      }
    });
    return counts;
  }, [markers]);

  // Get unique loot areas
  const allLootAreas = useMemo(() => {
    return Object.keys(lootAreaCounts).sort();
  }, [lootAreaCounts]);

  // Calculate total markers per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    markers.forEach((marker) => {
      counts[marker.category] = (counts[marker.category] || 0) + 1;
    });
    return counts;
  }, [markers]);

  // Count locked markers
  const lockedCount = useMemo(() => {
    return markers.filter((m) => m.behindLockedDoor).length;
  }, [markers]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const formatSubcategoryLabel = (subcategory: string) => {
    return subcategory.replace(/_/g, ' ').replace(/-/g, ' ');
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`absolute top-0 left-0 bottom-0 z-[1000] bg-gradient-to-b from-background/95 to-background/98 backdrop-blur-sm border-r border-border/50 shadow-2xl transition-all duration-300 ${
          isCollapsed ? 'w-0' : 'w-96'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="relative p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  تصفية الخريطة
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {markers.length} موقع متاح
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث عن موقع..."
                className="w-full pr-10 pl-8 py-2.5 text-sm rounded-lg border border-border/50 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1 hover:bg-background rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onToggleAll(!allEnabled)}
                className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                {allEnabled ? 'إخفاء الكل' : 'إظهار الكل'}
              </button>
              <button
                onClick={onLockedDoorToggle}
                className={`p-2 rounded-lg transition-all ${
                  showLockedOnly
                    ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/50'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                }`}
                title="الأبواب المقفلة فقط"
              >
                <Lock className="w-4 h-4" />
              </button>
              <button
                onClick={onAreaLabelsToggle}
                className={`p-2 rounded-lg transition-all ${
                  showAreaLabels
                    ? 'bg-blue-500/20 text-blue-600 border border-blue-500/50'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                }`}
                title="أسماء المناطق"
              >
                <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Loot Areas Toggle */}
          <div className="px-4 pb-3">
            <button
              onClick={() => setShowLootAreas(!showLootAreas)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30"
            >
              <span className="font-medium">مناطق النهب</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">({allLootAreas.length})</span>
                {showLootAreas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
          </div>

          {/* Loot Areas Section */}
          {showLootAreas && (
            <div className="px-4 pb-4 border-b border-border/50">
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                {allLootAreas.map((area) => {
                  const isEnabled = enabledLootAreas.has(area);
                  return (
                    <button
                      key={area}
                      onClick={() => onLootAreaToggle(area)}
                      className={`flex flex-col items-start px-3 py-2 text-xs rounded-lg transition-all ${
                        isEnabled
                          ? 'bg-blue-500/20 border-2 border-blue-500/50 shadow-sm'
                          : 'bg-muted/30 border-2 border-transparent hover:border-border/50'
                      }`}
                    >
                      <span className="font-medium truncate w-full">{area}</span>
                      <span className="text-muted-foreground">({lootAreaCounts[area]})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Filters - Accordion Style */}
          <div className="flex-1 overflow-y-auto p-4">
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground px-1">الفئات</h4>

            {/* Categories List */}
            <div className="space-y-2">
              {categories.map((category) => {
                const isExpanded = expandedCategories.has(category.id);
                const subcategories = subcategoryCounts[category.id] || {};
                const subcategoryList = Object.entries(subcategories).sort((a, b) => b[1] - a[1]);
                const enabledSubs = enabledSubcategories[category.id] || new Set();
                const count = categoryCounts[category.id] || 0;

                return (
                  <div
                    key={category.id}
                    className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                      category.enabled
                        ? 'border-border/50 shadow-lg'
                        : 'border-transparent bg-muted/20'
                    }`}
                    style={{
                      borderColor: category.enabled ? category.color + '30' : undefined,
                      boxShadow: category.enabled ? `0 4px 12px ${category.color}20` : undefined,
                    }}
                  >
                    {/* Category Header */}
                    <div
                      className={`relative transition-all ${
                        category.enabled ? 'bg-gradient-to-r from-muted/60 to-muted/30' : 'bg-muted/30'
                      }`}
                      style={{
                        background: category.enabled
                          ? `linear-gradient(to right, ${category.color}15, transparent)`
                          : undefined,
                      }}
                    >
                      <div className="flex items-center gap-3 p-3">
                        {/* Enable/Disable Toggle */}
                        <button
                          onClick={() => onCategoryToggle(category.id)}
                          className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            category.enabled ? 'scale-100' : 'scale-90 opacity-70'
                          }`}
                          style={{
                            borderColor: category.color,
                            backgroundColor: category.enabled ? category.color : 'transparent',
                            boxShadow: category.enabled ? `0 0 12px ${category.color}60` : 'none',
                          }}
                        >
                          {category.enabled && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>

                        {/* Category Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-sm font-bold truncate" style={{ color: category.enabled ? category.color : undefined }}>
                              {category.label}
                            </h5>
                            <span className="text-xs text-muted-foreground font-mono bg-background/50 px-2 py-0.5 rounded">
                              {count}
                            </span>
                          </div>
                        </div>

                        {/* Expand Toggle */}
                        {subcategoryList.length > 0 && (
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                              isExpanded ? 'bg-background/60' : 'hover:bg-background/40'
                            }`}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Subcategories */}
                    {isExpanded && subcategoryList.length > 0 && (
                      <div className="bg-background/40 backdrop-blur-sm border-t border-border/30">
                        <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                          {subcategoryList.map(([subcategory, subCount]) => {
                            const isEnabled = enabledSubs.has(subcategory);
                            const subcategoryIconPath = SUBCATEGORY_ICONS[subcategory];
                            return (
                              <button
                                key={subcategory}
                                onClick={() => onSubcategoryToggle(category.id, subcategory)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                                  isEnabled
                                    ? 'bg-gradient-to-r from-muted/90 to-muted/60 shadow-sm'
                                    : 'bg-background/60 hover:bg-muted/40'
                                }`}
                                style={{
                                  background: isEnabled
                                    ? `linear-gradient(to right, ${category.color}15, transparent)`
                                    : undefined,
                                }}
                              >
                                {/* Status Indicator */}
                                <div
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                                    isEnabled ? 'scale-125' : 'scale-75 opacity-40'
                                  }`}
                                  style={{
                                    backgroundColor: isEnabled ? category.color : category.color + '60',
                                    boxShadow: isEnabled ? `0 0 8px ${category.color}80` : 'none',
                                  }}
                                />

                                {/* Icon */}
                                {subcategoryIconPath && (
                                  <div className={`flex-shrink-0 transition-transform ${isEnabled ? 'scale-100' : 'scale-90 opacity-70'}`}>
                                    <img
                                      src={subcategoryIconPath}
                                      alt=""
                                      className="w-6 h-6 object-contain"
                                    />
                                  </div>
                                )}

                                {/* Name */}
                                <span className={`text-sm flex-1 text-right transition-all ${
                                  isEnabled ? 'font-semibold' : 'font-medium text-muted-foreground'
                                }`}>
                                  {formatSubcategoryLabel(subcategory)}
                                </span>

                                {/* Count Badge */}
                                <span className={`text-xs font-mono px-2 py-0.5 rounded transition-all ${
                                  isEnabled
                                    ? 'bg-background/80 text-foreground'
                                    : 'bg-muted/50 text-muted-foreground'
                                }`}>
                                  {subCount}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Footer */}
          <div className="p-4 border-t border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
            <div className="flex items-center justify-between text-xs">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-medium">
                    {categories.reduce((sum, cat) => sum + (cat.enabled ? 1 : 0), 0)} / {categories.length} نشط
                  </span>
                </div>
                <span className="text-muted-foreground">
                  إجمالي العلامات: {markers.length}
                </span>
              </div>
              {lockedCount > 0 && (
                <div className="flex items-center gap-1 text-yellow-600 bg-yellow-500/10 px-2 py-1 rounded">
                  <Lock className="w-3 h-3" />
                  <span>{lockedCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Collapse Button (outside sidebar, visible when open) */}
      {!isCollapsed && (
        <button
          onClick={() => setIsCollapsed(true)}
          className="absolute top-1/2 -translate-y-1/2 left-96 z-[1000] p-2 bg-primary text-white rounded-r-lg shadow-xl hover:bg-primary/90 transition-all hover:scale-110 border border-l-0 border-primary/50"
          aria-label="إخفاء الشريط الجانبي"
          title="إخفاء الشريط الجانبي"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Expand Button (when collapsed) */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute top-1/2 -translate-y-1/2 left-0 z-[1000] p-2 bg-primary text-white rounded-r-lg shadow-xl hover:bg-primary/90 transition-all hover:scale-110 border border-l-0 border-primary/50 animate-pulse hover:animate-none"
          aria-label="إظهار الشريط الجانبي"
          title="إظهار الشريط الجانبي"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </>
  );
}

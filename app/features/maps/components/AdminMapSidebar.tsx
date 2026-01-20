'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search, X, Lock, Shield, Pencil, MapPin, Type, Save, Eye, EyeOff, Filter, Route, Trash2, Plus } from 'lucide-react';
import { SUBCATEGORY_ICONS, type MarkerCategory, type MapMarker } from '../types';
import type { MapRoute } from './RouteDisplay';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogPortal,
  AlertDialogOverlay,
} from '@/components/ui/alert-dialog';

const ROUTE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
  '#A8E6CF', '#FFD93D', '#6BCF7F', '#C7CEEA', '#FF8B94'
];

interface AdminMapSidebarProps {
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
  showRegions: boolean;
  onRegionsToggle: () => void;
  // Admin tool handlers
  onDrawRegion?: () => void;
  onAddMarker?: () => void;
  onAddLabel?: () => void;
  onSavePosition?: () => void;
  isDrawingRegion?: boolean;
  isAddingMarker?: boolean;
  isAddingLabel?: boolean;
  // Route props (optional for logged-in users)
  routes?: MapRoute[];
  onDrawRoute?: (routeNumber: number) => void;
  onToggleRouteVisibility?: (routeId: string, routeNumber: number) => void;
  onEditRoute?: (routeId: string, routeNumber: number) => void;
  onDeleteRoute?: (routeId: string) => void;
  showRoutes?: boolean;
}

export function AdminMapSidebar({
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
  showRegions,
  onRegionsToggle,
  onDrawRegion,
  onAddMarker,
  onAddLabel,
  onSavePosition,
  isDrawingRegion = false,
  isAddingMarker = false,
  isAddingLabel = false,
  routes = [],
  onDrawRoute,
  onToggleRouteVisibility,
  onEditRoute,
  onDeleteRoute,
  showRoutes = false,
}: AdminMapSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showLootAreas, setShowLootAreas] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [activeTab, setActiveTab] = useState<'filters' | 'routes'>('filters');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<{ id: string; name: string | null } | null>(null);

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

  // Create map of route number to route
  const routeMap = new Map<number, MapRoute>();
  routes.forEach(route => {
    routeMap.set(route.routeNumber, route);
  });

  const handleDeleteRoute = (routeId: string, routeName: string | null) => {
    setRouteToDelete({ id: routeId, name: routeName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRoute = () => {
    if (routeToDelete && onDeleteRoute) {
      onDeleteRoute(routeToDelete.id);
    }
    setDeleteDialogOpen(false);
    setRouteToDelete(null);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`absolute top-0 left-0 bottom-0 z-[1000] bg-gradient-to-b from-destructive/5 via-background/98 to-background/95 backdrop-blur-sm border-r-2 border-destructive/30 shadow-2xl transition-all duration-300 ${
          isCollapsed ? 'w-0' : 'w-96'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Admin Header */}
          <div className="relative p-4 border-b-2 border-destructive/30 bg-gradient-to-r from-destructive/15 via-destructive/10 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
                  لوحة التحكم
                </h3>
                <p className="text-xs text-muted-foreground">
                  {markers.length} موقع • وضع الإدارة
                </p>
              </div>
            </div>

            {/* Tabs */}
            {showRoutes && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setActiveTab('filters')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'filters'
                      ? 'bg-destructive text-destructive-foreground shadow-md'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>الفلاتر</span>
                </button>
                <button
                  onClick={() => setActiveTab('routes')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'routes'
                      ? 'bg-destructive text-destructive-foreground shadow-md'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Route className="w-4 h-4" />
                  <span>المسارات</span>
                </button>
              </div>
            )}

            {/* Admin Tools Quick Access */}
            <div className="grid grid-cols-2 gap-2">
              {onDrawRegion && (
                <button
                  onClick={onDrawRegion}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 ${
                    isDrawingRegion
                      ? 'bg-purple-500/25 border-2 border-purple-500/60 shadow-lg'
                      : 'bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">
                    {isDrawingRegion ? 'جاري الرسم...' : 'رسم منطقة'}
                  </span>
                </button>
              )}
              {onAddMarker && (
                <button
                  onClick={onAddMarker}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 ${
                    isAddingMarker
                      ? 'bg-blue-500/25 border-2 border-blue-500/60 shadow-lg'
                      : 'bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    {isAddingMarker ? 'جاري الإضافة...' : 'إضافة علامة'}
                  </span>
                </button>
              )}
              {onAddLabel && (
                <button
                  onClick={onAddLabel}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 ${
                    isAddingLabel
                      ? 'bg-yellow-500/25 border-2 border-yellow-500/60 shadow-lg'
                      : 'bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20'
                  }`}
                >
                  <Type className="w-3.5 h-3.5 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700">
                    {isAddingLabel ? 'جاري الإضافة...' : 'إضافة عنوان'}
                  </span>
                </button>
              )}
              {onSavePosition && (
                <button
                  onClick={onSavePosition}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg transition-all hover:scale-105 hover:bg-green-500/20"
                >
                  <Save className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium text-green-700">حفظ الموضع</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters Tab Content */}
          {activeTab === 'filters' && (
            <>
              {/* Toggle Filters Section */}
              <div className="px-4 pt-3 pb-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted/60 border border-border/50 transition-all"
            >
              <div className="flex items-center gap-2">
                {showFilters ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-sm font-semibold">الفلاتر والتصنيفات</span>
              </div>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Filters Section - Collapsible */}
          {showFilters && (
            <>
              {/* Search */}
              <div className="px-4 pb-3 space-y-3">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="ابحث عن موقع..."
                    className="w-full pr-10 pl-8 py-2.5 text-sm rounded-lg border border-destructive/20 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-destructive/50 focus:border-destructive transition-all"
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
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                  >
                    {allEnabled ? 'إخفاء الكل' : 'إظهار الكل'}
                  </button>
                  <button
                    onClick={onLockedDoorToggle}
                    className={`p-2 rounded-lg transition-all ${
                      showLockedOnly
                        ? 'bg-yellow-500/20 text-yellow-600 border-2 border-yellow-500/50'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground border border-border/30'
                    }`}
                    title="الأبواب المقفلة فقط"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onAreaLabelsToggle}
                    className={`p-2 rounded-lg transition-all ${
                      showAreaLabels
                        ? 'bg-blue-500/20 text-blue-600 border-2 border-blue-500/50'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground border border-border/30'
                    }`}
                    title="أسماء المناطق"
                  >
                    <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </button>
                  <button
                    onClick={onRegionsToggle}
                    className={`p-2 rounded-lg transition-all ${
                      showRegions
                        ? 'bg-purple-500/20 text-purple-600 border-2 border-purple-500/50'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground border border-border/30'
                    }`}
                    title="المناطق المحددة"
                  >
                    <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Loot Areas Toggle */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => setShowLootAreas(!showLootAreas)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-destructive/20"
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
                <div className="px-4 pb-4 border-b border-destructive/20">
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
                              : 'bg-muted/30 border-2 border-transparent hover:border-destructive/30'
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
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="text-sm font-semibold text-muted-foreground">الفئات</h4>
                  <span className="text-xs text-destructive font-mono bg-destructive/10 px-2 py-0.5 rounded">
                    {categories.reduce((sum, cat) => sum + (cat.enabled ? 1 : 0), 0)}/{categories.length}
                  </span>
                </div>

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
                            ? 'border-destructive/20 shadow-lg shadow-destructive/5'
                            : 'border-transparent bg-muted/20'
                        }`}
                        style={{
                          borderColor: category.enabled ? category.color + '40' : undefined,
                          boxShadow: category.enabled ? `0 4px 12px ${category.color}15` : undefined,
                        }}
                      >
                        {/* Category Header */}
                        <div
                          className={`relative transition-all ${
                            category.enabled ? 'bg-gradient-to-r from-muted/60 to-muted/30' : 'bg-muted/30'
                          }`}
                          style={{
                            background: category.enabled
                              ? `linear-gradient(to right, ${category.color}20, transparent)`
                              : undefined,
                          }}
                        >
                          <div className="flex items-center gap-3 p-3">
                            {/* Enable/Disable Toggle */}
                            <button
                              onClick={() => onCategoryToggle(category.id)}
                              className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                category.enabled ? 'scale-110' : 'scale-90 opacity-70'
                              }`}
                              style={{
                                borderColor: category.color,
                                backgroundColor: category.enabled ? category.color : 'transparent',
                                boxShadow: category.enabled ? `0 0 16px ${category.color}70` : 'none',
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
                                <span className="text-xs text-muted-foreground font-mono bg-background/60 px-2 py-0.5 rounded">
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
                                        ? `linear-gradient(to right, ${category.color}20, transparent)`
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
                                        boxShadow: isEnabled ? `0 0 10px ${category.color}90` : 'none',
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
                                        ? 'bg-background/80 text-foreground font-semibold'
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
            </>
          )}
            </>
          )}

          {/* Routes Tab Content */}
          {activeTab === 'routes' && showRoutes && (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(routeNumber => {
                  const route = routeMap.get(routeNumber);
                  const color = ROUTE_COLORS[routeNumber - 1];
                  const isVisible = route?.visible || false;

                  return (
                    <div
                      key={routeNumber}
                      className="flex items-center gap-2 p-2 rounded-lg border-2 hover:bg-accent/50 transition-colors"
                      style={{
                        borderColor: route ? color : 'transparent',
                        backgroundColor: isVisible ? `${color}10` : 'transparent',
                      }}
                    >
                      {/* Color indicator */}
                      <div
                        className="w-6 h-6 rounded-full border-2 flex-shrink-0"
                        style={{
                          backgroundColor: color,
                          borderColor: route ? '#ffffff' : color,
                          opacity: route ? 1 : 0.3,
                        }}
                      />

                      {/* Route info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">
                          مسار {routeNumber}
                        </div>
                        {route && (route.nameAr || route.name) && (
                          <div className="text-xs text-muted-foreground truncate">
                            {route.nameAr || route.name}
                          </div>
                        )}
                        {!route && (
                          <div className="text-xs text-muted-foreground">فارغ</div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {route ? (
                          <>
                            <button
                              onClick={() => onToggleRouteVisibility && onToggleRouteVisibility(route.id, routeNumber)}
                              className="p-1.5 hover:bg-background rounded transition-colors"
                              title={isVisible ? 'إخفاء المسار' : 'إظهار المسار'}
                            >
                              {isVisible ? (
                                <Eye className="w-4 h-4 text-primary" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                            <button
                              onClick={() => onEditRoute && onEditRoute(route.id, routeNumber)}
                              className="p-1.5 hover:bg-background rounded transition-colors"
                              title="تعديل المسار"
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleDeleteRoute(route.id, route.nameAr || route.name)}
                              className="p-1.5 hover:bg-destructive/10 rounded transition-colors"
                              title="حذف المسار"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onDrawRoute && onDrawRoute(routeNumber)}
                            className="p-1.5 hover:bg-primary/10 rounded transition-colors"
                            title="رسم مسار جديد"
                          >
                            <Plus className="w-4 h-4 text-primary" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin Stats Footer */}
          <div className="p-4 border-t-2 border-destructive/30 bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent">
            <div className="flex items-center justify-between text-xs">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-destructive" />
                  <span className="font-semibold text-destructive">وضع الإدارة</span>
                </div>
                <span className="text-muted-foreground">
                  إجمالي العلامات: <span className="font-mono font-semibold text-foreground">{markers.length}</span>
                </span>
              </div>
              {lockedCount > 0 && (
                <div className="flex items-center gap-1.5 text-yellow-600 bg-yellow-500/15 px-2.5 py-1.5 rounded-lg border border-yellow-500/30">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="font-semibold">{lockedCount}</span>
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
          className="absolute top-1/2 -translate-y-1/2 left-96 z-[1000] p-2 bg-destructive text-white rounded-r-lg shadow-xl hover:bg-destructive/90 transition-all hover:scale-110 border border-l-0 border-destructive/50"
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
          className="absolute top-1/2 -translate-y-1/2 left-0 z-[1000] p-2 bg-destructive text-white rounded-r-lg shadow-xl hover:bg-destructive/90 transition-all hover:scale-110 border border-l-0 border-destructive/50 animate-pulse hover:animate-none"
          aria-label="إظهار الشريط الجانبي"
          title="إظهار الشريط الجانبي"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogPortal>
          <AlertDialogOverlay className="z-[9999]" />
          <AlertDialogContent className="z-[10000]">
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف {routeToDelete?.name || 'هذا المسار'}؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteRoute}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  );
}

'use client';

import { useState } from 'react';
import { Route, Eye, EyeOff, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MapRoute } from './RouteDisplay';

const ROUTE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
  '#A8E6CF', '#FFD93D', '#6BCF7F', '#C7CEEA', '#FF8B94'
];

interface RouteSidebarProps {
  routes: MapRoute[];
  onDrawRoute: (routeNumber: number) => void;
  onToggleVisibility: (routeId: string, routeNumber: number) => void;
  onEditRoute: (routeId: string, routeNumber: number) => void;
  onDeleteRoute: (routeId: string) => void;
}

export function RouteSidebar({
  routes,
  onDrawRoute,
  onToggleVisibility,
  onEditRoute,
  onDeleteRoute,
}: RouteSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Create map of route number to route
  const routeMap = new Map<number, MapRoute>();
  routes.forEach(route => {
    routeMap.set(route.routeNumber, route);
  });

  const handleDelete = async (routeId: string, routeName: string | null) => {
    const confirmed = confirm(
      `هل أنت متأكد من حذف ${routeName || 'هذا المسار'}؟`
    );
    if (confirmed) {
      onDeleteRoute(routeId);
    }
  };

  if (collapsed) {
    return (
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[1000]">
        <button
          onClick={() => setCollapsed(false)}
          className="p-3 bg-background border-2 border-border rounded-lg shadow-lg hover:bg-accent transition-colors"
          title="فتح قائمة المسارات"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[1000] max-h-[80vh] overflow-auto">
      <div className="bg-background border-2 border-border rounded-xl shadow-2xl w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">مساراتي</h3>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 hover:bg-accent rounded transition-colors"
            title="طي القائمة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Route Slots */}
        <div className="p-3 space-y-2">
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
                        onClick={() => onToggleVisibility(route.id, routeNumber)}
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
                        onClick={() => onEditRoute(route.id, routeNumber)}
                        className="p-1.5 hover:bg-background rounded transition-colors"
                        title="تعديل المسار"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(route.id, route.nameAr || route.name)}
                        className="p-1.5 hover:bg-destructive/10 rounded transition-colors"
                        title="حذف المسار"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onDrawRoute(routeNumber)}
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
    </div>
  );
}

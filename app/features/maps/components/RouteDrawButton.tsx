'use client';

import { useState, useRef, useEffect } from 'react';
import { Route, X, Save } from 'lucide-react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const ROUTE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
  '#A8E6CF', '#FFD93D', '#6BCF7F', '#C7CEEA', '#FF8B94'
];

interface RouteDrawButtonProps {
  mapId: string;
  routeSlot: number; // 1-10
  existingRoute?: {
    id: string;
    coordinates: Array<{ lat: number; lng: number }>;
    name?: string | null;
    nameAr?: string | null;
  } | null;
  onRouteDrawn?: () => void;
  onCancel?: () => void;
  isDrawing: boolean;
  onDrawingStateChange?: (isDrawing: boolean) => void;
}

export function RouteDrawButton({
  mapId,
  routeSlot,
  existingRoute,
  onRouteDrawn,
  onCancel,
  isDrawing,
  onDrawingStateChange,
}: RouteDrawButtonProps) {
  const map = useMap();
  const [points, setPoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const pointMarkersRef = useRef<L.CircleMarker[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');

  const routeColor = ROUTE_COLORS[routeSlot - 1];

  // Load existing route coordinates if editing
  useEffect(() => {
    if (existingRoute && isDrawing && points.length === 0) {
      setPoints(existingRoute.coordinates);
      setName(existingRoute.name || '');
      setNameAr(existingRoute.nameAr || '');

      // Draw existing route
      if (existingRoute.coordinates.length >= 2) {
        const line = L.polyline(
          existingRoute.coordinates.map(p => [p.lat, p.lng]),
          {
            color: routeColor,
            weight: 4,
            dashArray: '10, 10',
          }
        ).addTo(map);
        polylineRef.current = line;

        // Add markers for existing points
        existingRoute.coordinates.forEach((point) => {
          const marker = L.circleMarker([point.lat, point.lng], {
            radius: 6,
            color: routeColor,
            fillColor: '#ffffff',
            fillOpacity: 1,
            weight: 2,
          }).addTo(map);
          pointMarkersRef.current.push(marker);
        });
      }
    }
  }, [existingRoute, isDrawing]);

  useEffect(() => {
    if (!isDrawing) return;

    // Enable clicks on the map
    (map as any)._clickEnabled = true;

    // Add custom cursor
    const container = map.getContainer();
    container.style.cursor = 'crosshair';

    // Add click handler
    const clickHandler = (e: L.LeafletMouseEvent) => {
      if (!(map as any)._clickEnabled) return;

      // Check if click is on a control element
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.leaflet-control') || target.closest('button')) {
        return;
      }

      const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng };

      setPoints(prev => {
        const updated = [...prev, newPoint];

        // Add visual marker for the point
        const marker = L.circleMarker([newPoint.lat, newPoint.lng], {
          radius: 6,
          color: routeColor,
          fillColor: '#ffffff',
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);

        pointMarkersRef.current.push(marker);

        // Draw polyline connecting all points
        if (updated.length >= 2) {
          if (polylineRef.current) {
            polylineRef.current.setLatLngs(updated.map(p => [p.lat, p.lng]));
          } else {
            const line = L.polyline(
              updated.map(p => [p.lat, p.lng]),
              {
                color: routeColor,
                weight: 4,
                dashArray: '10, 10',
              }
            ).addTo(map);
            polylineRef.current = line;
          }
        }

        return updated;
      });
    };

    // Add double-click handler to finish
    const dblClickHandler = (e: L.LeafletMouseEvent) => {
      e.originalEvent.preventDefault();
      finishDrawing();
    };

    map.on('click', clickHandler);
    map.on('dblclick', dblClickHandler);
    (map as any)._routeClickHandler = clickHandler;
    (map as any)._routeDblClickHandler = dblClickHandler;

    return () => {
      if ((map as any)._routeClickHandler) {
        map.off('click', (map as any)._routeClickHandler);
        delete (map as any)._routeClickHandler;
      }
      if ((map as any)._routeDblClickHandler) {
        map.off('dblclick', (map as any)._routeDblClickHandler);
        delete (map as any)._routeDblClickHandler;
      }
    };
  }, [isDrawing, routeColor]);

  const cancelDrawing = () => {
    (map as any)._clickEnabled = false;

    // Remove click handlers
    if ((map as any)._routeClickHandler) {
      map.off('click', (map as any)._routeClickHandler);
      delete (map as any)._routeClickHandler;
    }
    if ((map as any)._routeDblClickHandler) {
      map.off('dblclick', (map as any)._routeDblClickHandler);
      delete (map as any)._routeDblClickHandler;
    }

    // Reset cursor
    const container = map.getContainer();
    container.style.cursor = '';

    // Remove polyline from map
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Remove all point markers
    pointMarkersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    pointMarkersRef.current = [];

    // Reset state
    setPoints([]);
    setName('');
    setNameAr('');
    if (onDrawingStateChange) onDrawingStateChange(false);
    if (onCancel) onCancel();
  };

  const finishDrawing = () => {
    if (points.length < 2) {
      alert('يجب رسم نقطتين على الأقل لإنشاء مسار');
      return;
    }

    (map as any)._clickEnabled = false;
    setShowSaveDialog(true);

    // Remove click handlers
    if ((map as any)._routeClickHandler) {
      map.off('click', (map as any)._routeClickHandler);
      delete (map as any)._routeClickHandler;
    }
    if ((map as any)._routeDblClickHandler) {
      map.off('dblclick', (map as any)._routeDblClickHandler);
      delete (map as any)._routeDblClickHandler;
    }

    // Reset cursor
    const container = map.getContainer();
    container.style.cursor = '';
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (existingRoute) {
        // Update existing route
        const response = await fetch(`/api/maps/routes/${existingRoute.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coordinates: points,
            name: name.trim() || null,
            nameAr: nameAr.trim() || null,
          }),
        });

        const data = await response.json();
        if (data.success) {
          alert('✅ تم تحديث المسار بنجاح!');
        } else {
          alert('❌ فشل في تحديث المسار: ' + data.error);
        }
      } else {
        // Create new route
        const response = await fetch('/api/maps/routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mapId,
            routeNumber: routeSlot,
            name: name.trim() || null,
            nameAr: nameAr.trim() || null,
            coordinates: points,
          }),
        });

        const data = await response.json();
        if (data.success) {
          alert('✅ تم حفظ المسار بنجاح!');
        } else {
          alert('❌ فشل في حفظ المسار: ' + data.error);
        }
      }

      // Reset everything
      setShowSaveDialog(false);
      setPoints([]);
      setName('');
      setNameAr('');

      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }

      pointMarkersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      pointMarkersRef.current = [];

      if (onDrawingStateChange) onDrawingStateChange(false);
      if (onRouteDrawn) onRouteDrawn();
    } catch (error) {
      console.error('Error saving route:', error);
      alert('❌ حدث خطأ أثناء حفظ المسار');
    } finally {
      setSaving(false);
    }
  };

  if (!isDrawing) return null;

  return (
    <>
      <div
        className="leaflet-top leaflet-left"
        style={{ marginTop: '150px', marginLeft: '10px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="leaflet-control">
          <div className="flex flex-col gap-2">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg">
              <div className="font-bold text-sm">رسم المسار {routeSlot}</div>
              <div className="text-xs mt-1">النقاط: {points.length}</div>
              <div className="text-xs mt-1">انقر نقرتين للإنهاء</div>
            </div>
            <button
              onClick={finishDrawing}
              disabled={points.length < 2}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg shadow-lg font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              إنهاء الرسم
            </button>
            <button
              onClick={cancelDrawing}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg font-semibold transition-colors"
            >
              <X className="w-4 h-4" />
              إلغاء
            </button>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-background border-2 border-border rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <Route className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">حفظ المسار {routeSlot}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  اسم المسار (بالإنجليزية)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Main Route"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  اسم المسار (بالعربية)
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="مثال: المسار الرئيسي"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div
                  className="w-8 h-8 rounded border-2"
                  style={{ backgroundColor: routeColor }}
                />
                <div className="text-sm">
                  <div className="font-semibold">لون المسار</div>
                  <div className="text-xs text-muted-foreground">{routeColor}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground rounded-lg font-bold transition-all"
              >
                {saving ? 'جاري الحفظ...' : '💾 حفظ'}
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  cancelDrawing();
                }}
                disabled={saving}
                className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-lg font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

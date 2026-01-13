'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil, X, Save } from 'lucide-react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface DrawRegionButtonProps {
  mapId: string;
  onRegionDrawn?: () => void;
  onDrawingStateChange?: (isDrawing: boolean) => void;
  triggerStart?: boolean;
  hideUI?: boolean;
}

export function DrawRegionButton({ mapId, onRegionDrawn, onDrawingStateChange, triggerStart, hideUI = false }: DrawRegionButtonProps) {
  const map = useMap();
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const polygonRef = useRef<L.Polygon | L.Polyline | null>(null);
  const pointMarkersRef = useRef<L.Marker[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isClickEnabled, setIsClickEnabled] = useState(true);
  const [isPolygonClosed, setIsPolygonClosed] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [fillColor, setFillColor] = useState('#ff0000');
  const [fillOpacity, setFillOpacity] = useState(0.3);
  const [strokeColor, setStrokeColor] = useState('#ff0000');
  const [strokeWeight, setStrokeWeight] = useState(2);

  const startDrawing = () => {
    setIsDrawing(true);
    if (onDrawingStateChange) onDrawingStateChange(true);
    setIsClickEnabled(true);
    setPoints([]);
    setIsPolygonClosed(false);
    polygonRef.current = null;
    pointMarkersRef.current = [];

    // Enable clicks on the map
    (map as any)._clickEnabled = true;

    // Add custom cursor
    const container = map.getContainer();
    container.style.cursor = 'crosshair';

    // Add click handler
    const clickHandler = (e: L.LeafletMouseEvent) => {
      // Check if clicks are enabled
      if (!(map as any)._clickEnabled) {
        return;
      }

      // Check if click is on a control element
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.leaflet-control') || target.closest('button')) {
        return;
      }

      const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng };

      setPoints(prev => {
        // Check if clicking near the first point to close the polygon
        if (prev.length >= 3) {
          const firstPoint = prev[0];
          const distance = Math.sqrt(
            Math.pow(newPoint.lat - firstPoint.lat, 2) +
            Math.pow(newPoint.lng - firstPoint.lng, 2)
          );

          // If within 50 units of first point, close the polygon
          if (distance < 50) {
            // Convert polyline to closed polygon
            if (polygonRef.current) {
              map.removeLayer(polygonRef.current);
            }
            const closedPolygon = L.polygon(
              prev.map(p => [p.lat, p.lng]),
              {
                color: strokeColor,
                weight: strokeWeight,
                fillColor: fillColor,
                fillOpacity: fillOpacity,
              }
            ).addTo(map);
            polygonRef.current = closedPolygon;
            setIsPolygonClosed(true); // Mark polygon as closed

            // Update the first point marker to show it's closed (make it pulse/glow)
            if (pointMarkersRef.current[0]) {
              const firstMarker = pointMarkersRef.current[0];
              const pulsingPinIcon = L.divIcon({
                html: `
                  <div style="position: relative; width: 30px; height: 40px;">
                    <!-- Pulsing glow effect -->
                    <div style="
                      position: absolute;
                      top: 0;
                      left: 50%;
                      transform: translateX(-50%) rotate(-45deg);
                      width: 28px;
                      height: 28px;
                      background-color: #00ff00;
                      border-radius: 50% 50% 50% 0;
                      opacity: 0.4;
                      animation: pulse-glow 1.5s infinite;
                    "></div>
                    <!-- Pin body -->
                    <div style="
                      position: absolute;
                      top: 0;
                      left: 50%;
                      transform: translateX(-50%) rotate(-45deg);
                      width: 24px;
                      height: 24px;
                      background-color: #00ff00;
                      border: 3px solid #006600;
                      border-radius: 50% 50% 50% 0;
                      box-shadow: 0 3px 8px rgba(0,0,0,0.4), 0 0 12px rgba(0,255,0,0.6);
                    "></div>
                    <!-- Pin dot -->
                    <div style="
                      position: absolute;
                      top: 5px;
                      left: 50%;
                      transform: translateX(-50%) rotate(-45deg);
                      width: 8px;
                      height: 8px;
                      background-color: #006600;
                      border-radius: 50%;
                      z-index: 1;
                    "></div>
                    <!-- Pin shadow -->
                    <div style="
                      position: absolute;
                      bottom: 0;
                      left: 50%;
                      transform: translateX(-50%);
                      width: 12px;
                      height: 4px;
                      background-color: rgba(0,0,0,0.3);
                      border-radius: 50%;
                      filter: blur(2px);
                    "></div>
                  </div>
                  <style>
                    @keyframes pulse-glow {
                      0%, 100% { transform: translateX(-50%) rotate(-45deg) scale(1); opacity: 0.4; }
                      50% { transform: translateX(-50%) rotate(-45deg) scale(1.2); opacity: 0.2; }
                    }
                  </style>
                `,
                className: 'region-point-marker-closed',
                iconSize: [30, 40],
                iconAnchor: [15, 35],
              });
              firstMarker.setIcon(pulsingPinIcon);
            }

            return prev; // Don't add another point
          }
        }

        const updated = [...prev, newPoint];

        // Add visual marker for the point - pin shape
        const isFirstPoint = updated.length === 1;
        const pinColor = isFirstPoint ? '#00ff00' : '#ffffff';
        const pinBorder = isFirstPoint ? '#006600' : '#000000';

        const pinIcon = L.divIcon({
          html: `
            <div style="position: relative; width: 30px; height: 40px;">
              <!-- Pin body -->
              <div style="
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 24px;
                height: 24px;
                background-color: ${pinColor};
                border: 3px solid ${pinBorder};
                border-radius: 50% 50% 50% 0;
                transform: translateX(-50%) rotate(-45deg);
                box-shadow: 0 3px 8px rgba(0,0,0,0.4);
              "></div>
              <!-- Pin dot -->
              <div style="
                position: absolute;
                top: 5px;
                left: 50%;
                transform: translateX(-50%) rotate(-45deg);
                width: 8px;
                height: 8px;
                background-color: ${pinBorder};
                border-radius: 50%;
                z-index: 1;
              "></div>
              <!-- Pin shadow -->
              <div style="
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 12px;
                height: 4px;
                background-color: rgba(0,0,0,0.3);
                border-radius: 50%;
                filter: blur(2px);
              "></div>
            </div>
          `,
          className: 'region-point-marker',
          iconSize: [30, 40],
          iconAnchor: [15, 35],
        });

        const marker = L.marker([newPoint.lat, newPoint.lng], {
          icon: pinIcon,
        }).addTo(map);

        pointMarkersRef.current.push(marker);

        // Draw polyline connecting all points (not closed)
        if (updated.length >= 2) {
          if (polygonRef.current) {
            // Update existing polyline
            polygonRef.current.setLatLngs(updated.map(p => [p.lat, p.lng]));
          } else {
            // Create new polyline
            const line = L.polyline(
              updated.map(p => [p.lat, p.lng]),
              {
                color: strokeColor,
                weight: strokeWeight,
              }
            ).addTo(map);
            polygonRef.current = line;
          }
        }

        return updated;
      });
    };

    map.on('click', clickHandler);
    (map as any)._regionClickHandler = clickHandler;
  };

  const cancelDrawing = () => {
    // DISABLE CLICKS IMMEDIATELY - this is the first thing that must happen
    (map as any)._clickEnabled = false;
    setIsClickEnabled(false);

    // Remove click handler to prevent any more clicks
    if ((map as any)._regionClickHandler) {
      map.off('click', (map as any)._regionClickHandler);
      delete (map as any)._regionClickHandler;
    }

    // Reset cursor
    const container = map.getContainer();
    container.style.cursor = '';

    // Remove polygon from map
    if (polygonRef.current) {
      try {
        map.removeLayer(polygonRef.current);
      } catch (e) {
        console.log('Polygon already removed');
      }
      polygonRef.current = null;
    }

    // Remove all point markers
    pointMarkersRef.current.forEach(marker => {
      try {
        map.removeLayer(marker);
      } catch (e) {
        // Marker might already be removed
      }
    });
    pointMarkersRef.current = [];

    // Reset state
    setPoints([]);
    setIsPolygonClosed(false);
    setIsDrawing(false);
    if (onDrawingStateChange) onDrawingStateChange(false);
  };

  const finishDrawing = () => {
    if (points.length < 3) {
      alert('يجب رسم 3 نقاط على الأقل لإنشاء منطقة');
      return;
    }

    // Check if the polygon is closed
    if (!isPolygonClosed) {
      alert('يجب إغلاق المنطقة بالنقر على النقطة الأولى (الخضراء)');
      return;
    }

    // DISABLE CLICKS when opening dialog
    (map as any)._clickEnabled = false;
    setIsClickEnabled(false);

    setShowSaveDialog(true);

    // Remove click handler
    if ((map as any)._regionClickHandler) {
      map.off('click', (map as any)._regionClickHandler);
      delete (map as any)._regionClickHandler;
    }

    // Reset cursor
    const container = map.getContainer();
    container.style.cursor = '';
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('الرجاء إدخال اسم المنطقة');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch('/api/maps/regions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapId,
          name: name.trim(),
          nameAr: nameAr.trim() || null,
          description: description.trim() || null,
          coordinates: points,
          fillColor,
          fillOpacity,
          strokeColor,
          strokeWeight,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ تم حفظ المنطقة بنجاح!');

        // Reset everything
        setIsDrawing(false);
        setPoints([]);
        setIsPolygonClosed(false);
        setShowSaveDialog(false);
        setName('');
        setNameAr('');
        setDescription('');

        if (polygonRef.current) {
          map.removeLayer(polygonRef.current);
          polygonRef.current = null;
        }

        // Remove all point markers
        pointMarkersRef.current.forEach(marker => {
          map.removeLayer(marker);
        });
        pointMarkersRef.current = [];

        // Notify parent to refresh regions
        if (onRegionDrawn) {
          onRegionDrawn();
        }
      } else {
        alert('❌ فشل في حفظ المنطقة: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving region:', error);
      alert('❌ حدث خطأ أثناء حفظ المنطقة');
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (color: string, type: 'fill' | 'stroke') => {
    if (type === 'fill') {
      setFillColor(color);
      if (polygonRef.current) {
        polygonRef.current.setStyle({ fillColor: color });
      }
    } else {
      setStrokeColor(color);
      if (polygonRef.current) {
        polygonRef.current.setStyle({ color: color });
      }
    }
  };

  const handleOpacityChange = (opacity: number) => {
    setFillOpacity(opacity);
    if (polygonRef.current) {
      polygonRef.current.setStyle({ fillOpacity: opacity });
    }
  };

  const handleWeightChange = (weight: number) => {
    setStrokeWeight(weight);
    if (polygonRef.current) {
      polygonRef.current.setStyle({ weight: weight });
    }
  };

  // Effect to respond to external trigger
  useEffect(() => {
    if (triggerStart && !isDrawing) {
      startDrawing();
    }
  }, [triggerStart]);

  return (
    <>
      <div
        className="leaflet-top leaflet-left"
        style={{ marginTop: '150px', marginLeft: '10px' }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="leaflet-control">
          {!isDrawing && !hideUI ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                startDrawing();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg font-semibold transition-colors"
              title="رسم منطقة جديدة"
            >
              <Pencil className="w-4 h-4" />
              رسم منطقة
            </button>
          ) : isDrawing ? (
            <div className="flex flex-col gap-2">
              <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg shadow-lg">
                <div className="font-bold text-sm">وضع الرسم نشط</div>
                <div className="text-xs mt-1">
                  النقاط: {points.length}
                  {points.length < 3 && ' (الحد الأدنى: 3)'}
                </div>
                {points.length >= 3 && (
                  <div className="text-xs mt-1 font-semibold">
                    {isPolygonClosed ? (
                      <span className="text-green-700">✓ مغلقة</span>
                    ) : (
                      <span className="text-orange-700">انقر على النقطة الخضراء للإغلاق</span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  // Disable clicks before calling finish
                  (map as any)._clickEnabled = false;
                  finishDrawing();
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Also disable on mousedown
                  (map as any)._clickEnabled = false;
                }}
                disabled={points.length < 3 || !isPolygonClosed}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg shadow-lg font-semibold transition-colors"
              >
                <Save className="w-4 h-4" />
                إنهاء الرسم
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  // Disable clicks IMMEDIATELY before doing anything
                  (map as any)._clickEnabled = false;
                  cancelDrawing();
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Also disable on mousedown
                  (map as any)._clickEnabled = false;
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg font-semibold transition-colors"
              >
                <X className="w-4 h-4" />
                إلغاء
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-br from-destructive/10 via-background to-background border-2 border-destructive/30 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-destructive/20">
              <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <Pencil className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground">حفظ المنطقة</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  اسم المنطقة (بالإنجليزية) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border-2 border-destructive/20 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive/50 focus:border-destructive/50 transition-all"
                  placeholder="e.g., Red Zone"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  اسم المنطقة (بالعربية)
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border-2 border-destructive/20 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive/50 focus:border-destructive/50 transition-all"
                  placeholder="مثال: المنطقة الحمراء"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">وصف المنطقة</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border-2 border-destructive/20 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive/50 focus:border-destructive/50 transition-all resize-none"
                  rows={3}
                  placeholder="وصف اختياري للمنطقة..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">لون التعبئة</label>
                  <input
                    type="color"
                    value={fillColor}
                    onChange={(e) => handleColorChange(e.target.value, 'fill')}
                    className="w-full h-11 rounded-lg cursor-pointer bg-background border-2 border-destructive/20 hover:border-destructive/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">الشفافية</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={fillOpacity}
                    onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                    className="w-full accent-destructive"
                  />
                  <div className="text-xs text-center text-muted-foreground font-semibold mt-1">{(fillOpacity * 100).toFixed(0)}%</div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">لون الحدود</label>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => handleColorChange(e.target.value, 'stroke')}
                    className="w-full h-11 rounded-lg cursor-pointer bg-background border-2 border-destructive/20 hover:border-destructive/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">سُمك الحدود</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={strokeWeight}
                    onChange={(e) => handleWeightChange(parseInt(e.target.value))}
                    className="w-full accent-destructive"
                  />
                  <div className="text-xs text-center text-muted-foreground font-semibold mt-1">{strokeWeight}px</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-destructive/20">
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="flex-1 px-4 py-2.5 bg-destructive hover:bg-destructive/90 disabled:bg-muted disabled:text-muted-foreground text-destructive-foreground rounded-lg font-bold transition-all disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
              >
                {saving ? 'جاري الحفظ...' : '💾 حفظ'}
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  cancelDrawing();
                }}
                disabled={saving}
                className="px-4 py-2.5 bg-muted hover:bg-muted/80 disabled:bg-muted/50 text-foreground rounded-lg font-bold transition-all disabled:cursor-not-allowed"
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

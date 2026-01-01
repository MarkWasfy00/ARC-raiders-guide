'use client';

import { useState } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MarkerPositioningHelperProps {
  onOffsetChange?: (offsetX: number, offsetY: number) => void;
}

export function MarkerPositioningHelper({ onOffsetChange }: MarkerPositioningHelperProps) {
  const [referenceMarker, setReferenceMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [showHelper, setShowHelper] = useState(true);

  // Component to handle map clicks and show coordinates
  function ClickHandler() {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setReferenceMarker({ lat, lng });
        console.log('🎯 Reference Marker Placed:');
        console.log(`   Game Coordinates: lat=${lat.toFixed(1)}, lng=${lng.toFixed(1)}`);
      },
    });
    return null;
  }

  const handleDragEnd = (e: L.DragEndEvent) => {
    const marker = e.target;
    const position = marker.getLatLng();
    setReferenceMarker({ lat: position.lat, lng: position.lng });
    setIsDragging(false);
    console.log('🎯 Reference Marker Moved:');
    console.log(`   New Position: lat=${position.lat.toFixed(1)}, lng=${position.lng.toFixed(1)}`);
  };

  const handleApplyOffset = () => {
    console.log(`📐 Applying global offset: X=${offsetX}, Y=${offsetY}`);
    onOffsetChange?.(offsetX, offsetY);
  };

  const handleReset = () => {
    setOffsetX(0);
    setOffsetY(0);
    setReferenceMarker(null);
    onOffsetChange?.(0, 0);
    console.log('🔄 Offsets reset to 0');
  };

  const referenceIcon = L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: linear-gradient(135deg, #ff0080 0%, #ff8c00 100%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 20px rgba(255, 0, 128, 0.6), 0 4px 12px rgba(0,0,0,0.5);
          position: absolute;
          animation: pulse 2s ease-in-out infinite;
        "></div>
        <div style="
          color: white;
          font-size: 20px;
          font-weight: bold;
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        ">📍</div>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      </style>
    `,
    className: 'reference-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });

  if (!showHelper) {
    return (
      <>
        <ClickHandler />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <Button
            onClick={() => setShowHelper(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            🛠️ Show Positioning Helper
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <ClickHandler />

      {/* Control Panel */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border-2 border-purple-500/30 min-w-[400px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            🛠️ Marker Positioning Helper
          </h3>
          <Button
            onClick={() => setShowHelper(false)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="text-sm text-slate-300 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="font-semibold mb-1">📌 How to use:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Click anywhere on the map to place a reference marker</li>
              <li>Drag the reference marker to adjust position</li>
              <li>Use offset controls to move ALL markers at once</li>
              <li>Check console for detailed coordinate information</li>
            </ul>
          </div>

          {/* Reference Marker Info */}
          {referenceMarker && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 space-y-2">
              <p className="text-sm font-semibold text-purple-300">📍 Reference Marker:</p>
              <div className="text-xs text-slate-200 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Latitude:</span>
                  <span className="text-green-400 font-bold">{referenceMarker.lat.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Longitude:</span>
                  <span className="text-green-400 font-bold">{referenceMarker.lng.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Offset Controls */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-200">🎯 Global Marker Offset:</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="offsetX" className="text-xs text-slate-300">
                  X Offset (Longitude)
                </Label>
                <Input
                  id="offsetX"
                  type="number"
                  value={offsetX}
                  onChange={(e) => setOffsetX(Number(e.target.value))}
                  className="bg-slate-800/50 border-slate-600 text-white mt-1"
                  step="10"
                />
              </div>

              <div>
                <Label htmlFor="offsetY" className="text-xs text-slate-300">
                  Y Offset (Latitude)
                </Label>
                <Input
                  id="offsetY"
                  type="number"
                  value={offsetY}
                  onChange={(e) => setOffsetY(Number(e.target.value))}
                  className="bg-slate-800/50 border-slate-600 text-white mt-1"
                  step="10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleApplyOffset}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                ✓ Apply Offset
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 border-slate-600 text-white hover:bg-slate-700"
              >
                🔄 Reset
              </Button>
            </div>
          </div>

          {/* Current Offsets Display */}
          {(offsetX !== 0 || offsetY !== 0) && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-sm font-semibold text-yellow-300 mb-1">⚠️ Active Offsets:</p>
              <p className="text-xs text-slate-200 font-mono">
                X: {offsetX > 0 ? '+' : ''}{offsetX} | Y: {offsetY > 0 ? '+' : ''}{offsetY}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reference Marker */}
      {referenceMarker && (
        <Marker
          position={[referenceMarker.lat, referenceMarker.lng]}
          icon={referenceIcon}
          draggable={true}
          eventHandlers={{
            dragstart: () => setIsDragging(true),
            dragend: handleDragEnd,
          }}
        >
          <Popup>
            <div className="min-w-[200px] font-mono">
              <div className="font-bold mb-2 text-purple-600">
                📍 Reference Marker
              </div>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">Lat:</span>{' '}
                  <span className="font-bold">{referenceMarker.lat.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lng:</span>{' '}
                  <span className="font-bold">{referenceMarker.lng.toFixed(1)}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
                Drag this marker to reposition it
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}

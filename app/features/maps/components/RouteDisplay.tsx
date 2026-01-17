'use client';

import { Polyline, Popup } from 'react-leaflet';

export interface MapRoute {
  id: string;
  userId: string;
  mapID: string;
  routeNumber: number;
  name: string | null;
  nameAr: string | null;
  coordinates: Array<{ lat: number; lng: number }>;
  color: string;
  visible: boolean;
  created_at: Date | string;
}

interface RouteDisplayProps {
  route: MapRoute | null;
}

export function RouteDisplay({ route }: RouteDisplayProps) {
  if (!route || !route.visible) {
    return null;
  }

  // Convert coordinates to Leaflet format
  const positions: [number, number][] = route.coordinates.map(coord => [
    coord.lat,
    coord.lng
  ]);

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: route.color,
        weight: 4,
        opacity: 0.9,
        dashArray: '10, 10', // Dashed line pattern
        lineCap: 'round',
        lineJoin: 'round',
      }}
    >
      <Popup>
        <div className="min-w-[200px]">
          <div className="font-bold mb-2 text-lg">
            مسار {route.routeNumber}
          </div>
          {(route.nameAr || route.name) && (
            <div className="text-sm text-muted-foreground mb-2">
              {route.nameAr || route.name}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center justify-between mb-1">
              <span>اللون:</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: route.color }}
                />
                <span>{route.color}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>عدد النقاط:</span>
              <span>{route.coordinates.length}</span>
            </div>
          </div>
        </div>
      </Popup>
    </Polyline>
  );
}

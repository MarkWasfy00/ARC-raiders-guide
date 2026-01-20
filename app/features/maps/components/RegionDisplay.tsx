'use client';

import { Polygon, Popup } from 'react-leaflet';

export interface MapRegion {
  id: string;
  mapID: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  coordinates: Array<{ lat: number; lng: number }>;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWeight: number;
  addedBy?: {
    id: string;
    username: string | null;
    image: string | null;
  } | null;
  created_at?: Date | string;
}

interface RegionDisplayProps {
  regions: MapRegion[];
  show?: boolean;
  isAdminMode?: boolean;
  onDelete?: (id: string) => void;
}

export function RegionDisplay({ regions, show = true, isAdminMode = false, onDelete }: RegionDisplayProps) {
  if (!show || !regions || regions.length === 0) {
    return null;
  }

  return (
    <>
      {regions.map((region) => {
        // Convert coordinates to Leaflet format
        const positions: [number, number][] = region.coordinates.map(coord => [
          coord.lat,
          coord.lng
        ]);

        return (
          <Polygon
            key={region.id}
            positions={positions}
            pathOptions={{
              color: region.strokeColor,
              weight: region.strokeWeight,
              fillColor: region.fillColor,
              fillOpacity: region.fillOpacity,
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-bold mb-2 text-lg">
                  {region.nameAr || region.name}
                </div>
                {region.nameAr && region.name && (
                  <div className="text-sm text-muted-foreground mb-2">
                    {region.name}
                  </div>
                )}
                {region.description && (
                  <div className="text-sm mb-3 text-gray-700">
                    {region.description}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mb-2 pb-2 border-b">
                  <div className="flex items-center justify-between mb-1">
                    <span>لون التعبئة:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: region.fillColor }}
                      />
                      <span>{region.fillColor}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span>الشفافية:</span>
                    <span>{(region.fillOpacity * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span>لون الحدود:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: region.strokeColor }}
                      />
                      <span>{region.strokeColor}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>عدد النقاط:</span>
                    <span>{region.coordinates.length}</span>
                  </div>
                </div>
                {region.addedBy && (
                  <div className="text-xs text-muted-foreground mt-3 pt-2 border-t flex items-center gap-2">
                    {region.addedBy.image && (
                      <img
                        src={region.addedBy.image}
                        alt={region.addedBy.username || 'مستخدم'}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs">أضيفت بواسطة:</span>
                      <span className="font-medium text-foreground">
                        {region.addedBy.username || 'مستخدم'}
                      </span>
                    </div>
                  </div>
                )}
                {isAdminMode && onDelete && (
                  <button
                    onClick={() => onDelete(region.id)}
                    className="mt-3 w-full px-3 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors"
                  >
                    🗑️ حذف المنطقة
                  </button>
                )}
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
}

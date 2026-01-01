'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { memo, useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapSidebar } from './MapSidebar';
import { AddMarkerModal } from './AddMarkerModal';
import { MARKER_CATEGORIES, SUBCATEGORY_ICONS, type MapMarker, type MarkerCategory, type AreaLabel } from '../types';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

// Add custom styles for black background with vignette effect
const mapStyles = `
  .leaflet-container {
    background-color: #000000 !important;
  }
  .leaflet-tile-container {
    background-color: transparent;
  }
  .leaflet-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    box-shadow: inset 0 0 100px 40px rgba(0, 0, 0, 0.8);
    z-index: 1000;
  }
`;

const TILE_SIZE = 256;
const MIN_ZOOM = 0;
const MAX_ZOOM = 5;

// Buried City has a rectangular tile grid (8 wide × 4 tall at zoom 3)
// Use same scale as Dam map for coordinate system compatibility
const WORLD_SIZE = 8192;
const SCALE = WORLD_SIZE / TILE_SIZE; // 32

const CustomCRS = L.extend({}, L.CRS.Simple, {
  // Same uniform scaling as Dam map
  transformation: new L.Transformation(1/SCALE, 0, 1/SCALE, 0)
});

// Center coordinates for Buried City map (centered on marker data range)
// Marker data ranges: lat 2792-6543, lng 5007-9387
const center = L.latLng(4667, 7197);

// Buried City area labels - to be populated
export const BURIED_CITY_AREA_LABELS: AreaLabel[] = [
  // Add area labels here after clicking on the map to get coordinates
];

// Create custom marker icons by category and subcategory
function createMarkerIcon(category: string, color: string, subcategory: string | null) {
  const iconPath = subcategory ? SUBCATEGORY_ICONS[subcategory] : null;

  if (iconPath) {
    // Icon-based marker with actual image
    return L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            background-color: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            position: absolute;
          "></div>
          <img
            src="${iconPath}"
            alt=""
            style="
              width: 20px;
              height: 20px;
              position: relative;
              z-index: 1;
              filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
              object-fit: contain;
            "
          />
        </div>
      `,
      className: 'custom-marker-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });
  } else {
    // Fallback to simple colored dot
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      `,
      className: 'custom-marker',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -9],
    });
  }
}

// Component to handle map clicks for adding markers
function MapClickHandler({
  onMapClick,
  addingMarker,
}: {
  onMapClick: (lat: number, lng: number) => void;
  addingMarker: boolean;
}) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      const zoom = map.getZoom();
      console.log('📍 Map Center Coordinates:');
      console.log(`  center = L.latLng(${center.lat.toFixed(3)}, ${center.lng.toFixed(3)});`);
      console.log(`  zoom = ${zoom};`);
    },
    click: (e) => {
      const { lat, lng } = e.latlng;
      console.log('🎯 Clicked Position:');
      console.log(`  { lat: ${lat.toFixed(1)}, lng: ${lng.toFixed(1)} }`);

      if (addingMarker) {
        onMapClick(lat, lng);
      }
    },
  });
  return null;
}

// Component to display area labels
function AreaLabels({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <>
      {BURIED_CITY_AREA_LABELS.map((area) => {
        const labelIcon = L.divIcon({
          html: `
            <div style="
              text-align: center;
              white-space: nowrap;
              pointer-events: none;
              font-family: 'Cairo', sans-serif;
            ">
              <div style="
                font-size: ${area.fontSize || 14}px;
                font-weight: 700;
                color: ${area.color || '#ffffff'};
                text-shadow:
                  0 0 8px rgba(0, 0, 0, 0.9),
                  0 0 4px rgba(0, 0, 0, 0.9),
                  2px 2px 4px rgba(0, 0, 0, 0.8),
                  -1px -1px 2px rgba(0, 0, 0, 0.8);
                letter-spacing: 0.5px;
                text-transform: uppercase;
              ">
                ${area.nameAr}
              </div>
            </div>
          `,
          className: 'area-label',
          iconSize: [200, 40],
          iconAnchor: [100, 20],
        });

        return (
          <Marker
            key={area.id}
            position={[area.lat, area.lng]}
            icon={labelIcon}
            interactive={false}
          />
        );
      })}
    </>
  );
}

// Component to handle marker updates
function MapMarkers({
  markers,
  categories,
  enabledSubcategories,
  enabledLootAreas,
  showLockedOnly,
  searchQuery,
  isAdminMode = false,
  onDeleteMarker,
}: {
  markers: MapMarker[];
  categories: MarkerCategory[];
  enabledSubcategories: Record<string, Set<string>>;
  enabledLootAreas: Set<string>;
  showLockedOnly: boolean;
  searchQuery: string;
  isAdminMode?: boolean;
  onDeleteMarker?: (id: string) => void;
}) {
  const enabledCategories = new Set(
    categories.filter((cat) => cat.enabled).map((cat) => cat.id)
  );

  const filteredMarkers = markers.filter((marker) => {
    // Check category
    if (!enabledCategories.has(marker.category)) return false;

    // Check subcategory
    if (marker.subcategory) {
      const enabledSubs = enabledSubcategories[marker.category];
      if (enabledSubs && enabledSubs.size > 0 && !enabledSubs.has(marker.subcategory)) {
        return false;
      }
    }

    // Check loot areas
    if (enabledLootAreas.size > 0) {
      if (!marker.lootAreas || marker.lootAreas.length === 0) {
        return false;
      }
      const hasMatchingLootArea = marker.lootAreas.some((area) =>
        enabledLootAreas.has(area)
      );
      if (!hasMatchingLootArea) return false;
    }

    // Check locked door filter
    if (showLockedOnly && !marker.behindLockedDoor) return false;

    // Check search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesInstanceName =
        marker.instanceName?.toLowerCase().includes(query) || false;
      const matchesSubcategory =
        marker.subcategory?.toLowerCase().replace(/_/g, ' ').includes(query) || false;
      if (!matchesInstanceName && !matchesSubcategory) return false;
    }

    return true;
  });

  return (
    <>
      {filteredMarkers.map((marker) => {
        const category = MARKER_CATEGORIES[marker.category];
        if (!category) return null;

        const subcategoryIconPath = marker.subcategory ? SUBCATEGORY_ICONS[marker.subcategory] : null;

        return (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createMarkerIcon(marker.category, category.color, marker.subcategory)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-bold mb-2 flex items-center gap-2" style={{ color: category.color }}>
                  {subcategoryIconPath && (
                    <img
                      src={subcategoryIconPath}
                      alt=""
                      className="w-5 h-5 object-contain"
                    />
                  )}
                  <span>{category.label}</span>
                </div>
                {marker.subcategory && (
                  <div className="text-sm mb-1 flex items-center gap-2">
                    <span className="text-muted-foreground">النوع الفرعي:</span>
                    <span>{marker.subcategory.replace(/_/g, ' ').replace(/-/g, ' ')}</span>
                  </div>
                )}
                {marker.instanceName && (
                  <div className="text-sm mb-1 flex items-center gap-2">
                    <span className="text-muted-foreground">الاسم:</span>
                    <span className="font-medium">{marker.instanceName}</span>
                  </div>
                )}
                {marker.behindLockedDoor && (
                  <div className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                    🔒 <span>خلف باب مقفل</span>
                  </div>
                )}
                {marker.lootAreas && marker.lootAreas.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">مناطق النهب:</span> {marker.lootAreas.join(', ')}
                  </div>
                )}
                {marker.addedBy && (
                  <div className="text-xs text-muted-foreground mt-3 pt-2 border-t flex items-center gap-2">
                    {marker.addedBy.image && (
                      <img
                        src={marker.addedBy.image}
                        alt={marker.addedBy.username || 'مستخدم'}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs">أضيفت بواسطة:</span>
                      <span className="font-medium text-foreground">{marker.addedBy.username || 'مستخدم'}</span>
                    </div>
                  </div>
                )}
                {isAdminMode && onDeleteMarker && (
                  <button
                    onClick={() => onDeleteMarker(marker.id)}
                    className="mt-3 w-full px-3 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors"
                  >
                    🗑️ حذف العلامة
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

interface BuriedCityMapClientProps {
  isAdminMode?: boolean;
}

export const BuriedCityMapClient = memo(function BuriedCityMapClient({ isAdminMode = false }: BuriedCityMapClientProps = {}) {
  const { data: session } = useSession();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<MarkerCategory[]>(
    Object.entries(MARKER_CATEGORIES).map(([id, data]) => ({
      id,
      label: data.label,
      enabled: false, // Start with all categories hidden
      color: data.color,
    }))
  );
  const [enabledSubcategories, setEnabledSubcategories] = useState<Record<string, Set<string>>>({});
  const [enabledLootAreas, setEnabledLootAreas] = useState<Set<string>>(new Set());
  const [showLockedOnly, setShowLockedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAreaLabels, setShowAreaLabels] = useState(true);
  const [addMarkerModalOpen, setAddMarkerModalOpen] = useState(false);
  const [newMarkerPosition, setNewMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [addingMarker, setAddingMarker] = useState(false);

  // Log CRS configuration on mount
  useEffect(() => {
    console.log('🗺️  Buried City Map - Game Coordinate System:');
    console.log(`   World size: ${WORLD_SIZE} units with scale 1/${SCALE}`);
    console.log(`   CRS: Simple (same as Dam map)`);
    console.log(`   Center: [${center.lat}, ${center.lng}] game units`);
    console.log(`   Tile grid at zoom 3: 8×4 (rectangular)`);
    console.log(`   Marker ranges: lat 2792-6543, lng 5007-9387`);
  }, []);

  // Fetch markers from API
  useEffect(() => {
    async function fetchMarkers() {
      try {
        setLoading(true);
        console.log('🔄 Fetching Buried City markers from API...');
        const response = await fetch('/api/maps/buried-city/markers');
        const data = await response.json();

        console.log('📦 API Response:', {
          success: data.success,
          total: data.total || data.markers?.length,
        });

        if (data.success) {
          setMarkers(data.markers);

          if (data.markers.length > 0) {
            const lats = data.markers.map((m: MapMarker) => m.lat);
            const lngs = data.markers.map((m: MapMarker) => m.lng);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);

            console.log('📍 Client-side marker coordinate ranges:');
            console.log(`   Lat: ${minLat.toFixed(0)} to ${maxLat.toFixed(0)}`);
            console.log(`   Lng: ${minLng.toFixed(0)} to ${maxLng.toFixed(0)}`);

            console.log('📌 First 3 markers received:');
            data.markers.slice(0, 3).forEach((m: MapMarker) => {
              console.log(`   - ${m.instanceName || m.subcategory}: (${m.lat.toFixed(0)}, ${m.lng.toFixed(0)})`);
            });

            console.log(`✅ Loaded ${data.markers.length} markers from Metaforge-compatible database`);
            console.log(`   Coordinate ranges: lat ${minLat.toFixed(0)}-${maxLat.toFixed(0)}, lng ${minLng.toFixed(0)}-${maxLng.toFixed(0)}`);
          } else {
            console.warn('⚠️  No markers received from API');
          }

          // Initialize all subcategories as empty (all hidden)
          const initialSubcategories: Record<string, Set<string>> = {};
          data.markers.forEach((marker: MapMarker) => {
            if (marker.category && !initialSubcategories[marker.category]) {
              initialSubcategories[marker.category] = new Set();
            }
          });
          setEnabledSubcategories(initialSubcategories);
        }
      } catch (error) {
        console.error('❌ Failed to fetch markers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkers();
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  const handleSubcategoryToggle = (categoryId: string, subcategory: string) => {
    setEnabledSubcategories((prev) => {
      const newSubcategories = { ...prev };
      if (!newSubcategories[categoryId]) {
        newSubcategories[categoryId] = new Set();
      }
      const categorySet = new Set(newSubcategories[categoryId]);

      const isEnabling = !categorySet.has(subcategory);

      if (categorySet.has(subcategory)) {
        categorySet.delete(subcategory);
      } else {
        categorySet.add(subcategory);
      }

      newSubcategories[categoryId] = categorySet;

      // Auto-enable parent category when enabling a subcategory
      if (isEnabling) {
        setCategories((prevCats) =>
          prevCats.map((cat) =>
            cat.id === categoryId ? { ...cat, enabled: true } : cat
          )
        );
      }

      return newSubcategories;
    });
  };

  const handleLootAreaToggle = (lootArea: string) => {
    setEnabledLootAreas((prev) => {
      const newAreas = new Set(prev);
      if (newAreas.has(lootArea)) {
        newAreas.delete(lootArea);
      } else {
        newAreas.add(lootArea);
      }
      return newAreas;
    });
  };

  const handleLockedDoorToggle = () => {
    setShowLockedOnly((prev) => !prev);
  };

  const handleToggleAll = (enabled: boolean) => {
    setCategories((prev) => prev.map((cat) => ({ ...cat, enabled })));
  };

  const handleAreaLabelsToggle = () => {
    setShowAreaLabels((prev) => !prev);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (addingMarker) {
      setNewMarkerPosition({ lat, lng });
      setAddMarkerModalOpen(true);
      setAddingMarker(false);
    }
  };

  const handleMarkerAdded = async () => {
    // Refetch markers
    try {
      const response = await fetch('/api/maps/buried-city/markers');
      const data = await response.json();
      if (data.success) {
        setMarkers(data.markers);
      }
    } catch (error) {
      console.error('Failed to refetch markers:', error);
    }
  };

  const toggleAddingMarker = () => {
    setAddingMarker((prev) => !prev);
    if (!addingMarker) {
      setNewMarkerPosition(null);
    }
  };

  const handleDeleteMarker = async (markerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه العلامة؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/maps/buried-city/markers/${markerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        alert('فشل في حذف العلامة');
        return;
      }

      // Refetch markers
      handleMarkerAdded();
    } catch (error) {
      console.error('Error deleting marker:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="w-full h-[calc(100vh-20rem)] min-h-[600px] relative rounded-xl overflow-hidden border-2 border-border/50 bg-black shadow-2xl">
      <style dangerouslySetInnerHTML={{ __html: mapStyles }} />

      {/* Sidebar */}
      <MapSidebar
        categories={categories}
        markers={markers}
        onCategoryToggle={handleCategoryToggle}
        onSubcategoryToggle={handleSubcategoryToggle}
        onLootAreaToggle={handleLootAreaToggle}
        onLockedDoorToggle={handleLockedDoorToggle}
        onToggleAll={handleToggleAll}
        enabledSubcategories={enabledSubcategories}
        enabledLootAreas={enabledLootAreas}
        showLockedOnly={showLockedOnly}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showAreaLabels={showAreaLabels}
        onAreaLabelsToggle={handleAreaLabelsToggle}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 right-4 z-[1001] bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-md px-5 py-3 rounded-xl shadow-2xl border border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-primary">جاري تحميل العلامات...</span>
          </div>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={center}
        zoom={2}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        crs={CustomCRS}
        className="w-full h-full bg-black"
        zoomControl={true}
        attributionControl={false}
        scrollWheelZoom={true}
        dragging={true}
        style={{ backgroundColor: '#000000' }}
      >
        <TileLayer
          url="/imagesmaps/buried-city/{z}/{x}/{y}.webp"
          tileSize={TILE_SIZE}
          noWrap={true}
        />
        <MapClickHandler onMapClick={handleMapClick} addingMarker={addingMarker} />
        <AreaLabels show={showAreaLabels} />
        <MapMarkers
          markers={markers}
          categories={categories}
          enabledSubcategories={enabledSubcategories}
          enabledLootAreas={enabledLootAreas}
          showLockedOnly={showLockedOnly}
          searchQuery={searchQuery}
          isAdminMode={isAdminMode}
          onDeleteMarker={handleDeleteMarker}
        />
      </MapContainer>

      {/* Add Marker Button */}
      {(session || isAdminMode) && (
        <button
          onClick={toggleAddingMarker}
          className={`absolute bottom-6 left-6 z-[1001] px-4 py-2 rounded-lg font-semibold shadow-lg transition-all ${
            addingMarker
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : isAdminMode
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {addingMarker ? 'إلغاء الإضافة' : '+ إضافة علامة'}
        </button>
      )}

      {/* Add Marker Modal */}
      <AddMarkerModal
        open={addMarkerModalOpen}
        onOpenChange={setAddMarkerModalOpen}
        position={newMarkerPosition}
        mapId="buried-city"
        onMarkerAdded={handleMarkerAdded}
      />
    </div>
  );
});

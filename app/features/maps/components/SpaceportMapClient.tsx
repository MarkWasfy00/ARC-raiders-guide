'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { memo, useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapSidebar } from './MapSidebar';
import { MARKER_CATEGORIES, SUBCATEGORY_ICONS, type MapMarker, type MarkerCategory } from '../types';

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
const MAX_ZOOM = 5;
const MIN_ZOOM = 0;

// The game world is 8192x8192 units at max zoom
// Spaceport tiles show a cropped region starting at different coordinates
// Offset adjustments align marker coordinates with map tile features
const WORLD_SIZE = 8192;
const SCALE = WORLD_SIZE / TILE_SIZE; // 32

// Adjust these values to align markers with map features
// Positive X = shift markers right, Negative X = shift left
// Positive Y = shift markers down, Negative Y = shift up
const X_OFFSET = -70; // Fine-tune horizontal alignment
const Y_OFFSET = -27; // Fine-tune vertical alignment

const CustomCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1/SCALE, X_OFFSET, 1/SCALE, Y_OFFSET)
});

// Center coordinates for perfect map positioning
const center = L.latLng(2350.000, 3867.000);

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

// Component to log map coordinates when clicking
function MapCoordinateLogger() {
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
    },
  });
  return null;
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

interface SpaceportMapClientProps {
  isAdminMode?: boolean;
}

export const SpaceportMapClient = memo(function SpaceportMapClient({ isAdminMode = false }: SpaceportMapClientProps = {}) {
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
  const [showAreaLabels, setShowAreaLabels] = useState(false);

  // Fetch markers from API
  useEffect(() => {
    async function fetchMarkers() {
      try {
        setLoading(true);
        const response = await fetch('/api/maps/spaceport/markers');
        const data = await response.json();
        if (data.success) {
          setMarkers(data.markers);

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
        console.error('Failed to fetch markers:', error);
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

  const handleDeleteMarker = async (markerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه العلامة؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/maps/spaceport/markers/${markerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        alert('فشل في حذف العلامة');
        return;
      }

      // Refetch markers
      const markersResponse = await fetch('/api/maps/spaceport/markers');
      const markersData = await markersResponse.json();
      if (markersData.success) {
        setMarkers(markersData.markers);
      }
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
        key="spaceport-map-static"
        center={center}
        zoom={3}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        crs={CustomCRS}
        className="w-full h-full bg-black"
        zoomControl={true}
        attributionControl={false}
        zoomSnap={1}
        zoomDelta={1}
        wheelPxPerZoomLevel={60}
        scrollWheelZoom={true}
        dragging={true}
        style={{ backgroundColor: '#000000' }}
      >
        <TileLayer
          url="/imagesmaps/spaceport/{z}/{x}/{y}.webp"
          tileSize={TILE_SIZE}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          noWrap={true}
          keepBuffer={2}
          updateWhenIdle={true}
          updateWhenZooming={false}
          errorTileUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect width='256' height='256' fill='%23000000'/%3E%3C/svg%3E"
        />
        <MapCoordinateLogger />
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
    </div>
  );
});

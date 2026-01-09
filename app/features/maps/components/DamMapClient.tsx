'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { memo, useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapSidebar } from './MapSidebar';
import { AddMarkerModal, type MarkerSettings } from './AddMarkerModal';
import { AddAreaLabelModal } from './AddAreaLabelModal';
import { MARKER_CATEGORIES, SUBCATEGORY_ICONS, type MapMarker, type MarkerCategory, type AreaLabel } from '../types';
import { useSession } from 'next-auth/react';

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
// At zoom 3, we have 8 tiles per side (2^3 = 8)
// Reference map shows tiles (X:2-5, Y:1-3) at zoom 3
// We need to match this tile range
const WORLD_SIZE = 8192;
const SCALE = WORLD_SIZE / TILE_SIZE; // 32

const CustomCRS = L.extend({}, L.CRS.Simple, {
  // No Y inversion, simple scaling
  transformation: new L.Transformation(1/SCALE, 0, 1/SCALE, 0)
});

// Center coordinates provided by user for perfect map positioning
const center = L.latLng(2504.000, 3504.000);

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
  continuousMode,
}: {
  onMapClick: (lat: number, lng: number) => void;
  addingMarker: boolean;
  continuousMode: boolean;
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

      if (addingMarker || continuousMode) {
        console.log('  ✅ Triggering onMapClick');
        onMapClick(lat, lng);
      } else {
        console.log('  ❌ Not in placement mode');
      }
    },
  });
  return null;
}

// Component to display area labels
function AreaLabels({
  show,
  labels,
  isAdminMode,
  onDelete,
}: {
  show: boolean;
  labels: AreaLabel[];
  isAdminMode?: boolean;
  onDelete?: (id: string) => void;
}) {
  if (!show) return null;

  return (
    <>
      {labels.map((area) => {
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
            interactive={isAdminMode}
          >
            {isAdminMode && onDelete && (
              <Popup>
                <div className="min-w-[150px]">
                  <div className="font-bold mb-2">{area.nameAr}</div>
                  <div className="text-sm text-muted-foreground mb-2">{area.name}</div>
                  <div className="text-xs mb-2">
                    حجم الخط: {area.fontSize || 14}px • اللون: {area.color || '#ffffff'}
                  </div>
                  <button
                    onClick={() => onDelete(area.id)}
                    className="w-full px-3 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors"
                  >
                    🗑️ حذف العنوان
                  </button>
                </div>
              </Popup>
            )}
          </Marker>
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

interface DamMapClientProps {
  isAdminMode?: boolean;
}

export const DamMapClient = memo(function DamMapClient({ isAdminMode = false }: DamMapClientProps = {}) {
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
  const [continuousPlacementSettings, setContinuousPlacementSettings] = useState<MarkerSettings | null>(null);
  const [markerCount, setMarkerCount] = useState(0);
  const [temporaryMarkers, setTemporaryMarkers] = useState<Array<{ lat: number; lng: number; id: string }>>([]);
  const [areaLabels, setAreaLabels] = useState<AreaLabel[]>([]);
  const [addLabelModalOpen, setAddLabelModalOpen] = useState(false);
  const [newLabelPosition, setNewLabelPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [addingLabel, setAddingLabel] = useState(false);

  // Fetch markers from API
  useEffect(() => {
    async function fetchMarkers() {
      try {
        setLoading(true);
        const response = await fetch('/api/maps/dam/markers');
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

  // Fetch area labels from API
  useEffect(() => {
    async function fetchAreaLabels() {
      try {
        const response = await fetch('/api/maps/dam/labels');
        const data = await response.json();

        if (data.success) {
          setAreaLabels(data.labels);
          console.log(`✅ Loaded ${data.labels.length} area labels`);
        }
      } catch (error) {
        console.error('❌ Failed to fetch area labels:', error);
      }
    }

    fetchAreaLabels();
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
      const response = await fetch(`/api/maps/dam/markers/${markerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        alert('فشل في حذف العلامة');
        return;
      }

      // Refetch markers
      const markersResponse = await fetch('/api/maps/dam/markers');
      const markersData = await markersResponse.json();
      if (markersData.success) {
        setMarkers(markersData.markers);
      }
    } catch (error) {
      console.error('Error deleting marker:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    // If in label adding mode, open label modal
    if (addingLabel) {
      setNewLabelPosition({ lat, lng });
      setAddLabelModalOpen(true);
      setAddingLabel(false);
      return;
    }

    // If in continuous placement mode, create marker directly
    if (continuousPlacementSettings) {
      const tempId = `temp-${Date.now()}`;
      setTemporaryMarkers(prev => [...prev, { lat, lng, id: tempId }]);

      try {
        const response = await fetch('/api/maps/dam/markers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat,
            lng,
            category: continuousPlacementSettings.category,
            subcategory: continuousPlacementSettings.subcategory || null,
            instanceName: continuousPlacementSettings.instanceName || null,
            behindLockedDoor: continuousPlacementSettings.behindLockedDoor,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setMarkerCount(prev => prev + 1);
          setMarkers(prev => [...prev, data.marker]);
          setTemporaryMarkers(prev => prev.filter(m => m.id !== tempId));
        } else {
          alert('فشل في إضافة العلامة: ' + data.error);
          setTemporaryMarkers(prev => prev.filter(m => m.id !== tempId));
        }
      } catch (error) {
        console.error('Error creating marker:', error);
        alert('حدث خطأ أثناء إضافة العلامة');
        setTemporaryMarkers(prev => prev.filter(m => m.id !== tempId));
      }
      return;
    }

    // Normal single placement mode
    if (addingMarker || addMarkerModalOpen) {
      setNewMarkerPosition({ lat, lng });
      if (!addMarkerModalOpen) {
        setAddMarkerModalOpen(true);
      }
    }
  };

  const handleMarkerAdded = async () => {
    try {
      const response = await fetch('/api/maps/dam/markers');
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

  const handleModalOpenChange = (open: boolean) => {
    setAddMarkerModalOpen(open);
    if (!open) {
      setAddingMarker(false);
      setNewMarkerPosition(null);
    }
  };

  const handleStartContinuousPlacement = (settings: MarkerSettings) => {
    setContinuousPlacementSettings(settings);
    setMarkerCount(0);
    setAddingMarker(false);
    setAddMarkerModalOpen(false);

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === settings.category ? { ...cat, enabled: true } : cat
      )
    );

    if (settings.subcategory) {
      setEnabledSubcategories((prev) => {
        const newSubcategories = { ...prev };
        if (!newSubcategories[settings.category]) {
          newSubcategories[settings.category] = new Set();
        }
        const categorySet = new Set(newSubcategories[settings.category]);
        categorySet.add(settings.subcategory);
        newSubcategories[settings.category] = categorySet;
        return newSubcategories;
      });
    }
  };

  const handleStopContinuousPlacement = () => {
    setContinuousPlacementSettings(null);
    setMarkerCount(0);
    setTemporaryMarkers([]);
  };

  const toggleAddingLabel = () => {
    setAddingLabel((prev) => !prev);
    if (!addingLabel) {
      setNewLabelPosition(null);
    }
  };

  const handleLabelAdded = async () => {
    try {
      const response = await fetch('/api/maps/dam/labels');
      const data = await response.json();
      if (data.success) {
        setAreaLabels(data.labels);
      }
    } catch (error) {
      console.error('Failed to refetch labels:', error);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/maps/dam/labels/${labelId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        alert('فشل في حذف العنوان');
        return;
      }

      handleLabelAdded();
    } catch (error) {
      console.error('Error deleting label:', error);
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
          url="/imagesmaps/dam/{z}/{x}_{y}.webp"
          tileSize={TILE_SIZE}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          minNativeZoom={MIN_ZOOM}
          maxNativeZoom={MAX_ZOOM}
          noWrap={true}
          keepBuffer={2}
          updateWhenIdle={true}
          updateWhenZooming={false}
          errorTileUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect width='256' height='256' fill='%23000000'/%3E%3C/svg%3E"
        />
        <MapClickHandler
          onMapClick={handleMapClick}
          addingMarker={addingMarker || addingLabel}
          continuousMode={!!continuousPlacementSettings}
        />
        <AreaLabels
          show={showAreaLabels}
          labels={areaLabels}
          isAdminMode={isAdminMode}
          onDelete={handleDeleteLabel}
        />
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
        {/* Temporary markers for visual feedback */}
        {temporaryMarkers.map((tempMarker) => {
          const category = continuousPlacementSettings ? MARKER_CATEGORIES[continuousPlacementSettings.category] : null;
          if (!category) return null;

          const tempIcon = L.divIcon({
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
                  background-color: ${category.color};
                  width: 28px;
                  height: 28px;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 4px ${category.color}40;
                  position: absolute;
                  animation: pulse 1s infinite;
                "></div>
                <div style="
                  color: white;
                  font-weight: bold;
                  font-size: 18px;
                  position: relative;
                  z-index: 1;
                ">+</div>
              </div>
              <style>
                @keyframes pulse {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.5; transform: scale(1.1); }
                }
              </style>
            `,
            className: 'temp-marker-icon',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          return (
            <Marker
              key={tempMarker.id}
              position={[tempMarker.lat, tempMarker.lng]}
              icon={tempIcon}
            />
          );
        })}
      </MapContainer>

      {/* Add Marker and Label Buttons */}
      {(session || isAdminMode) && (
        <div className="absolute bottom-6 left-6 z-[1001] flex flex-col gap-2">
          <button
            onClick={toggleAddingMarker}
            className={`px-4 py-2 rounded-lg font-semibold shadow-lg transition-all ${
              addingMarker
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : isAdminMode
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {addingMarker ? 'إلغاء إضافة العلامة' : '+ إضافة علامة'}
          </button>

          {isAdminMode && (
            <button
              onClick={toggleAddingLabel}
              className={`px-4 py-2 rounded-lg font-semibold shadow-lg transition-all ${
                addingLabel
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              {addingLabel ? 'إلغاء إضافة العنوان' : '+ إضافة عنوان (Title)'}
            </button>
          )}
        </div>
      )}

      {/* Continuous Placement Indicator */}
      {continuousPlacementSettings && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[1001] bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-md px-6 py-3 rounded-xl shadow-2xl border-2 border-green-500/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-green-100">
                وضع الإضافة المتعددة نشط - انقر على الخريطة لإضافة علامات
              </span>
            </div>
            <div className="text-sm text-green-200 flex items-center gap-2">
              <span className="font-medium">
                {MARKER_CATEGORIES[continuousPlacementSettings.category]?.label}
                {continuousPlacementSettings.subcategory && ` • ${continuousPlacementSettings.subcategory.replace(/_/g, ' ')}`}
              </span>
              {markerCount > 0 && (
                <span className="px-2 py-1 bg-green-500/30 rounded-md font-bold">
                  {markerCount} علامة
                </span>
              )}
            </div>
            <button
              onClick={handleStopContinuousPlacement}
              className="px-3 py-1 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              إنهاء الإضافة
            </button>
          </div>
        </div>
      )}

      {/* Add crosshair cursor when in continuous mode */}
      {continuousPlacementSettings && (
        <style dangerouslySetInnerHTML={{ __html: `
          .leaflet-container {
            cursor: crosshair !important;
          }
        `}} />
      )}

      {/* Add Marker Modal */}
      <AddMarkerModal
        open={addMarkerModalOpen}
        onOpenChange={handleModalOpenChange}
        position={newMarkerPosition}
        mapId="dam"
        onMarkerAdded={handleMarkerAdded}
        onStartContinuousPlacement={handleStartContinuousPlacement}
      />

      {/* Add Area Label Modal */}
      <AddAreaLabelModal
        open={addLabelModalOpen}
        onOpenChange={setAddLabelModalOpen}
        position={newLabelPosition}
        mapId="dam"
        onLabelAdded={handleLabelAdded}
      />
    </div>
  );
});

'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { memo, useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapSidebar } from './MapSidebar';
import { AdminMapSidebar } from './AdminMapSidebar';
import { AddMarkerModal, type MarkerSettings } from './AddMarkerModal';
import { AddAreaLabelModal } from './AddAreaLabelModal';
import { SaveMapPositionButton } from './SaveMapPositionButton';
import { DrawRegionButton } from './DrawRegionButton';
import { RegionDisplay, type MapRegion } from './RegionDisplay';
import { RouteDisplay, type MapRoute } from './RouteDisplay';
import { RouteDrawButton } from './RouteDrawButton';
import { FullscreenButton } from './FullscreenButton';
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
  .leaflet-tile {
    transition: opacity 0s !important;
    opacity: 1 !important;
  }
  .leaflet-tile-loaded {
    opacity: 1 !important;
  }
  .leaflet-zoom-anim .leaflet-zoom-animated {
    transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
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
const MAX_ZOOM_SURFACE = 5;
const MAX_ZOOM_UNDERGROUND = 3;
const MIN_ZOOM = 0;

// Blue Gate uses same coordinate system as other maps
const WORLD_SIZE = 8192;
const SCALE = WORLD_SIZE / TILE_SIZE; // 32

const CustomCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1/SCALE, 0, 1/SCALE, 0)
});

// Default floor-specific center positions
const DEFAULT_FLOOR_CENTERS = {
  surface: L.latLng(4096, 4096),
  underground: L.latLng(4096, 4096),
};
const DEFAULT_ZOOM = 2;

// Create custom marker icons by category and subcategory
function createMarkerIcon(category: string, color: string, subcategory: string | null) {
  const iconPath = subcategory ? SUBCATEGORY_ICONS[subcategory] : null;

  if (iconPath) {
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
      console.log('  addingMarker:', addingMarker, 'continuousMode:', continuousMode);

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
    if (!enabledCategories.has(marker.category)) return false;

    if (marker.subcategory) {
      const enabledSubs = enabledSubcategories[marker.category];
      if (enabledSubs && enabledSubs.size > 0 && !enabledSubs.has(marker.subcategory)) {
        return false;
      }
    }

    if (enabledLootAreas.size > 0) {
      if (!marker.lootAreas || marker.lootAreas.length === 0) {
        return false;
      }
      const hasMatchingLootArea = marker.lootAreas.some((area) =>
        enabledLootAreas.has(area)
      );
      if (!hasMatchingLootArea) return false;
    }

    if (showLockedOnly && !marker.behindLockedDoor) return false;

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

interface BlueGateMapClientProps {
  isAdminMode?: boolean;
}

export const BlueGateMapClient = memo(function BlueGateMapClient({ isAdminMode = false }: BlueGateMapClientProps = {}) {
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFloor, setCurrentFloor] = useState<'surface' | 'underground'>('surface');
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<MarkerCategory[]>(
    Object.entries(MARKER_CATEGORIES).map(([id, data]) => ({
      id,
      label: data.label,
      enabled: false,
      color: data.color,
    }))
  );
  const [enabledSubcategories, setEnabledSubcategories] = useState<Record<string, Set<string>>>({});
  const [enabledLootAreas, setEnabledLootAreas] = useState<Set<string>>(new Set());
  const [showLockedOnly, setShowLockedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAreaLabels, setShowAreaLabels] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [addMarkerModalOpen, setAddMarkerModalOpen] = useState(false);
  const [newMarkerPosition, setNewMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [addingMarker, setAddingMarker] = useState(false);
  const [continuousPlacementSettings, setContinuousPlacementSettings] = useState<MarkerSettings | null>(null);
  const [markerCount, setMarkerCount] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [temporaryMarkers, setTemporaryMarkers] = useState<Array<{ lat: number; lng: number; id: string }>>([]);
  const [areaLabels, setAreaLabels] = useState<AreaLabel[]>([]);
  const [addLabelModalOpen, setAddLabelModalOpen] = useState(false);
  const [newLabelPosition, setNewLabelPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [addingLabel, setAddingLabel] = useState(false);
  const [regions, setRegions] = useState<MapRegion[]>([]);

  // Route state
  const [routes, setRoutes] = useState<MapRoute[]>([]);
  const [activeRoute, setActiveRoute] = useState<MapRoute | null>(null);
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [selectedRouteSlot, setSelectedRouteSlot] = useState<number | null>(null);
  const [editingRoute, setEditingRoute] = useState<{ id: string; coordinates: Array<{ lat: number; lng: number }>; name?: string | null; nameAr?: string | null } | null>(null);

  // Admin tool triggers
  const [triggerDrawRegion, setTriggerDrawRegion] = useState(false);
  const [triggerSavePosition, setTriggerSavePosition] = useState(false);
  const [isDrawingRegion, setIsDrawingRegion] = useState(false);

  // Map configuration state (center and zoom)
  const [mapCenter, setMapCenter] = useState(DEFAULT_FLOOR_CENTERS.surface);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [configLoaded, setConfigLoaded] = useState(false);

  const floors = [
    { id: 'surface' as const, label: 'السطح', labelEn: 'Surface', path: 'blue-gate/surface', maxZoom: MAX_ZOOM_SURFACE },
    { id: 'underground' as const, label: 'تحت الأرض', labelEn: 'Underground', path: 'blue-gate/underground', maxZoom: MAX_ZOOM_UNDERGROUND },
  ];

  const selectedFloor = floors.find(f => f.id === currentFloor) || floors[0];

  // Fetch saved map configuration when floor changes
  useEffect(() => {
    async function fetchMapConfig() {
      setConfigLoaded(false);
      try {
        const mapId = `blue-gate-${currentFloor}`;
        const response = await fetch(`/api/maps/config?mapId=${mapId}`);
        const data = await response.json();

        if (data.success && data.config) {
          setMapCenter(L.latLng(data.config.centerLat, data.config.centerLng));
          setMapZoom(data.config.zoom);
          console.log(`✅ Loaded saved map configuration for ${currentFloor}:`, data.config);
        } else {
          setMapCenter(DEFAULT_FLOOR_CENTERS[currentFloor]);
          setMapZoom(DEFAULT_ZOOM);
          console.log(`ℹ️ Using default map configuration for ${currentFloor}`);
        }
      } catch (error) {
        console.error('❌ Failed to fetch map configuration:', error);
        setMapCenter(DEFAULT_FLOOR_CENTERS[currentFloor]);
        setMapZoom(DEFAULT_ZOOM);
      } finally {
        setConfigLoaded(true);
      }
    }

    fetchMapConfig();
  }, [currentFloor]);

  // Fetch area labels from API (floor-filtered)
  useEffect(() => {
    async function fetchAreaLabels() {
      try {
        const response = await fetch(`/api/maps/blue-gate/labels?floor=${currentFloor}`);
        const data = await response.json();

        if (data.success) {
          setAreaLabels(data.labels);
          console.log(`✅ Loaded ${data.labels.length} area labels for Blue Gate (${currentFloor} floor)`);
        }
      } catch (error) {
        console.error('❌ Failed to fetch Blue Gate area labels:', error);
      }
    }

    fetchAreaLabels();
  }, [currentFloor]);

  // Fetch regions from API
  useEffect(() => {
    async function fetchRegions() {
      try {
        const response = await fetch('/api/maps/regions?mapId=blue-gate');
        const data = await response.json();

        if (data.success) {
          setRegions(data.regions);
          console.log(`✅ Loaded ${data.regions.length} regions`);
        }
      } catch (error) {
        console.error('❌ Failed to fetch regions:', error);
      }
    }

    fetchRegions();
  }, []);

  // Fetch routes from API
  const fetchRoutes = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/maps/routes?mapId=blue-gate');
      const data = await response.json();
      if (data.success) {
        setRoutes(data.routes);
        const visible = data.routes.find((r: MapRoute) => r.visible);
        setActiveRoute(visible || null);
        console.log(`✅ Loaded ${data.routes.length} routes`);
      }
    } catch (error) {
      console.error('❌ Failed to fetch routes:', error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchRoutes();
    }
  }, [session]);

  // Route handlers
  const handleDrawRoute = (routeNumber: number) => {
    setSelectedRouteSlot(routeNumber);
    setIsDrawingRoute(true);
    setEditingRoute(null);
  };

  const handleToggleVisibility = async (routeId: string, routeNumber: number) => {
    try {
      const response = await fetch('/api/maps/routes/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeId, mapId: 'blue-gate' }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchRoutes();
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleEditRoute = (routeId: string, routeNumber: number) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setEditingRoute({
        id: route.id,
        coordinates: route.coordinates,
        name: route.name,
        nameAr: route.nameAr,
      });
      setSelectedRouteSlot(routeNumber);
      setIsDrawingRoute(true);
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    try {
      const response = await fetch(`/api/maps/routes/${routeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        await fetchRoutes();
      }
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  const handleRouteDrawn = async () => {
    setIsDrawingRoute(false);
    setSelectedRouteSlot(null);
    setEditingRoute(null);
    await fetchRoutes();
  };

  const handleCancelDrawing = () => {
    setIsDrawingRoute(false);
    setSelectedRouteSlot(null);
    setEditingRoute(null);
  };

  // Fetch markers from API based on current floor
  useEffect(() => {
    async function fetchMarkers() {
      try {
        setLoading(true);
        const response = await fetch(`/api/maps/blue-gate/markers?floor=${currentFloor}`);
        const data = await response.json();
        if (data.success) {
          setMarkers(data.markers);

          const initialSubcategories: Record<string, Set<string>> = {};
          data.markers.forEach((marker: MapMarker) => {
            if (marker.category && !initialSubcategories[marker.category]) {
              initialSubcategories[marker.category] = new Set();
            }
          });
          setEnabledSubcategories(initialSubcategories);
        }
      } catch (error) {
        console.error('Failed to fetch Blue Gate markers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkers();
  }, [currentFloor]);

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

  const handleRegionsToggle = () => {
    setShowRegions((prev) => !prev);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    if (addingLabel) {
      setNewLabelPosition({ lat, lng });
      setAddLabelModalOpen(true);
      setAddingLabel(false);
      return;
    }

    // zlayers: 1 = underground, 2 = surface
    const zlayers = currentFloor === 'underground' ? 1 : currentFloor === 'surface' ? 2 : 2147483647;

    if (continuousPlacementSettings) {
      const tempId = `temp-${Date.now()}`;
      setTemporaryMarkers(prev => [...prev, { lat, lng, id: tempId }]);

      console.log('📍 Placing marker at:', { lat, lng, zlayers, floor: currentFloor });
      console.log('Settings:', continuousPlacementSettings);

      try {
        const response = await fetch('/api/maps/blue-gate/markers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat,
            lng,
            zlayers,
            category: continuousPlacementSettings.category,
            subcategory: continuousPlacementSettings.subcategory || null,
            instanceName: continuousPlacementSettings.instanceName || null,
            behindLockedDoor: continuousPlacementSettings.behindLockedDoor,
          }),
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (data.success) {
          setMarkerCount(prev => prev + 1);
          setMarkers(prev => [...prev, data.marker]);
          setTemporaryMarkers(prev => prev.filter(m => m.id !== tempId));
        } else {
          console.error('Failed to create marker:', data.error);
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

    if (addingMarker || addMarkerModalOpen) {
      setNewMarkerPosition({ lat, lng });
      if (!addMarkerModalOpen) {
        setAddMarkerModalOpen(true);
      }
    }
  };

  const handleMarkerAdded = async () => {
    try {
      const response = await fetch(`/api/maps/blue-gate/markers?floor=${currentFloor}`);
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
    // Refetch labels for current floor
    try {
      const response = await fetch(`/api/maps/blue-gate/labels?floor=${currentFloor}`);
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
      const response = await fetch(`/api/maps/blue-gate/labels/${labelId}`, {
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

  const handleDeleteMarker = async (markerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه العلامة؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/maps/blue-gate/markers/${markerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        alert('فشل في حذف العلامة');
        return;
      }

      const markersResponse = await fetch(`/api/maps/blue-gate/markers?floor=${currentFloor}`);
      const markersData = await markersResponse.json();
      if (markersData.success) {
        setMarkers(markersData.markers);
      }
    } catch (error) {
      console.error('Error deleting marker:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleRegionDrawn = async () => {
    try {
      const response = await fetch('/api/maps/regions?mapId=blue-gate');
      const data = await response.json();
      if (data.success) {
        setRegions(data.regions);
      }
    } catch (error) {
      console.error('Failed to refetch regions:', error);
    }
  };

  const handleDeleteRegion = async (regionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المنطقة؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/maps/regions/${regionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        alert('فشل في حذف المنطقة');
        return;
      }

      handleRegionDrawn();
    } catch (error) {
      console.error('Error deleting region:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div ref={containerRef} className="w-full h-[calc(100vh-20rem)] min-h-[600px] relative rounded-xl overflow-hidden border-2 border-border/50 bg-black shadow-2xl">
      <style dangerouslySetInnerHTML={{ __html: mapStyles }} />

      {/* Fullscreen Button */}
      <FullscreenButton containerRef={containerRef} />

      {/* Sidebar */}
      {isAdminMode ? (
        <AdminMapSidebar
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
          showRegions={showRegions}
          onRegionsToggle={handleRegionsToggle}
          onDrawRegion={() => setTriggerDrawRegion(prev => !prev)}
          onAddMarker={toggleAddingMarker}
          onAddLabel={toggleAddingLabel}
          onSavePosition={() => setTriggerSavePosition(prev => !prev)}
          isDrawingRegion={isDrawingRegion}
          isAddingMarker={addingMarker}
          isAddingLabel={addingLabel}
          routes={routes}
          onDrawRoute={handleDrawRoute}
          onToggleRouteVisibility={handleToggleVisibility}
          onEditRoute={handleEditRoute}
          onDeleteRoute={handleDeleteRoute}
          showRoutes={!!session?.user?.id && !isDrawingRoute}
        />
      ) : (
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
          showRegions={showRegions}
          onRegionsToggle={handleRegionsToggle}
          routes={routes}
          onDrawRoute={handleDrawRoute}
          onToggleRouteVisibility={handleToggleVisibility}
          onEditRoute={handleEditRoute}
          onDeleteRoute={handleDeleteRoute}
          showRoutes={!!session?.user?.id && !isDrawingRoute}
        />
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 right-4 z-[1001] bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-md px-5 py-3 rounded-xl shadow-2xl border border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-primary">جاري تحميل العلامات...</span>
          </div>
        </div>
      )}

      {/* Floor Selector */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
        {floors.map((floor) => (
          <button
            key={floor.id}
            onClick={() => setCurrentFloor(floor.id)}
            className={`
              group relative px-4 py-3 rounded-lg border-2 backdrop-blur-md transition-all duration-200
              ${currentFloor === floor.id
                ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20'
                : 'bg-background/50 border-border/50 hover:bg-background/70 hover:border-border'
              }
            `}
            title={floor.labelEn}
          >
            <div className="flex items-center gap-2">
              {floor.id === 'surface' ? (
                <ChevronUp className={`w-4 h-4 ${currentFloor === floor.id ? 'text-primary' : 'text-muted-foreground'}`} />
              ) : (
                <ChevronDown className={`w-4 h-4 ${currentFloor === floor.id ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
              <span className={`text-sm font-bold ${currentFloor === floor.id ? 'text-primary' : 'text-muted-foreground'}`}>
                {floor.label}
              </span>
            </div>

            {/* Tooltip */}
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-popover border border-border shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
              <span className="text-xs font-medium">{floor.labelEn}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Map - Only render after config is loaded */}
      {configLoaded && (
        <MapContainer
          key={`blue-gate-${currentFloor}`}
          center={mapCenter}
          zoom={mapZoom}
          minZoom={MIN_ZOOM}
          maxZoom={selectedFloor.maxZoom}
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
          key={`floor-${currentFloor}`}
          url={`/imagesmaps/${selectedFloor.path}/{z}/{x}/{y}.webp`}
          tileSize={TILE_SIZE}
          minZoom={MIN_ZOOM}
          maxZoom={selectedFloor.maxZoom}
          minNativeZoom={MIN_ZOOM}
          maxNativeZoom={selectedFloor.maxZoom}
          noWrap={true}
          keepBuffer={12}
          bounds={undefined}
          updateWhenIdle={false}
          updateWhenZooming={true}
          updateInterval={100}
          className="map-tiles"
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
        <RegionDisplay
          regions={regions}
          show={showRegions}
          isAdminMode={isAdminMode}
          onDelete={handleDeleteRegion}
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
        {/* Save Map Position Button (Admin Only) */}
        {isAdminMode && (
          <SaveMapPositionButton
            mapId={`blue-gate-${currentFloor}`}
            hideUI={true}
            triggerSave={triggerSavePosition}
          />
        )}
        {/* Draw Region Button (Admin Only) */}
        {isAdminMode && (
          <DrawRegionButton
            mapId="blue-gate"
            onRegionDrawn={handleRegionDrawn}
            hideUI={true}
            triggerStart={triggerDrawRegion}
            onDrawingStateChange={setIsDrawingRegion}
          />
        )}

        {/* User routes */}
        {session?.user?.id && (
          <>
            <RouteDisplay route={activeRoute} />
            {isDrawingRoute && selectedRouteSlot && (
              <RouteDrawButton
                mapId="blue-gate"
                routeSlot={selectedRouteSlot}
                existingRoute={editingRoute}
                onRouteDrawn={handleRouteDrawn}
                onCancel={handleCancelDrawing}
                isDrawing={isDrawingRoute}
                onDrawingStateChange={setIsDrawingRoute}
              />
            )}
          </>
        )}
      </MapContainer>
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
        mapId="blue-gate"
        onMarkerAdded={handleMarkerAdded}
        onStartContinuousPlacement={handleStartContinuousPlacement}
        zlayers={currentFloor === 'underground' ? 1 : currentFloor === 'surface' ? 2 : 2147483647}
        showFloorSelector={isAdminMode}
        currentFloor={currentFloor === 'surface' ? 'top' : 'bottom'}
        floorOptions={[
          { value: 'top', label: 'السطح', labelEn: 'Surface' },
          { value: 'bottom', label: 'تحت الأرض', labelEn: 'Underground' },
        ]}
      />

      {/* Add Area Label Modal */}
      <AddAreaLabelModal
        open={addLabelModalOpen}
        onOpenChange={setAddLabelModalOpen}
        position={newLabelPosition}
        mapId="blue-gate"
        onLabelAdded={handleLabelAdded}
        showFloorSelector={isAdminMode}
        currentFloor={currentFloor === 'surface' ? 'top' : 'bottom'}
        floorOptions={[
          { value: 'top', label: 'السطح', labelEn: 'Surface' },
          { value: 'bottom', label: 'تحت الأرض', labelEn: 'Underground' },
        ]}
      />
    </div>
  );
});

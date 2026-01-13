'use client';

import { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Save } from 'lucide-react';

interface SaveMapPositionButtonProps {
  mapId: string;
  onSave?: () => void;
  triggerSave?: boolean;
  hideUI?: boolean;
}

export function SaveMapPositionButton({ mapId, onSave, triggerSave, hideUI = false }: SaveMapPositionButtonProps) {
  const map = useMap();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);

  const handleSavePosition = async () => {
    try {
      setSaving(true);
      const center = map.getCenter();
      const zoom = map.getZoom();

      const response = await fetch('/api/maps/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapId,
          centerLat: center.lat,
          centerLng: center.lng,
          zoom,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLastSaved({
          lat: center.lat,
          lng: center.lng,
          zoom,
        });
        alert('✅ تم حفظ موضع الخريطة بنجاح!\n\nالمركز: ' + center.lat.toFixed(3) + ', ' + center.lng.toFixed(3) + '\nالتكبير: ' + zoom);
        if (onSave) onSave();
      } else {
        alert('❌ فشل في حفظ موضع الخريطة');
      }
    } catch (error) {
      console.error('Error saving map position:', error);
      alert('❌ حدث خطأ أثناء حفظ موضع الخريطة');
    } finally {
      setSaving(false);
    }
  };

  // Effect to respond to external trigger
  useEffect(() => {
    if (triggerSave && !saving) {
      handleSavePosition();
    }
  }, [triggerSave]);

  if (hideUI) return null;

  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: '80px', marginLeft: '10px' }}>
      <div className="leaflet-control">
        <button
          onClick={handleSavePosition}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded-lg shadow-lg font-semibold transition-colors"
          title="حفظ موضع الخريطة الحالي كافتراضي"
        >
          <Save className="w-4 h-4" />
          {saving ? 'جاري الحفظ...' : 'حفظ الموضع الافتراضي'}
        </button>
        {lastSaved && (
          <div className="mt-2 text-xs bg-green-100 text-green-800 px-3 py-2 rounded-md shadow">
            <div className="font-bold mb-1">آخر حفظ:</div>
            <div>المركز: {lastSaved.lat.toFixed(3)}, {lastSaved.lng.toFixed(3)}</div>
            <div>التكبير: {lastSaved.zoom}</div>
          </div>
        )}
      </div>
    </div>
  );
}

import { MapIframe } from '@/app/features/maps/components/MapIframe';

export default function BuriedCityPage() {
  return (
    <MapIframe
      src="https://mapgenie.io/arc-raiders/maps/buried-city?embed=light"
      title="Buried City Interactive Map"
      mapName="Buried City"
    />
  );
}

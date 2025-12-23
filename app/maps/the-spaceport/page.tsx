import { MapIframe } from '@/app/features/maps/components/MapIframe';

export default function SpaceportPage() {
  return (
    <MapIframe
      src="https://mapgenie.io/arc-raiders/maps/spaceport?embed=light"
      title="Spaceport Interactive Map"
      mapName="The Spaceport"
    />
  );
}

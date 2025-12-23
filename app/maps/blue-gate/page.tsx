import { MapIframe } from '@/app/features/maps/components/MapIframe';

export default function BlueGatePage() {
  return (
    <MapIframe
      src="https://mapgenie.io/arc-raiders/maps/the-blue-gate?embed=light"
      title="The Blue Gate Interactive Map"
      mapName="Blue Gate"
    />
  );
}

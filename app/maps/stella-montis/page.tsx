import { MapIframe } from '@/app/features/maps/components/MapIframe';

export default function StellaMontisPage() {
  return (
    <MapIframe
      src="https://mapgenie.io/arc-raiders/maps/stella-montis?embed=light"
      title="Stella Montis Interactive Map"
      mapName="Stella Montis"
    />
  );
}

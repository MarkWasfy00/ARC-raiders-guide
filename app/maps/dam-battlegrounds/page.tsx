import { MapIframe } from '@/app/features/maps/components/MapIframe';

export default function DamBattlegroundsPage() {
  return (
    <MapIframe
      src="https://mapgenie.io/arc-raiders/maps/dam-battlegrounds?embed=light"
      title="Dam Battlegrounds Interactive Map"
      mapName="Dam Battlegrounds"
    />
  );
}

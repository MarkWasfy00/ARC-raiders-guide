import { isFeatureEnabledCached } from "@/lib/services/settings-cache";
import { FeatureDisabled } from "@/components/common/FeatureDisabled";

export default async function MapsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isEnabled = await isFeatureEnabledCached("enable_maps");
  if (!isEnabled) {
    return <FeatureDisabled featureName="Maps" featureNameAr="الخرائط" />;
  }

  return <>{children}</>;
}

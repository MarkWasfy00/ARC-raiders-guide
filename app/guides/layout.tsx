import { isFeatureEnabledCached } from "@/lib/services/settings-cache";
import { FeatureDisabled } from "@/components/common/FeatureDisabled";

export default async function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isEnabled = await isFeatureEnabledCached("enable_guides");
  if (!isEnabled) {
    return <FeatureDisabled featureName="Guides" featureNameAr="الأدلة" />;
  }

  return <>{children}</>;
}

import { RegisterForm } from "@/app/features/auth";
import { isFeatureEnabledCached } from "@/lib/services/settings-cache";
import { FeatureDisabled } from "@/components/common/FeatureDisabled";

export default async function RegisterPage() {
  const isEnabled = await isFeatureEnabledCached("enable_registration");
  if (!isEnabled) {
    return <FeatureDisabled featureName="Registration" featureNameAr="التسجيل" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}

import { isFeatureEnabledCached } from "@/lib/services/settings-cache";
import { FeatureDisabled } from "@/components/common/FeatureDisabled";
import { ChatPageClient } from "./ChatPageClient";

export default async function ChatPage() {
  const isEnabled = await isFeatureEnabledCached("enable_chat");
  if (!isEnabled) {
    return <FeatureDisabled featureName="Chat" featureNameAr="المحادثات" />;
  }

  return <ChatPageClient />;
}

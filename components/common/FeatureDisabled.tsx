import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

interface FeatureDisabledProps {
  featureName: string;
  featureNameAr: string;
}

export function FeatureDisabled({ featureName, featureNameAr }: FeatureDisabledProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
          <ShieldOff className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{featureNameAr} غير متاحة حالياً</h1>
        <p className="text-muted-foreground mb-2">
          {featureName} is currently disabled
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          هذه الميزة معطلة مؤقتاً. يرجى المحاولة لاحقاً.
        </p>
        <Button asChild>
          <Link href="/">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  );
}

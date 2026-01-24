"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, LogOut } from "lucide-react";

interface OwnerTradingBannerProps {
  itemName: string;
  onLeaveQueue: () => void;
  isLeaving?: boolean;
}

export function OwnerTradingBanner({
  itemName,
  onLeaveQueue,
  isLeaving = false,
}: OwnerTradingBannerProps) {
  return (
    <div className="p-4 bg-amber-600/20 border-y border-amber-600/30">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <AlertCircle className="h-5 w-5 text-amber-400" />
        </div>

        <div className="flex-1">
          <p className="font-semibold text-amber-400">
            المالك يتداول حالياً مع مستخدم آخر
          </p>
          <p className="text-sm text-amber-300/80 mt-1">
            أنت في قائمة الانتظار لـ "{itemName}". سنُعلمك إذا أصبح المالك متاحاً مرة أخرى.
          </p>

          <div className="flex items-center gap-2 mt-3 text-xs text-amber-300/70">
            <Clock className="h-3 w-3" />
            <span>لا يمكنك إرسال رسائل حتى يتم اختيارك</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onLeaveQueue}
          disabled={isLeaving}
          className="shrink-0 border-amber-600/50 text-amber-400 hover:bg-amber-600/20 hover:text-amber-300"
        >
          {isLeaving ? (
            "جاري المغادرة..."
          ) : (
            <>
              <LogOut className="h-4 w-4 ml-1" />
              مغادرة القائمة
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

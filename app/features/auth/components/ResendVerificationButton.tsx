"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import { resendVerificationAction } from "../services/verification-actions";

interface ResendVerificationButtonProps {
  email: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
}

export function ResendVerificationButton({
  email,
  variant = "outline",
  className = "",
}: ResendVerificationButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = () => {
    setError(null);
    startTransition(async () => {
      const result = await resendVerificationAction(email);
      if (result.success) {
        setSent(true);
        // Reset after 60 seconds to allow resending again
        setTimeout(() => setSent(false), 60000);
      } else {
        setError(result.error || "حدث خطأ أثناء إرسال الرسالة");
      }
    });
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">تم إرسال رسالة التأكيد</span>
        </div>
        <p className="text-xs text-muted-foreground">
          يمكنك إعادة الإرسال بعد دقيقة واحدة
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant={variant}
        onClick={handleResend}
        disabled={isPending}
        className={className}
      >
        {isPending ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          <>
            <Mail className="ml-2 h-4 w-4" />
            إعادة إرسال رسالة التأكيد
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

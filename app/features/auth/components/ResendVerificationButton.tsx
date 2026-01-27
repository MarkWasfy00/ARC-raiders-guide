"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { resendVerificationAction, getResendStatusAction } from "../services/verification-actions";

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
  const [remainingAttempts, setRemainingAttempts] = useState<number>(3);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // Fetch initial status
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getResendStatusAction(email);
      setRemainingAttempts(status.remainingAttempts);
      setCooldownSeconds(status.cooldownSeconds);
    };
    fetchStatus();
  }, [email]);

  // Countdown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownSeconds]);

  const handleResend = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const result = await resendVerificationAction(email);
      if (result.success) {
        setSent(true);
        setRemainingAttempts(result.remainingAttempts ?? 0);
        setCooldownSeconds(60);
        // Reset sent status after cooldown
        setTimeout(() => setSent(false), 60000);
      } else {
        setError(result.error || "حدث خطأ أثناء إرسال الرسالة");
        if (result.remainingAttempts !== undefined) {
          setRemainingAttempts(result.remainingAttempts);
        }
        if (result.cooldownSeconds !== undefined) {
          setCooldownSeconds(result.cooldownSeconds);
        }
      }
    });
  }, [email]);

  const isDisabled = isPending || cooldownSeconds > 0 || remainingAttempts <= 0;

  // No more attempts left
  if (remainingAttempts <= 0) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">تم استنفاد محاولات إعادة الإرسال</span>
        </div>
        <p className="text-xs text-muted-foreground">
          يرجى التواصل مع الدعم للمساعدة
        </p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">تم إرسال رسالة التأكيد</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {cooldownSeconds > 0
            ? `يمكنك إعادة الإرسال بعد ${cooldownSeconds} ثانية`
            : "يمكنك إعادة الإرسال الآن"}
        </p>
        <p className="text-xs text-muted-foreground">
          المحاولات المتبقية: {remainingAttempts} من 3
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant={variant}
        onClick={handleResend}
        disabled={isDisabled}
        className={className}
      >
        {isPending ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            جاري الإرسال...
          </>
        ) : cooldownSeconds > 0 ? (
          <>
            <Mail className="ml-2 h-4 w-4" />
            انتظر {cooldownSeconds} ثانية
          </>
        ) : (
          <>
            <Mail className="ml-2 h-4 w-4" />
            إعادة إرسال رسالة التأكيد
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        المحاولات المتبقية: {remainingAttempts} من 3
      </p>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

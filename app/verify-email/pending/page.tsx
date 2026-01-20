"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import Link from "next/link";
import { ResendVerificationButton } from "@/app/features/auth/components/ResendVerificationButton";
import { Suspense } from "react";

function PendingContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>تحقق من بريدك الإلكتروني</CardTitle>
        <CardDescription>
          تم إنشاء حسابك بنجاح!
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          لقد أرسلنا رسالة تأكيد إلى
          {email && (
            <span className="block font-medium text-foreground mt-1">{email}</span>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          يرجى النقر على الرابط في الرسالة لتأكيد بريدك الإلكتروني
        </p>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-3">
            لم تتلقَ الرسالة؟
          </p>
          {email ? (
            <ResendVerificationButton email={email} />
          ) : (
            <p className="text-sm text-muted-foreground">
              يرجى التحقق من مجلد البريد المزعج
            </p>
          )}
        </div>

        <div className="pt-4">
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">العودة لتسجيل الدخول</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPendingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>جاري التحميل...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <PendingContent />
      </Suspense>
    </main>
  );
}

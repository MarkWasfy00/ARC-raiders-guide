import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { verifyEmailAction } from "@/app/features/auth/services/verification-actions";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

async function VerifyEmailContent({ token }: { token?: string }) {
  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>رمز التحقق مفقود</CardTitle>
          <CardDescription>
            لم يتم العثور على رمز التحقق في الرابط
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            يرجى التأكد من استخدام الرابط الصحيح من رسالة البريد الإلكتروني
          </p>
          <Button asChild>
            <Link href="/login">العودة لتسجيل الدخول</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const result = await verifyEmailAction(token);

  if (result.success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>تم تأكيد البريد الإلكتروني</CardTitle>
          <CardDescription>
            تم تأكيد بريدك الإلكتروني بنجاح
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            يمكنك الآن تسجيل الدخول إلى حسابك
          </p>
          <Button asChild>
            <Link href="/login">تسجيل الدخول</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle>فشل التحقق</CardTitle>
        <CardDescription>
          {result.error || "حدث خطأ أثناء التحقق من البريد الإلكتروني"}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          قد يكون الرابط منتهي الصلاحية أو تم استخدامه مسبقاً
        </p>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/login">العودة لتسجيل الدخول</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
        <CardTitle>جاري التحقق...</CardTitle>
        <CardDescription>
          يرجى الانتظار بينما نتحقق من بريدك الإلكتروني
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Suspense fallback={<LoadingState />}>
        <VerifyEmailContent token={params.token} />
      </Suspense>
    </main>
  );
}

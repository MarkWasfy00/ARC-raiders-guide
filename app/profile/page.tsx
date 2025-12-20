import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileForm, getUserProfile } from "@/app/features/profile";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await getUserProfile();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">إعدادات الملف الشخصي</h1>
          <p className="text-muted-foreground">إدارة حسابك وملفاتك الشخصية للألعاب</p>
        </div>

        <ProfileForm user={user} />
      </div>
    </main>
  );
}

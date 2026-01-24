import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GuideForm } from "@/app/features/guides/components/GuideForm";

export const metadata = {
  title: "إنشاء دليل جديد | الإدارة",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewGuidePage() {
  const session = await auth();

  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  if (!session?.user?.role || !isStaff) {
    redirect("/login");
  }

  const categories = await prisma.guideCategory.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">إنشاء دليل جديد</h1>
        <GuideForm categories={categories} />
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GuidesList } from "./GuidesList";

export const metadata = {
  title: "إدارة الأدلة | الإدارة",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminGuidesPage() {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const guides = await prisma.guide.findMany({
    include: {
      author: {
        select: { id: true, username: true, name: true, image: true },
      },
      category: true,
      tags: true,
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">إدارة الأدلة</h1>
        </div>
        <GuidesList guides={guides} />
      </div>
    </main>
  );
}

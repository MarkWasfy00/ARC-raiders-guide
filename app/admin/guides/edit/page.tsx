import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GuideForm } from "@/app/features/guides/components/GuideForm";

export const metadata = {
  title: "تعديل الدليل | الإدارة",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const params = await searchParams;
  const guideId = params.id;

  if (!guideId) {
    notFound();
  }

  const [guide, categories] = await Promise.all([
    prisma.guide.findUnique({
      where: { id: guideId },
      include: {
        author: {
          select: { id: true, username: true, name: true, image: true },
        },
        category: true,
        tags: true,
      },
    }),
    prisma.guideCategory.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!guide) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">تعديل الدليل</h1>
        <GuideForm guide={guide} categories={categories} />
      </div>
    </main>
  );
}

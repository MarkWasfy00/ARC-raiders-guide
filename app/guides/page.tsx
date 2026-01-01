import Link from "next/link";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { GuideCard } from "@/app/features/guides/components/GuideCard";
import { Pagination } from "@/components/common/Pagination";

export const metadata = {
  title: "الأدلة | ARC Raiders",
  description: "تصفح الأدلة الشاملة لـ ARC Raiders",
};

interface GuidesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const params = await searchParams;
  const rawPage = Number(params.page || 1);
  const pageSize = 12;

  // Count total published guides
  const totalGuides = await prisma.guide.count({
    where: { published: true },
  });

  const totalPages = Math.max(1, Math.ceil(totalGuides / pageSize));
  const currentPage = Math.min(Math.max(Number.isNaN(rawPage) ? 1 : rawPage, 1), totalPages);

  // Fetch guides for current page
  const guides = await prisma.guide.findMany({
    where: { published: true },
    include: {
      author: {
        select: { id: true, username: true, name: true, image: true },
      },
      category: true,
      tags: true,
    },
    orderBy: { publishedAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return (
    <div className="w-full px-[100px] py-8 space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          Arc Raiders
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">الأدلة</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">الأدلة</h1>
        </div>
        <button
          className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary"
          aria-label="حفظ صفحة الأدلة في المفضلة"
          type="button"
        >
          <Star className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {guides.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">لا توجد أدلة متاحة بعد.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/guides" className="pt-4" />
          )}
        </>
      )}
    </div>
  );
}

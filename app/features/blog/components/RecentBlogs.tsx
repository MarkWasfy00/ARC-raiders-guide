import { prisma } from "@/lib/prisma";
import { BlogCard } from "./BlogCard";

/**
 * Displays the most recent published blog posts
 * Server Component that fetches data from the database
 */
export async function RecentBlogs({ limit = 8 }: { limit?: number }) {
  const blogs = await prisma.blog.findMany({
    where: { published: true },
    include: {
      author: {
        select: { id: true, username: true, name: true, image: true },
      },
      category: true,
      _count: { select: { comments: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>لا توجد مقالات منشورة حالياً</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/app/features/blog/components/BlogForm";
import { CommentModeration } from "./CommentModeration";

export const metadata = {
  title: "تعديل المقالة | الإدارة",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();

  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  if (!session?.user?.role || !isStaff) {
    redirect("/login");
  }

  const params = await searchParams;
  const blogId = params.id;

  if (!blogId) {
    notFound();
  }

  const [blog, categories] = await Promise.all([
    prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        author: {
          select: { id: true, username: true, name: true, image: true },
        },
        category: true,
        tags: true,
        comments: {
          include: {
            user: {
              select: { id: true, username: true, name: true, image: true },
            },
            replies: {
              include: {
                user: {
                  select: { id: true, username: true, name: true, image: true },
                },
              },
              orderBy: { created_at: "asc" },
            },
          },
          where: { parentId: null },
          orderBy: { created_at: "desc" },
        },
      },
    }),
    prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!blog) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">تعديل المقالة</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BlogForm blog={blog} categories={categories} />
          </div>

          <div className="lg:col-span-1">
            <CommentModeration blogId={blog.id} comments={blog.comments} />
          </div>
        </div>
      </div>
    </main>
  );
}

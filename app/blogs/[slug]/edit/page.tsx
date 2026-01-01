import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/app/features/blog/components/BlogForm";
import { extractBlogIdFromSlug } from "@/app/features/blog/utils/slugify";

interface EditBlogPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "تعديل المقالة | المدونة",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { slug } = await params;

  // Extract blog ID from slug and find by ID prefix
  const idPrefix = extractBlogIdFromSlug(slug);
  const blog = await prisma.blog.findFirst({
    where: {
      id: { startsWith: idPrefix },
    },
    include: {
      author: {
        select: { id: true, username: true, name: true, image: true },
      },
      category: true,
      tags: true,
    },
  });

  if (!blog) {
    notFound();
  }

  // Only author can edit
  if (blog.authorId !== session.user.id) {
    redirect(`/blogs/${slug}`);
  }

  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">تعديل المقالة</h1>
        <BlogForm blog={blog} categories={categories} />
      </div>
    </main>
  );
}

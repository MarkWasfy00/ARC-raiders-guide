import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/app/features/blog/components/BlogForm";

export const metadata: Metadata = {
  title: "إنشاء مقالة جديدة | المدونة",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewBlogPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">إنشاء مقالة جديدة</h1>
        <BlogForm categories={categories} />
      </div>
    </main>
  );
}

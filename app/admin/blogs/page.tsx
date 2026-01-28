import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BlogsList } from "./BlogsList";

export const metadata = {
  title: "إدارة المقالات | الإدارة",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBlogsPage() {
  const session = await auth();

  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  if (!session?.user?.role || !isStaff) {
    redirect("/login");
  }

  const blogs = await prisma.blog.findMany({
    include: {
      author: {
        select: { id: true, username: true, name: true, image: true },
      },
      category: true,
      tags: true,
      _count: { select: { comments: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">إدارة المقالات</h1>
        </div>
        <BlogsList blogs={blogs} />
      </div>
    </main>
  );
}

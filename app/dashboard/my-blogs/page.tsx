import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MyBlogsList } from "@/app/features/blog/components/MyBlogsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "مقالاتي | لوحة التحكم",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MyBlogsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const blogs = await prisma.blog.findMany({
    where: { authorId: session.user.id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
      category: true,
      _count: { select: { comments: true } },
    },
    orderBy: { updated_at: "desc" },
  });

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">مقالاتي</h1>
            <p className="text-muted-foreground">إدارة مقالاتك</p>
          </div>

          <Button asChild>
            <Link href="/blogs/new">
              <Plus className="h-4 w-4 ml-1" />
              مقالة جديدة
            </Link>
          </Button>
        </div>

        <MyBlogsList blogs={blogs} />
      </div>
    </main>
  );
}

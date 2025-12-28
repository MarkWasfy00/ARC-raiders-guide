import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BlogContent } from "@/app/features/blog/components/BlogContent";
import { CommentSection } from "@/app/features/blog/components/CommentSection";
import { incrementViewCount } from "@/app/features/blog/services/blog-actions";
import { extractBlogIdFromSlug } from "@/app/features/blog/utils/slugify";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Extract blog ID from slug and find by ID prefix
  const idPrefix = extractBlogIdFromSlug(slug);
  const blog = await prisma.blog.findFirst({
    where: {
      id: { startsWith: idPrefix },
    },
    select: {
      title: true,
      excerpt: true,
      featuredImage: true,
    },
  });

  if (!blog) {
    return {
      title: "مقالة غير موجودة",
    };
  }

  return {
    title: `${blog.title} | المدونة`,
    description: blog.excerpt || undefined,
    openGraph: {
      title: blog.title,
      description: blog.excerpt || undefined,
      images: blog.featuredImage ? [blog.featuredImage] : undefined,
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const session = await auth();
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
      tags: { select: { tag: true } },
      _count: { select: { comments: true } },
      comments: {
        where: { parentId: null }, // Top-level comments only
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
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!blog) {
    notFound();
  }

  // If unpublished, only author can view
  if (!blog.published && blog.authorId !== session?.user?.id) {
    notFound();
  }

  // Increment view count (async, don't await)
  incrementViewCount(blog.id);

  return (
    <main className="min-h-screen">
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <BlogContent blog={blog} currentUserId={session?.user?.id} />

        <div className="mt-12 pt-8 border-t">
          <CommentSection
            blogId={blog.id}
            comments={blog.comments}
            currentUserId={session?.user?.id}
          />
        </div>
      </article>
    </main>
  );
}

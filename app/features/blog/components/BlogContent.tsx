"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, MessageSquare, Edit, Trash2 } from "lucide-react";
import { deleteBlog } from "../services/blog-actions";
import { sanitizeHtml } from "../utils/sanitize";
import type { BlogData } from "../types";

interface BlogContentProps {
  blog: BlogData;
  currentUserId?: string;
  currentUserRole?: string;
}

export function BlogContent({ blog, currentUserId, currentUserRole }: BlogContentProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const isAuthor = currentUserId === blog.authorId;
  const isStaff = currentUserRole === 'ADMIN' || currentUserRole === 'MODERATOR';
  const canEdit = isAuthor || isStaff;

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذه المقالة؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }

    setDeleting(true);

    try {
      const result = await deleteBlog(blog.id);

      if (!result.success) {
        alert(result.error?.message || "فشل حذف المقالة");
        return;
      }

      router.push("/blogs");
    } catch (error) {
      console.error("Delete error:", error);
      alert("حدث خطأ أثناء حذف المقالة");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="space-y-6">
      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Header */}
      <div className="space-y-4">
        {/* Category */}
        {blog.category && (
          <Badge
            style={{ backgroundColor: blog.category.color || undefined }}
            className="text-sm"
          >
            {blog.category.name}
          </Badge>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold">{blog.title}</h1>

        {/* Meta */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={blog.author.image || undefined} />
              <AvatarFallback>
                {blog.author.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{blog.author.username || blog.author.name}</p>
              <p className="text-sm text-muted-foreground">
                {blog.publishedAt
                  ? formatDistanceToNow(new Date(blog.publishedAt), {
                      locale: ar,
                      addSuffix: true,
                    })
                  : formatDistanceToNow(new Date(blog.created_at), {
                      locale: ar,
                      addSuffix: true,
                    })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {blog.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {blog._count?.comments || 0}
            </span>
          </div>
        </div>

        {/* Author/Staff Actions */}
        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(isStaff ? `/admin/blogs/edit?id=${blog.id}` : `/blogs/${blog.slug}/edit`)}
            >
              <Edit className="h-4 w-4 ml-1" />
              تعديل
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 ml-1" />
              {deleting ? "جاري الحذف..." : "حذف"}
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none"
        dir="rtl"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.content) }}
      />

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="pt-6 border-t">
          <h3 className="text-sm font-medium mb-2">الوسوم:</h3>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tagObj) => (
              <Badge key={tagObj.tag} variant="secondary">
                {tagObj.tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

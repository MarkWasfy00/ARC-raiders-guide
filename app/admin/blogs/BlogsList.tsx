"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, EyeOff, MessageSquare } from "lucide-react";
import { deleteBlog, togglePublishBlog } from "@/app/features/blog/services/blog-actions";
import type { BlogData } from "@/app/features/blog/types";

interface BlogsListProps {
  blogs: (BlogData & { _count?: { comments: number } })[];
}

export function BlogsList({ blogs }: BlogsListProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleDelete = async (blogId: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${title}"؟ سيتم حذف جميع التعليقات أيضاً.`)) {
      return;
    }

    setDeleting(blogId);
    try {
      const result = await deleteBlog(blogId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error?.message || "فشل حذف المقالة");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("فشل حذف المقالة");
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublish = async (blogId: string) => {
    setToggling(blogId);
    try {
      const result = await togglePublishBlog(blogId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error?.message || "فشل تغيير حالة النشر");
      }
    } catch (error) {
      console.error("Toggle error:", error);
      alert("فشل تغيير حالة النشر");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-4">
      {blogs.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">لا توجد مقالات بعد.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-right p-4">العنوان</th>
                <th className="text-right p-4">الكاتب</th>
                <th className="text-right p-4">التصنيف</th>
                <th className="text-right p-4">الحالة</th>
                <th className="text-right p-4">التعليقات</th>
                <th className="text-right p-4">المشاهدات</th>
                <th className="text-right p-4">تاريخ الإنشاء</th>
                <th className="text-left p-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id} className="border-t hover:bg-muted/50">
                  <td className="p-4">
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {blog.title}
                    </Link>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm text-muted-foreground">
                      {blog.author.username || blog.author.name}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {blog.category ? (
                      <span className="text-sm text-muted-foreground">
                        {blog.category.name}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        بدون تصنيف
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {blog.published ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        منشور
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                        مسودة
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {blog._count?.comments || 0}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm text-muted-foreground">
                      {blog.viewCount}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm text-muted-foreground">
                      {new Date(blog.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-start gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(blog.id)}
                        disabled={toggling === blog.id}
                        title={blog.published ? "إلغاء النشر" : "نشر"}
                      >
                        {blog.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Link href={`/admin/blogs/edit?id=${blog.id}`}>
                        <Button variant="ghost" size="sm" title="تعديل">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(blog.id, blog.title)}
                        disabled={deleting === blog.id}
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

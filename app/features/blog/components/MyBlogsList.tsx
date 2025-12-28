"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Eye, MessageSquare, FileText } from "lucide-react";
import { deleteBlog, togglePublishBlog } from "../services/blog-actions";
import { Switch } from "@/components/ui/switch";
import type { BlogData } from "../types";

interface MyBlogsListProps {
  blogs: BlogData[];
}

export function MyBlogsList({ blogs }: MyBlogsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (blogId: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${title}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      return;
    }

    setDeletingId(blogId);

    try {
      const result = await deleteBlog(blogId);

      if (!result.success) {
        alert(result.error?.message || "فشل حذف المقالة");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert("حدث خطأ أثناء حذف المقالة");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (blogId: string) => {
    setTogglingId(blogId);

    try {
      const result = await togglePublishBlog(blogId);

      if (!result.success) {
        alert(result.error?.message || "فشل تغيير حالة النشر");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Toggle error:", error);
      alert("حدث خطأ");
    } finally {
      setTogglingId(null);
    }
  };

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">لا توجد مقالات بعد</h3>
        <p className="text-muted-foreground mb-4">ابدأ بإنشاء مقالتك الأولى</p>
        <Button asChild>
          <Link href="/blogs/new">إنشاء مقالة جديدة</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>العنوان</TableHead>
            <TableHead>التصنيف</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الإحصائيات</TableHead>
            <TableHead>آخر تحديث</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogs.map((blog) => (
            <TableRow key={blog.id}>
              <TableCell>
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="font-medium hover:underline"
                >
                  {blog.title}
                </Link>
              </TableCell>

              <TableCell>
                {blog.category && (
                  <Badge
                    style={{ backgroundColor: blog.category.color || undefined }}
                    variant="outline"
                  >
                    {blog.category.name}
                  </Badge>
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={blog.published}
                    onCheckedChange={() => handleTogglePublish(blog.id)}
                    disabled={togglingId === blog.id}
                  />
                  <span className="text-sm">
                    {blog.published ? "منشور" : "مسودة"}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {blog.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {blog._count?.comments || 0}
                  </span>
                </div>
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(blog.updated_at), {
                  locale: ar,
                  addSuffix: true,
                })}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <Link href={`/blogs/${blog.slug}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(blog.id, blog.title)}
                    disabled={deletingId === blog.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

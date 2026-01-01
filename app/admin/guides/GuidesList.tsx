"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { deleteGuide, togglePublishGuide } from "@/app/features/guides/services/guide-actions";
import type { GuideData } from "@/app/features/guides/types";

interface GuidesListProps {
  guides: GuideData[];
}

export function GuidesList({ guides }: GuidesListProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleDelete = async (guideId: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${title}"؟ هذا الإجراء لا رجعة فيه.`)) {
      return;
    }

    setDeleting(guideId);
    try {
      const result = await deleteGuide(guideId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error?.message || "فشل حذف الدليل");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("فشل حذف الدليل");
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublish = async (guideId: string) => {
    setToggling(guideId);
    try {
      const result = await togglePublishGuide(guideId);
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
      <div className="flex justify-end">
        <Link href="/admin/guides/new">
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            دليل جديد
          </Button>
        </Link>
      </div>

      {guides.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">لا توجد أدلة بعد. أنشئ أول دليل!</p>
          <Link href="/admin/guides/new">
            <Button className="mt-4">
              <Plus className="h-4 w-4 ml-2" />
              إنشاء دليل
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-right p-4">العنوان</th>
                <th className="text-right p-4">التصنيف</th>
                <th className="text-right p-4">الحالة</th>
                <th className="text-right p-4">المشاهدات</th>
                <th className="text-right p-4">تاريخ الإنشاء</th>
                <th className="text-left p-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide) => (
                <tr key={guide.id} className="border-t hover:bg-muted/50">
                  <td className="p-4">
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {guide.title}
                    </Link>
                  </td>
                  <td className="p-4 text-right">
                    {guide.category ? (
                      <span className="text-sm text-muted-foreground">
                        {guide.category.name}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        بدون تصنيف
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {guide.published ? (
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
                    <span className="text-sm text-muted-foreground">
                      {guide.viewCount}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm text-muted-foreground">
                      {new Date(guide.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-start gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(guide.id)}
                        disabled={toggling === guide.id}
                      >
                        {guide.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Link href={`/admin/guides/edit?id=${guide.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(guide.id, guide.title)}
                        disabled={deleting === guide.id}
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

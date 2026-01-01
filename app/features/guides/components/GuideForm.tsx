"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GuideEditor } from "./GuideEditor";
import { FeaturedImageUpload } from "./FeaturedImageUpload";
import { CategorySelector } from "./CategorySelector";
import { GuideSidebar } from "./GuideSidebar";
import { createGuide, updateGuide } from "../services/guide-actions";
import type { GuideCategory } from "@/lib/generated/prisma/client";
import type { GuideData } from "../types";

interface GuideFormProps {
  guide?: GuideData;
  categories: GuideCategory[];
}

export function GuideForm({ guide, categories }: GuideFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(guide?.title || "");
  const [content, setContent] = useState(guide?.content || "");
  const [description, setDescription] = useState(guide?.description || "");
  const [featuredImage, setFeaturedImage] = useState<string | null>(
    guide?.featuredImage || null
  );
  const [categoryId, setCategoryId] = useState(guide?.categoryId || "");
  const [tags, setTags] = useState(
    guide?.tags?.map((t) => t.tag).join(", ") || ""
  );
  const [published, setPublished] = useState(guide?.published || false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("العنوان مطلوب");
      return;
    }

    if (!content.trim()) {
      setError("المحتوى مطلوب");
      return;
    }

    setSubmitting(true);

    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const data = {
        title: title.trim(),
        content,
        description: description.trim() || undefined,
        featuredImage: featuredImage || undefined,
        categoryId: categoryId || undefined,
        tags: tagArray.length > 0 ? tagArray : undefined,
        published,
      };

      const result = guide
        ? await updateGuide(guide.id, data)
        : await createGuide(data);

      if (!result.success) {
        setError(result.error?.message || "فشلت العملية");
        return;
      }

      // Redirect to guides list
      router.push("/admin/guides");
      router.refresh();
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.message || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">العنوان *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان الدليل"
          required
          dir="rtl"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">التصنيف</Label>
        <CategorySelector
          categories={categories}
          selectedCategoryId={categoryId}
          onSelect={setCategoryId}
        />
      </div>

      {/* Featured Image */}
      <div className="space-y-2">
        <Label>صورة الغلاف</Label>
        <FeaturedImageUpload
          currentImage={featuredImage}
          onUpload={setFeaturedImage}
          onRemove={() => setFeaturedImage(null)}
        />
      </div>

      {/* Content Editor */}
      <div className="space-y-2">
        <Label>المحتوى *</Label>
        <GuideEditor
          content={content}
          onChange={setContent}
          placeholder="اكتب محتوى الدليل هنا..."
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">الوصف (اختياري)</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="وصف قصير (سيتم توليده تلقائياً إذا تُرك فارغاً)"
          dir="rtl"
        />
        <p className="text-xs text-muted-foreground">
          الوصف يظهر في بطاقات الدلائل. إذا تُرك فارغاً، سيتم توليده تلقائياً من المحتوى.
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">الوسوم (اختياري)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="أدخل الوسوم مفصولة بفواصل"
          dir="rtl"
        />
        <p className="text-xs text-muted-foreground">
          افصل الوسوم بفواصل (مثال: مبتدئين، نصائح، استراتيجية)
        </p>
      </div>

      {/* Publish Toggle */}
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <Switch
          id="published"
          checked={published}
          onCheckedChange={setPublished}
        />
        <div className="flex-1">
          <Label htmlFor="published" className="cursor-pointer">
            نشر الدليل
          </Label>
          <p className="text-xs text-muted-foreground">
            {published
              ? "الدليل سيكون مرئياً للجميع"
              : "حفظ كمسودة (غير مرئي للآخرين)"}
          </p>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "جاري الحفظ..."
            : guide
            ? "تحديث الدليل"
            : "إنشاء الدليل"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
}

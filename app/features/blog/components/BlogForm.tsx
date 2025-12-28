"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BlogEditor } from "./BlogEditor";
import { FeaturedImageUpload } from "./FeaturedImageUpload";
import { CategorySelector } from "./CategorySelector";
import { createBlog, updateBlog } from "../services/blog-actions";
import type { BlogCategory } from "@/lib/generated/prisma/client";
import type { BlogData } from "../types";

interface BlogFormProps {
  blog?: BlogData;
  categories: BlogCategory[];
}

export function BlogForm({ blog, categories }: BlogFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(blog?.title || "");
  const [content, setContent] = useState(blog?.content || "");
  const [excerpt, setExcerpt] = useState(blog?.excerpt || "");
  const [featuredImage, setFeaturedImage] = useState<string | null>(
    blog?.featuredImage || null
  );
  const [categoryId, setCategoryId] = useState(blog?.categoryId || "");
  const [tags, setTags] = useState(
    blog?.tags?.map((t) => t.tag).join(", ") || ""
  );
  const [published, setPublished] = useState(blog?.published || false);
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
        excerpt: excerpt.trim() || undefined,
        featuredImage: featuredImage || undefined,
        categoryId: categoryId || undefined,
        tags: tagArray.length > 0 ? tagArray : undefined,
        published,
      };

      const result = blog
        ? await updateBlog(blog.id, data)
        : await createBlog(data);

      if (!result.success) {
        setError(result.error?.message || "فشلت العملية");
        return;
      }

      // Redirect to blog page
      if (result.data) {
        router.push(`/blogs/${result.data.slug}`);
      }
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
          placeholder="عنوان المقالة"
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
        <BlogEditor
          content={content}
          onChange={setContent}
          placeholder="اكتب محتوى المقالة هنا..."
        />
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt">الملخص (اختياري)</Label>
        <Input
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="ملخص قصير للمقالة (سيتم توليده تلقائياً إذا تُرك فارغاً)"
          dir="rtl"
        />
        <p className="text-xs text-muted-foreground">
          الملخص يظهر في بطاقات المقالات. إذا تُرك فارغاً، سيتم توليده تلقائياً من
          المحتوى.
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
          افصل الوسوم بفواصل (مثال: أخبار, تحديثات, دليل)
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
            نشر المقالة
          </Label>
          <p className="text-xs text-muted-foreground">
            {published
              ? "المقالة ستكون مرئية للجميع"
              : "حفظ كمسودة (غير مرئية للآخرين)"}
          </p>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "جاري الحفظ..."
            : blog
            ? "تحديث المقالة"
            : "إنشاء المقالة"}
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

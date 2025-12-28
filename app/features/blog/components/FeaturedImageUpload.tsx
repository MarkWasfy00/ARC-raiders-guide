"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface FeaturedImageUploadProps {
  currentImage?: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function FeaturedImageUpload({
  currentImage,
  onUpload,
  onRemove,
}: FeaturedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة');
      return;
    }

    // Validate file size (5MB max for cover image)
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة كبير جداً. الحد الأقصى: 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'cover');

      const response = await fetch('/api/blog/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل رفع الصورة');
      }

      onUpload(data.url);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {currentImage ? (
        <div className="relative w-full">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
            <Image
              src={currentImage}
              alt="صورة الغلاف"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 left-2"
            onClick={onRemove}
          >
            <X className="h-4 w-4 ml-1" />
            حذف
          </Button>
        </div>
      ) : (
        <label className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {uploading ? 'جاري الرفع...' : 'انقر لرفع صورة الغلاف'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WebP (حد أقصى 5MB)
          </p>
        </label>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

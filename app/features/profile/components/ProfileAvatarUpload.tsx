"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileAvatarUploadProps {
  currentImage?: string | null;
  userName?: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function ProfileAvatarUpload({
  currentImage,
  userName,
  onUpload,
  onRemove,
}: ProfileAvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('يرجى اختيار ملف صورة (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة كبير جداً. الحد الأقصى: 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/upload-avatar', {
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

  // Get user initials for fallback
  const userInitial = userName?.[0]?.toUpperCase() || 'U';

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        {currentImage ? (
          <div className="relative group">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={currentImage}
                alt={userName || "صورة الملف الشخصي"}
              />
              <AvatarFallback className="text-4xl">{userInitial}</AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -left-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="relative cursor-pointer group">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <div className="flex flex-col items-center gap-3 p-8 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
              <Avatar className="h-32 w-32">
                <AvatarFallback className="text-4xl bg-muted">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {uploading ? 'جاري الرفع...' : 'انقر لرفع صورة الملف الشخصي'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, GIF, WebP (حد أقصى 5MB)
                </p>
              </div>
            </div>
          </label>
        )}

        {currentImage && !uploading && (
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button type="button" variant="outline" size="sm" asChild>
              <span>
                <ImageIcon className="h-4 w-4 ml-2" />
                تغيير الصورة
              </span>
            </Button>
          </label>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
}

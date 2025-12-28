import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFile, deleteFile, extractFilenameFromUrl } from "@/lib/minio";
import { prisma } from "@/lib/prisma";

// Allowed image MIME types (including GIF for animated avatars)
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Max file size: 5MB
const MAX_SIZE = 5 * 1024 * 1024;

/**
 * Upload profile avatar to MinIO
 * POST /api/profile/upload-avatar
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول لرفع صورة الملف الشخصي" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "لم يتم تحديد ملف" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, GIF, WebP" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      const maxSizeMB = MAX_SIZE / (1024 * 1024);
      return NextResponse.json(
        { error: `حجم الملف كبير جداً. الحد الأقصى: ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Get current user to check for existing image
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Delete old image if exists (don't fail upload if deletion fails)
    if (user?.image) {
      const oldFilename = extractFilenameFromUrl(user.image);
      if (oldFilename) {
        try {
          await deleteFile(oldFilename);
          console.log(`✅ Deleted old profile image: ${oldFilename}`);
        } catch (deleteError) {
          console.error("⚠️  Warning: Failed to delete old image:", deleteError);
          // Continue with upload despite deletion failure
        }
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename with extension
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `profiles/${session.user.id}.${ext}`;

    // Upload to MinIO
    let result;
    try {
      result = await uploadFile(filename, buffer, {
        'Content-Type': file.type,
        'Cache-Control': 'max-age=31536000', // 1 year
      });
    } catch (uploadError: any) {
      console.error("MinIO upload error:", uploadError);
      return NextResponse.json(
        { error: `فشل رفع الملف إلى MinIO: ${uploadError.message || 'خطأ غير معروف'}` },
        { status: 500 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'فشل رفع الصورة' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.fileName,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "فشل رفع الصورة" },
      { status: 500 }
    );
  }
}

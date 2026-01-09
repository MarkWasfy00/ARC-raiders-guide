import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFile } from "@/lib/minio";

// Allowed image MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Max file sizes
const MAX_SIZE_COVER = 5 * 1024 * 1024;  // 5MB for cover images
const MAX_SIZE_CONTENT = 3 * 1024 * 1024;  // 3MB for content images

/**
 * Upload image to MinIO for guides
 * POST /api/guides/upload-image
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to upload images" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Only admins can upload guide images" },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null; // 'cover' or 'content'

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Supported types: JPG, PNG, WebP" },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = type === 'cover' ? MAX_SIZE_COVER : MAX_SIZE_CONTENT;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `File size too large. Maximum: ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const folder = type === 'cover' ? 'guides/covers' : 'guides/content';
    const filename = `${folder}/${session.user.id}_${timestamp}.${ext}`;

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
        { error: `Failed to upload file to MinIO: ${uploadError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to upload file to MinIO' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.fileName,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

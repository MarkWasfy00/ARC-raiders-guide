"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sanitizeHtml } from "../../blog/utils/sanitize";
import { generateSlug } from "../../blog/utils/slugify";
import { generateExcerpt } from "../../blog/utils/excerpt";
import { deleteFile } from "@/lib/minio";
import { createId } from "@paralleldrive/cuid2";
import type { CreateGuideInput, UpdateGuideInput, GuideResponse } from "../types";

/**
 * Create a new guide
 */
export async function createGuide(data: CreateGuideInput): Promise<GuideResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "You must be logged in to create a guide" },
      };
    }

    // Check if user is staff (admin or moderator)
    const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    if (!isStaff) {
      return {
        success: false,
        error: { message: "Only staff members can create guides" },
      };
    }

    // Validate required fields
    if (!data.title || !data.content) {
      return {
        success: false,
        error: { message: "Title and content are required" },
      };
    }

    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(data.content);

    // Auto-generate description if not provided
    const description = data.description || generateExcerpt(sanitizedContent);

    // Generate guide ID first (using cuid2)
    const guideId = createId();

    // Generate slug with guide ID to ensure uniqueness
    const slug = generateSlug(data.title, guideId);

    // Create guide with pre-generated ID
    const guide = await prisma.guide.create({
      data: {
        id: guideId,
        title: data.title,
        slug,
        content: sanitizedContent,
        description,
        featuredImage: data.featuredImage,
        published: data.published || false,
        publishedAt: data.published ? new Date() : null,
        authorId: session.user.id,
        categoryId: data.categoryId,
        tags: data.tags
          ? {
              create: data.tags.map((tag) => ({ tag: tag.trim() })),
            }
          : undefined,
      },
      include: {
        author: {
          select: { id: true, username: true, name: true, image: true },
        },
        category: true,
        tags: true,
      },
    });

    revalidatePath("/guides");
    revalidatePath("/admin/guides");

    return { success: true, data: guide };
  } catch (error) {
    console.error("Error creating guide:", error);
    return {
      success: false,
      error: { message: "Failed to create guide" },
    };
  }
}

/**
 * Update existing guide
 */
export async function updateGuide(
  guideId: string,
  data: UpdateGuideInput
): Promise<GuideResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "You must be logged in" },
      };
    }

    // Check if user is staff (admin or moderator)
    const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    if (!isStaff) {
      return {
        success: false,
        error: { message: "Only staff members can update guides" },
      };
    }

    // Check if guide exists
    const existingGuide = await prisma.guide.findUnique({
      where: { id: guideId },
      select: { slug: true },
    });

    if (!existingGuide) {
      return {
        success: false,
        error: { message: "Guide not found" },
      };
    }

    // Prepare update data
    const updateData: any = {};

    if (data.title) {
      updateData.title = data.title;
      // Generate new slug if title changed (using existing guide ID)
      updateData.slug = generateSlug(data.title, guideId);
    }

    if (data.content) {
      updateData.content = sanitizeHtml(data.content);
      // Update description if content changed and no new description provided
      if (!data.description) {
        updateData.description = generateExcerpt(updateData.content);
      }
    }

    if (data.description) {
      updateData.description = data.description;
    }

    if (data.featuredImage !== undefined) {
      updateData.featuredImage = data.featuredImage;
    }

    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId;
    }

    if (data.published !== undefined) {
      updateData.published = data.published;
      // Set publishedAt on first publish
      if (data.published && !existingGuide) {
        updateData.publishedAt = new Date();
      }
    }

    // Handle tags update
    if (data.tags) {
      // Delete existing tags and create new ones
      await prisma.guideTag.deleteMany({
        where: { guideId },
      });
      updateData.tags = {
        create: data.tags.map((tag) => ({ tag: tag.trim() })),
      };
    }

    // Update guide
    const updatedGuide = await prisma.guide.update({
      where: { id: guideId },
      data: updateData,
      include: {
        author: {
          select: { id: true, username: true, name: true, image: true },
        },
        category: true,
        tags: true,
      },
    });

    revalidatePath("/guides");
    revalidatePath(`/guides/${existingGuide.slug}`);
    revalidatePath(`/guides/${updatedGuide.slug}`);
    revalidatePath("/admin/guides");

    return { success: true, data: updatedGuide };
  } catch (error) {
    console.error("Error updating guide:", error);
    return {
      success: false,
      error: { message: "Failed to update guide" },
    };
  }
}

/**
 * Delete a guide
 */
export async function deleteGuide(guideId: string): Promise<GuideResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "You must be logged in" },
      };
    }

    // Check if user is staff (admin or moderator)
    const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    if (!isStaff) {
      return {
        success: false,
        error: { message: "Only staff members can delete guides" },
      };
    }

    // Check if guide exists
    const existingGuide = await prisma.guide.findUnique({
      where: { id: guideId },
      select: {
        slug: true,
        featuredImage: true,
        content: true,
      },
    });

    if (!existingGuide) {
      return {
        success: false,
        error: { message: "Guide not found" },
      };
    }

    // Extract image URLs from content and featured image
    const imageUrls: string[] = [];

    if (existingGuide.featuredImage) {
      imageUrls.push(existingGuide.featuredImage);
    }

    // Parse HTML content for MinIO image URLs
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = imgRegex.exec(existingGuide.content)) !== null) {
      const url = match[1];
      // Only delete MinIO URLs (containing guides/)
      if (url.includes('guides/')) {
        imageUrls.push(url);
      }
    }

    // Delete guide (will cascade delete tags)
    await prisma.guide.delete({
      where: { id: guideId },
    });

    // Delete associated images from MinIO
    // Extract filename from presigned URLs
    for (const url of imageUrls) {
      try {
        const urlObj = new URL(url);
        // Extract path from URL (remove query params)
        const pathname = urlObj.pathname;
        // Remove leading slash and bucket name
        const filename = pathname.split('/').slice(2).join('/');
        if (filename) {
          await deleteFile(filename);
        }
      } catch (err) {
        console.error("Error deleting image:", err);
        // Continue with other images even if one fails
      }
    }

    revalidatePath("/guides");
    revalidatePath(`/guides/${existingGuide.slug}`);
    revalidatePath("/admin/guides");

    return { success: true };
  } catch (error) {
    console.error("Error deleting guide:", error);
    return {
      success: false,
      error: { message: "Failed to delete guide" },
    };
  }
}

/**
 * Publish/unpublish a guide
 */
export async function togglePublishGuide(guideId: string): Promise<GuideResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "You must be logged in" },
      };
    }

    // Check if user is staff (admin or moderator)
    const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    if (!isStaff) {
      return {
        success: false,
        error: { message: "Only staff members can publish guides" },
      };
    }

    // Check if guide exists
    const existingGuide = await prisma.guide.findUnique({
      where: { id: guideId },
      select: { published: true, publishedAt: true },
    });

    if (!existingGuide) {
      return {
        success: false,
        error: { message: "Guide not found" },
      };
    }

    // Toggle published status
    const updatedGuide = await prisma.guide.update({
      where: { id: guideId },
      data: {
        published: !existingGuide.published,
        publishedAt: !existingGuide.published && !existingGuide.publishedAt
          ? new Date()
          : existingGuide.publishedAt,
      },
      include: {
        author: {
          select: { id: true, username: true, name: true, image: true },
        },
        category: true,
        tags: true,
      },
    });

    revalidatePath("/guides");
    revalidatePath("/admin/guides");

    return { success: true, data: updatedGuide };
  } catch (error) {
    console.error("Error toggling publish status:", error);
    return {
      success: false,
      error: { message: "Failed to change publish status" },
    };
  }
}

/**
 * Increment view count for a guide
 */
export async function incrementViewCount(guideId: string): Promise<void> {
  try {
    await prisma.guide.update({
      where: { id: guideId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    // Don't throw error, view count is not critical
  }
}

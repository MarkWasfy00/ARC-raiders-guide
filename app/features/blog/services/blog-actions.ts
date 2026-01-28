"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sanitizeHtml } from "../utils/sanitize";
import { generateSlug } from "../utils/slugify";
import { generateExcerpt } from "../utils/excerpt";
import { deleteFile } from "@/lib/minio";
import { createId } from "@paralleldrive/cuid2";
import type { CreateBlogInput, UpdateBlogInput, BlogResponse } from "../types";

/**
 * Create a new blog post
 */
export async function createBlog(data: CreateBlogInput): Promise<BlogResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "يجب تسجيل الدخول لإنشاء مقالة" },
      };
    }

    // Validate required fields
    if (!data.title || !data.content) {
      return {
        success: false,
        error: { message: "العنوان والمحتوى مطلوبان" },
      };
    }

    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(data.content);

    // Auto-generate excerpt if not provided
    const excerpt = data.excerpt || generateExcerpt(sanitizedContent);

    // Generate blog ID first (using cuid2)
    const blogId = createId();

    // Generate slug with blog ID to ensure uniqueness
    const slug = generateSlug(data.title, blogId);

    // Create blog with pre-generated ID
    const blog = await prisma.blog.create({
      data: {
        id: blogId,
        title: data.title,
        slug,
        content: sanitizedContent,
        excerpt,
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

    revalidatePath("/blogs");
    revalidatePath("/dashboard/my-blogs");

    return { success: true, data: blog };
  } catch (error) {
    console.error("Error creating blog:", error);
    return {
      success: false,
      error: { message: "فشل إنشاء المقالة" },
    };
  }
}

/**
 * Update existing blog post
 */
export async function updateBlog(
  blogId: string,
  data: UpdateBlogInput
): Promise<BlogResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "يجب تسجيل الدخول" },
      };
    }

    // Check if blog exists and user is the author
    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { authorId: true, slug: true },
    });

    if (!existingBlog) {
      return {
        success: false,
        error: { message: "المقالة غير موجودة" },
      };
    }

    const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    const isOwner = existingBlog.authorId === session.user.id;

    if (!isOwner && !isStaff) {
      return {
        success: false,
        error: { message: "غير مصرح لك بتعديل هذه المقالة" },
      };
    }

    // Prepare update data
    const updateData: any = {};

    if (data.title) {
      updateData.title = data.title;
      // Generate new slug if title changed (using existing blog ID)
      updateData.slug = generateSlug(data.title, blogId);
    }

    if (data.content) {
      updateData.content = sanitizeHtml(data.content);
      // Update excerpt if content changed and no new excerpt provided
      if (!data.excerpt) {
        updateData.excerpt = generateExcerpt(updateData.content);
      }
    }

    if (data.excerpt) {
      updateData.excerpt = data.excerpt;
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
      if (data.published && !existingBlog) {
        updateData.publishedAt = new Date();
      }
    }

    // Handle tags update
    if (data.tags) {
      // Delete existing tags and create new ones
      await prisma.blogTag.deleteMany({
        where: { blogId },
      });
      updateData.tags = {
        create: data.tags.map((tag) => ({ tag: tag.trim() })),
      };
    }

    // Update blog
    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: updateData,
      include: {
        author: {
          select: { id: true, username: true, name: true, image: true },
        },
        category: true,
        tags: true,
      },
    });

    revalidatePath("/blogs");
    revalidatePath(`/blogs/${existingBlog.slug}`);
    revalidatePath(`/blogs/${updatedBlog.slug}`);
    revalidatePath("/dashboard/my-blogs");

    return { success: true, data: updatedBlog };
  } catch (error) {
    console.error("Error updating blog:", error);
    return {
      success: false,
      error: { message: "فشل تحديث المقالة" },
    };
  }
}

/**
 * Delete a blog post
 */
export async function deleteBlog(blogId: string): Promise<BlogResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "يجب تسجيل الدخول" },
      };
    }

    // Check if blog exists and user is the author
    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: {
        authorId: true,
        slug: true,
        featuredImage: true,
        content: true,
      },
    });

    if (!existingBlog) {
      return {
        success: false,
        error: { message: "المقالة غير موجودة" },
      };
    }

    const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    const isOwner = existingBlog.authorId === session.user.id;

    if (!isOwner && !isStaff) {
      return {
        success: false,
        error: { message: "غير مصرح لك بحذف هذه المقالة" },
      };
    }

    // Extract image URLs from content and featured image
    const imageUrls: string[] = [];

    if (existingBlog.featuredImage) {
      imageUrls.push(existingBlog.featuredImage);
    }

    // Parse HTML content for MinIO image URLs
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = imgRegex.exec(existingBlog.content)) !== null) {
      const url = match[1];
      // Only delete MinIO URLs (containing blogs/)
      if (url.includes('blogs/')) {
        imageUrls.push(url);
      }
    }

    // Delete blog (will cascade delete comments and tags)
    await prisma.blog.delete({
      where: { id: blogId },
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

    revalidatePath("/blogs");
    revalidatePath(`/blogs/${existingBlog.slug}`);
    revalidatePath("/dashboard/my-blogs");

    return { success: true };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return {
      success: false,
      error: { message: "فشل حذف المقالة" },
    };
  }
}

/**
 * Publish/unpublish a blog
 */
export async function togglePublishBlog(blogId: string): Promise<BlogResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "يجب تسجيل الدخول" },
      };
    }

    // Check ownership
    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { authorId: true, published: true, publishedAt: true },
    });

    if (!existingBlog) {
      return {
        success: false,
        error: { message: "المقالة غير موجودة" },
      };
    }

    const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    const isOwner = existingBlog.authorId === session.user.id;

    if (!isOwner && !isStaff) {
      return {
        success: false,
        error: { message: "غير مصرح لك بتعديل هذه المقالة" },
      };
    }

    // Toggle published status
    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        published: !existingBlog.published,
        publishedAt: !existingBlog.published && !existingBlog.publishedAt
          ? new Date()
          : existingBlog.publishedAt,
      },
      include: {
        author: {
          select: { id: true, username: true, name: true, image: true },
        },
        category: true,
        tags: true,
      },
    });

    revalidatePath("/blogs");
    revalidatePath("/dashboard/my-blogs");

    return { success: true, data: updatedBlog };
  } catch (error) {
    console.error("Error toggling publish status:", error);
    return {
      success: false,
      error: { message: "فشل تغيير حالة النشر" },
    };
  }
}

/**
 * Increment view count for a blog
 */
export async function incrementViewCount(blogId: string): Promise<void> {
  try {
    await prisma.blog.update({
      where: { id: blogId },
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

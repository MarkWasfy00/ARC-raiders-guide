"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { CommentResponse } from "../types";
import { createNotification } from "@/app/features/notifications/services/notification-actions";

/**
 * Create a new comment on a blog
 */
export async function createComment(
  blogId: string,
  content: string,
  parentId?: string
): Promise<CommentResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "يجب تسجيل الدخول للتعليق" },
      };
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: { message: "المحتوى مطلوب" },
      };
    }

    if (content.length > 2000) {
      return {
        success: false,
        error: { message: "التعليق طويل جداً (الحد الأقصى 2000 حرف)" },
      };
    }

    // Check if blog exists and get author info
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: {
        id: true,
        slug: true,
        title: true,
        authorId: true,
        author: {
          select: {
            username: true,
            name: true,
          }
        }
      },
    });

    if (!blog) {
      return {
        success: false,
        error: { message: "المقالة غير موجودة" },
      };
    }

    // If replying to a comment, verify parent exists and get parent author
    let parentComment = null;
    if (parentId) {
      parentComment = await prisma.blogComment.findUnique({
        where: { id: parentId },
        select: {
          id: true,
          blogId: true,
          userId: true,
          user: {
            select: {
              username: true,
              name: true,
            }
          }
        },
      });

      if (!parentComment || parentComment.blogId !== blogId) {
        return {
          success: false,
          error: { message: "التعليق الأصلي غير موجود" },
        };
      }
    }

    // Create comment
    const comment = await prisma.blogComment.create({
      data: {
        content: content.trim(),
        blogId,
        userId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: { id: true, username: true, name: true, image: true },
        },
      },
    });

    // Create notification for blog author or parent comment author
    const commenterName = session.user.username || session.user.name || "مستخدم";

    if (parentId && parentComment) {
      // Notify the parent comment author (if not commenting on own comment)
      if (parentComment.userId !== session.user.id) {
        await createNotification({
          userId: parentComment.userId,
          type: "BLOG_COMMENT_REPLY",
          title: "رد جديد على تعليقك",
          message: `رد ${commenterName} على تعليقك في "${blog.title}"`,
          link: `/blogs/${blog.slug}#comment-${comment.id}`,
          metadata: {
            blogId: blog.id,
            blogSlug: blog.slug,
            blogTitle: blog.title,
            commentId: comment.id,
            parentCommentId: parentId,
            commenterId: session.user.id,
            commenterName,
          },
        });
      }
    } else {
      // Notify the blog author (if not commenting on own blog)
      if (blog.authorId !== session.user.id) {
        await createNotification({
          userId: blog.authorId,
          type: "BLOG_COMMENT",
          title: "تعليق جديد على مقالتك",
          message: `علق ${commenterName} على "${blog.title}"`,
          link: `/blogs/${blog.slug}#comment-${comment.id}`,
          metadata: {
            blogId: blog.id,
            blogSlug: blog.slug,
            blogTitle: blog.title,
            commentId: comment.id,
            commenterId: session.user.id,
            commenterName,
          },
        });
      }
    }

    revalidatePath(`/blogs/${blog.slug}`);

    return { success: true, data: comment };
  } catch (error) {
    console.error("Error creating comment:", error);
    return {
      success: false,
      error: { message: "فشل إضافة التعليق" },
    };
  }
}

/**
 * Update an existing comment
 */
export async function updateComment(
  commentId: string,
  content: string
): Promise<CommentResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "يجب تسجيل الدخول" },
      };
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: { message: "المحتوى مطلوب" },
      };
    }

    if (content.length > 2000) {
      return {
        success: false,
        error: { message: "التعليق طويل جداً" },
      };
    }

    // Check if comment exists and user is the author
    const existingComment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      select: { userId: true, blog: { select: { slug: true } } },
    });

    if (!existingComment) {
      return {
        success: false,
        error: { message: "التعليق غير موجود" },
      };
    }

    const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    const isOwner = existingComment.userId === session.user.id;

    if (!isOwner && !isStaff) {
      return {
        success: false,
        error: { message: "غير مصرح لك بتعديل هذا التعليق" },
      };
    }

    // Update comment
    const updatedComment = await prisma.blogComment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
      },
      include: {
        user: {
          select: { id: true, username: true, name: true, image: true },
        },
      },
    });

    revalidatePath(`/blogs/${existingComment.blog.slug}`);

    return { success: true, data: updatedComment };
  } catch (error) {
    console.error("Error updating comment:", error);
    return {
      success: false,
      error: { message: "فشل تحديث التعليق" },
    };
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<CommentResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "يجب تسجيل الدخول" },
      };
    }

    // Check if comment exists and user is the author
    const existingComment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      select: { userId: true, blog: { select: { slug: true } } },
    });

    if (!existingComment) {
      return {
        success: false,
        error: { message: "التعليق غير موجود" },
      };
    }

    const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    const isOwner = existingComment.userId === session.user.id;

    if (!isOwner && !isStaff) {
      return {
        success: false,
        error: { message: "غير مصرح لك بحذف هذا التعليق" },
      };
    }

    // Delete comment (will cascade delete replies)
    await prisma.blogComment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/blogs/${existingComment.blog.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error: { message: "فشل حذف التعليق" },
    };
  }
}

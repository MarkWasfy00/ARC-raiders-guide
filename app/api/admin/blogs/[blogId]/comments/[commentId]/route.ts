import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string; commentId: string }> }
) {
  try {
    const session = await auth();

    const isStaff = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
    if (!session?.user?.role || !isStaff) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { blogId, commentId } = await params;

    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      include: { blog: { select: { slug: true } } },
    });

    if (!comment || comment.blogId !== blogId) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    await prisma.blogComment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/blogs/${comment.blog.slug}`);
    revalidatePath('/admin/blogs');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteFile } from '@/lib/minio';
import { revalidatePath } from 'next/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
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

    const { blogId } = await params;

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        author: {
          select: { id: true, username: true, name: true, image: true },
        },
        category: true,
        tags: true,
        comments: {
          include: {
            user: {
              select: { id: true, username: true, name: true, image: true },
            },
            replies: {
              include: {
                user: {
                  select: { id: true, username: true, name: true, image: true },
                },
              },
              orderBy: { created_at: 'asc' },
            },
          },
          where: { parentId: null },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
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

    const { blogId } = await params;
    const data = await req.json();

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { slug: true, publishedAt: true },
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.published !== undefined && {
          published: data.published,
          publishedAt: data.published && !blog.publishedAt ? new Date() : blog.publishedAt,
        }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.featuredImage !== undefined && { featuredImage: data.featuredImage }),
      },
      include: {
        author: {
          select: { id: true, username: true, name: true, image: true },
        },
        category: true,
        tags: true,
      },
    });

    revalidatePath('/blogs');
    revalidatePath(`/blogs/${blog.slug}`);
    revalidatePath(`/blogs/${updatedBlog.slug}`);
    revalidatePath('/admin/blogs');

    return NextResponse.json({ success: true, blog: updatedBlog });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
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

    const { blogId } = await params;

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: {
        slug: true,
        featuredImage: true,
        content: true,
      },
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    const imageUrls: string[] = [];
    if (blog.featuredImage) {
      imageUrls.push(blog.featuredImage);
    }

    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = imgRegex.exec(blog.content)) !== null) {
      const url = match[1];
      if (url.includes('blogs/')) {
        imageUrls.push(url);
      }
    }

    await prisma.blog.delete({
      where: { id: blogId },
    });

    for (const url of imageUrls) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split('/').slice(2).join('/');
        if (filename) {
          await deleteFile(filename);
        }
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    revalidatePath('/blogs');
    revalidatePath('/admin/blogs');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}

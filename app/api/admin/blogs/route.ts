import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    const isStaff = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
    if (!session?.user?.role || !isStaff) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const published = searchParams.get('published');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (published !== null && published !== '') {
      where.published = published === 'true';
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, username: true, name: true, image: true },
          },
          category: true,
          tags: true,
          _count: { select: { comments: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

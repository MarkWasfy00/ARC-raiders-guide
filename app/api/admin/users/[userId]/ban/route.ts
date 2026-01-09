import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const { reason } = await req.json();

    // Prevent banning yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot ban yourself' },
        { status: 400 }
      );
    }

    // Ban the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: true,
        bannedAt: new Date(),
        banReason: reason || 'No reason provided',
        // Increment session version to invalidate all existing sessions
        sessionVersion: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to ban user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // Unban the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: false,
        bannedAt: null,
        banReason: null,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unban user' },
      { status: 500 }
    );
  }
}

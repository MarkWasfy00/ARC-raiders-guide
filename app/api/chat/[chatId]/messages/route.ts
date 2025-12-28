import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/app/features/notifications/services/notification-actions";

// GET - Fetch messages for a chat
export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;

    // Verify user is part of this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [
          { participant1Id: session.user.id },
          { participant2Id: session.user.id },
        ],
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or unauthorized" },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Send a message (HTTP fallback if Socket.IO is unavailable)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const { content } = await req.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Verify user is part of this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [
          { participant1Id: session.user.id },
          { participant2Id: session.user.id },
        ],
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or unauthorized" },
        { status: 404 }
      );
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: session.user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update chat's updated_at timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updated_at: new Date() },
    });

    // Emit Socket.IO event to notify chat participants
    if (global.io) {
      global.io.to(chatId).emit("new-message", message);
    }

    // Create notification for the recipient (the other participant)
    const recipientId =
      chat.participant1Id === session.user.id
        ? chat.participant2Id
        : chat.participant1Id;

    const senderName =
      message.sender.username ||
      message.sender.name ||
      "مستخدم";

    // Truncate message content for notification preview (max 50 chars)
    const messagePreview =
      content.length > 50 ? content.substring(0, 50) + "..." : content;

    await createNotification({
      userId: recipientId,
      type: "CHAT_MESSAGE",
      title: `رسالة جديدة من ${senderName}`,
      message: messagePreview,
      link: `/chat?chatId=${chatId}`,
      metadata: {
        chatId,
        senderId: session.user.id,
        messageId: message.id,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

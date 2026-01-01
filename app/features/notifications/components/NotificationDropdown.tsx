"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, MessageSquare, Reply } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/generated/prisma/client";

export function NotificationDropdown() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Format time ago helper
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return "الآن";
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
    return new Date(date).toLocaleDateString("en-GB");
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "BLOG_COMMENT":
        return <MessageSquare className="w-4 h-4" />;
      case "BLOG_COMMENT_REPLY":
        return <Reply className="w-4 h-4" />;
      case "CHAT_MESSAGE":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    setIsLoading(true);
    const [notifResult, countResult] = await Promise.all([
      getUserNotifications(),
      getUnreadNotificationCount(),
    ]);

    if (notifResult.success && notifResult.data) {
      setNotifications(notifResult.data as Notification[]);
    }

    if (countResult.success && typeof countResult.data === "number") {
      setUnreadCount(countResult.data);
    }

    setIsLoading(false);
  };

  // Mark as read handler
  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Socket.IO real-time updates
  useEffect(() => {
    if (!session?.user?.id) return;

    loadNotifications();

    const socket = getSocket();

    // Join user's notification room
    socket.emit("join-notifications", session.user.id);

    // Listen for new notifications
    socket.on("new-notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.emit("leave-notifications", session.user.id);
      socket.off("new-notification");
    };
  }, [session?.user?.id]);

  // Reload notifications when dropdown opens
  useEffect(() => {
    if (isOpen && session?.user?.id) {
      loadNotifications();
    }
  }, [isOpen, session?.user?.id]);

  if (!session?.user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="relative flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors outline-none">
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <span className="hidden lg:inline">الإشعارات</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            الإشعارات
          </span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:underline"
            >
              تعليم الكل كمقروء
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              لا توجد إشعارات
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  asChild
                  className="cursor-pointer"
                >
                  <Link
                    href={notification.link || "#"}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded transition-colors",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "mt-1 p-2 rounded-full",
                      !notification.read ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm mb-1",
                        !notification.read && "font-semibold"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

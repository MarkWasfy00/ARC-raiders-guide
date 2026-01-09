"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface User {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  created_at: string;
}

interface Listing {
  id: string;
  type: string;
  item: {
    id: string;
    name: string;
    icon: string | null;
    rarity: string | null;
  } | null;
  user: User;
}

interface Chat {
  id: string;
  listing: Listing;
  participant1: User;
  participant2: User;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  messages: Message[];
  updated_at: string;
}

interface ChatListProps {
  currentUserId: string;
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
  refreshKey?: number;
}

export function ChatList({ currentUserId, selectedChatId, onChatSelect, refreshKey }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, [refreshKey]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/chat");
      if (!res.ok) throw new Error("Failed to load chats");
      const data = await res.json();
      // Filter out completed and cancelled chats
      const activeChats = data.filter((chat: Chat) => chat.status === "ACTIVE");
      setChats(activeChats);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (chat: Chat): User => {
    return chat.participant1.id === currentUserId
      ? chat.participant2
      : chat.participant1;
  };

  const getLastMessage = (chat: Chat): Message | null => {
    return chat.messages.length > 0 ? chat.messages[0] : null;
  };

  const getRarityColor = (rarity: string | null) => {
    switch (rarity?.toUpperCase()) {
      case "LEGENDARY":
        return "text-orange-400";
      case "EPIC":
        return "text-purple-400";
      case "RARE":
        return "text-blue-400";
      case "UNCOMMON":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">لا توجد محادثات</h3>
        <p className="text-sm text-muted-foreground">
          ابدأ محادثة من خلال النقر على زر الشراء أو البيع في السوق
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-border/50">
        <h2 className="text-xl font-bold">المحادثات</h2>
        <p className="text-sm text-muted-foreground">
          {chats.length} محادثة
        </p>
      </div>

      <div className="divide-y divide-border/50">
        {chats.map((chat) => {
          const otherUser = getOtherUser(chat);
          const lastMessage = getLastMessage(chat);
          const isSelected = selectedChatId === chat.id;

          return (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                isSelected ? "bg-muted/70" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Item Icon */}
                <div className="w-10 h-10 shrink-0 bg-muted/30 rounded border border-border/50 flex items-center justify-center">
                  {chat.listing.item?.icon ? (
                    <img
                      src={chat.listing.item.icon}
                      alt={chat.listing.item.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <Sparkles className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Item Name */}
                  <h3 className={`font-semibold text-sm truncate ${getRarityColor(chat.listing.item?.rarity ?? null)}`}>
                    {chat.listing.item?.name || "عنصر محذوف"}
                  </h3>

                  {/* Other User */}
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={otherUser.image || undefined} />
                      <AvatarFallback className="bg-gradient-orange text-white text-xs">
                        {otherUser.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground truncate">
                      {otherUser.username || otherUser.name || "مستخدم"}
                    </span>
                  </div>

                  {/* Last Message */}
                  {lastMessage && (
                    <p className="text-xs text-muted-foreground/80 truncate mt-1">
                      {lastMessage.senderId === currentUserId ? "أنت: " : ""}
                      {lastMessage.content}
                    </p>
                  )}

                  {/* Time */}
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {formatDistanceToNow(new Date(chat.updated_at), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </p>
                </div>

                {/* Listing Type Badge */}
                <Badge
                  variant="outline"
                  className="text-xs shrink-0"
                >
                  {chat.listing.type === "WTS" ? "بيع" : "شراء"}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

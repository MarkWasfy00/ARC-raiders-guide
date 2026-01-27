"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sparkles,
  MessageSquare,
  ChevronDown,
  Users,
  Star,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { getSocket } from "@/lib/socket";

interface User {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  embark_id?: string | null;
  discord_username?: string | null;
  averageRating?: number;
  totalRatings?: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  created_at: string;
}

interface Item {
  id: string;
  name: string;
  icon: string | null;
  rarity: string | null;
}

interface Listing {
  id: string;
  type: string;
  status: string;
  quantity: number;
  paymentType: string;
  seedsAmount: number | null;
  item: Item | null;
}

interface Chat {
  id: string;
  listingId: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "OWNER_TRADING";
  participant1LockedIn: boolean;
  participant2LockedIn: boolean;
  participant1Approved: boolean;
  participant2Approved: boolean;
  created_at: string;
  updated_at: string;
  otherUser: User;
  messages: Message[];
}

interface ListingGroup {
  listing: Listing;
  interestedCount: number;
  activeChats: Chat[];
  hasActiveTrader: boolean;
  activeTraderChatId: string | null;
  activeTraderUserId: string | null;
}

interface IncomingChat extends Chat {
  listing: Listing & {
    user: User;
    activeTraderChatId: string | null;
  };
  isActiveTrader: boolean;
}

interface ChatListGroupedProps {
  currentUserId: string;
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
  refreshKey?: number;
}

export function ChatListGrouped({
  currentUserId,
  selectedChatId,
  onChatSelect,
  refreshKey,
}: ChatListGroupedProps) {
  const [ownedListings, setOwnedListings] = useState<ListingGroup[]>([]);
  const [incomingChats, setIncomingChats] = useState<IncomingChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedListings, setExpandedListings] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadGroupedChats();
  }, [refreshKey]);

  // Socket.IO for real-time updates
  useEffect(() => {
    if (!currentUserId) return;

    const socket = getSocket();

    // Join the user's notification room to receive new chat notifications
    socket.emit("join-user", currentUserId);

    const handleChatUpdate = (data: { id: string; status?: string; isSelectedTrader?: boolean }) => {
      // Refresh the grouped chats when any chat is updated
      loadGroupedChats();
    };

    const handleTraderSelected = (data: { listingId: string; selectedChatId: string }) => {
      loadGroupedChats();
    };

    const handleQueueReactivated = (data: { listingId: string }) => {
      loadGroupedChats();
    };

    const handleNewChat = (data: { chatId: string; listingId: string; fromUserId: string }) => {
      // Refresh the chat list when a new chat is created
      loadGroupedChats();
    };

    socket.on("chat-updated", handleChatUpdate);
    socket.on("trader-selected", handleTraderSelected);
    socket.on("queue-reactivated", handleQueueReactivated);
    socket.on("new-chat", handleNewChat);

    return () => {
      socket.emit("leave-user", currentUserId);
      socket.off("chat-updated", handleChatUpdate);
      socket.off("trader-selected", handleTraderSelected);
      socket.off("queue-reactivated", handleQueueReactivated);
      socket.off("new-chat", handleNewChat);
    };
  }, [currentUserId]);

  const loadGroupedChats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/chat/grouped");
      if (!res.ok) throw new Error("Failed to load grouped chats");
      const data = await res.json();
      setOwnedListings(data.ownedListings || []);
      setIncomingChats(data.incomingChats || []);
    } catch (error) {
      console.error("Error loading grouped chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleListing = (listingId: string) => {
    setExpandedListings((prev) => {
      const next = new Set(prev);
      if (next.has(listingId)) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });
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

  const hasNoChats = ownedListings.length === 0 && incomingChats.length === 0;

  if (hasNoChats) {
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
          عرض مجمع حسب الطلبات
        </p>
      </div>

      {/* Owned Listings (User is the listing owner) */}
      {ownedListings.length > 0 && (
        <div className="border-b border-border/30">
          <div className="px-4 py-2 bg-muted/20">
            <h3 className="text-sm font-semibold text-muted-foreground">طلباتي</h3>
          </div>
          {ownedListings.map((group) => (
            <Collapsible
              key={group.listing.id}
              open={expandedListings.has(group.listing.id)}
              onOpenChange={() => toggleListing(group.listing.id)}
            >
              <CollapsibleTrigger asChild>
                <button className="w-full p-4 text-right hover:bg-muted/30 transition-colors border-b border-border/20">
                  <div className="flex items-center gap-3">
                    {/* Item Icon */}
                    <div className="w-12 h-12 shrink-0 bg-muted/30 rounded border border-border/50 flex items-center justify-center">
                      {group.listing.item?.icon ? (
                        <img
                          src={group.listing.item.icon}
                          alt={group.listing.item.name}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <Sparkles className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-semibold text-sm truncate ${getRarityColor(
                          group.listing.item?.rarity ?? null
                        )}`}
                      >
                        {group.listing.item?.name || "عنصر محذوف"} x{group.listing.quantity}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {group.listing.type === "WTS" ? "للبيع" : "مطلوب"}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{group.interestedCount} مهتمين</span>
                        </div>
                        {group.hasActiveTrader && (
                          <Badge className="bg-green-600/20 text-green-400 text-xs">
                            تداول نشط
                          </Badge>
                        )}
                      </div>
                    </div>

                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        expandedListings.has(group.listing.id) ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="bg-muted/10">
                  {group.activeChats.map((chat) => {
                    const isSelected = selectedChatId === chat.id;
                    const isActiveTrader = group.activeTraderChatId === chat.id;
                    const lastMessage = chat.messages[0];

                    return (
                      <button
                        key={chat.id}
                        onClick={() => onChatSelect(chat.id)}
                        className={`w-full p-3 pr-8 text-right hover:bg-muted/50 transition-colors border-b border-border/10 ${
                          isSelected ? "bg-muted/70" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={chat.otherUser.image || undefined} />
                            <AvatarFallback className="bg-gradient-orange text-white text-xs">
                              {chat.otherUser.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">
                                {chat.otherUser.username || chat.otherUser.name || "مستخدم"}
                              </span>
                              {chat.otherUser.totalRatings && chat.otherUser.totalRatings > 0 && (
                                <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                  <span>{chat.otherUser.averageRating?.toFixed(1)}</span>
                                </div>
                              )}
                              {isActiveTrader && (
                                <Badge className="bg-green-600/20 text-green-400 text-xs px-1.5 py-0">
                                  <Check className="h-3 w-3 mr-0.5" />
                                  مختار
                                </Badge>
                              )}
                              {chat.status === "OWNER_TRADING" && (
                                <Badge className="bg-amber-600/20 text-amber-400 text-xs px-1.5 py-0">
                                  في الانتظار
                                </Badge>
                              )}
                            </div>

                            {lastMessage && (
                              <p className="text-xs text-muted-foreground/80 truncate mt-0.5">
                                {lastMessage.content}
                              </p>
                            )}

                            <p className="text-xs text-muted-foreground/60 mt-0.5">
                              {formatDistanceToNow(new Date(chat.updated_at), {
                                addSuffix: true,
                                locale: ar,
                              })}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Incoming Chats (User is NOT the listing owner) */}
      {incomingChats.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-muted/20">
            <h3 className="text-sm font-semibold text-muted-foreground">طلبات الآخرين</h3>
          </div>
          <div className="divide-y divide-border/30">
            {incomingChats.map((chat) => {
              const isSelected = selectedChatId === chat.id;
              const lastMessage = chat.messages[0];
              const isQueuedBehind =
                chat.listing.activeTraderChatId &&
                chat.listing.activeTraderChatId !== chat.id;

              return (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className={`w-full p-4 text-right hover:bg-muted/50 transition-colors ${
                    isSelected ? "bg-muted/70" : ""
                  } ${chat.status === "OWNER_TRADING" ? "opacity-70" : ""}`}
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
                      <h4
                        className={`font-semibold text-sm truncate ${getRarityColor(
                          chat.listing.item?.rarity ?? null
                        )}`}
                      >
                        {chat.listing.item?.name || "عنصر محذوف"}
                      </h4>

                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={chat.otherUser.image || undefined} />
                          <AvatarFallback className="bg-gradient-orange text-white text-xs">
                            {chat.otherUser.username?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">
                          {chat.otherUser.username || chat.otherUser.name || "مستخدم"}
                        </span>
                      </div>

                      {lastMessage && (
                        <p className="text-xs text-muted-foreground/80 truncate mt-1">
                          {lastMessage.content}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(chat.updated_at), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-xs">
                        {chat.listing.type === "WTS" ? "شراء" : "بيع"}
                      </Badge>
                      {chat.status === "OWNER_TRADING" && (
                        <Badge className="bg-amber-600/20 text-amber-400 text-xs">
                          في الانتظار
                        </Badge>
                      )}
                      {chat.isActiveTrader && (
                        <Badge className="bg-green-600/20 text-green-400 text-xs">
                          مختار
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

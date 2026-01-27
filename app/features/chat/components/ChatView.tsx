"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Send, Gamepad2, MessageSquare, Sparkles, ArrowLeft, CheckCircle2, XCircle, AlertCircle, UserCheck } from "lucide-react";
import { OwnerTradingBanner } from "./OwnerTradingBanner";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { getSocket } from "@/lib/socket";
import { RatingDialog } from "./RatingDialog";
import { DiscordShareDialog } from "./DiscordShareDialog";
import { DiscordIcon } from "@/components/icons/DiscordIcon";

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
  sender: User;
  created_at: string;
  read: boolean;
}

interface Listing {
  id: string;
  type: string;
  paymentType: string;
  seedsAmount: number | null;
  quantity: number;
  activeTraderChatId?: string | null;
  activeTraderUserId?: string | null;
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
  participant1LockedIn: boolean;
  participant2LockedIn: boolean;
  participant1Approved: boolean;
  participant2Approved: boolean;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "OWNER_TRADING";
  messages: Message[];
}

interface ChatViewProps {
  chatId: string;
  currentUserId: string;
  onBack?: () => void;
  onChatListUpdate?: () => void;
}

export function ChatView({ chatId, currentUserId, onBack, onChatListUpdate }: ChatViewProps) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [lockingIn, setLockingIn] = useState(false);
  const [approving, setApproving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [tradeId, setTradeId] = useState<string | null>(null);
  const [hasRated, setHasRated] = useState(false);
  const [showDiscordDialog, setShowDiscordDialog] = useState(false);
  const [selectingTrader, setSelectingTrader] = useState(false);

  // Check if current user is the listing owner
  const isListingOwner = chat?.listing?.user?.id === currentUserId;

  // Check if this chat is the active trader for the listing
  const isActiveTrader = chat?.listing &&
    'activeTraderChatId' in chat.listing &&
    (chat.listing as { activeTraderChatId?: string }).activeTraderChatId === chat?.id;

  const otherUser = chat
    ? chat.participant1.id === currentUserId
      ? chat.participant2
      : chat.participant1
    : null;

  useEffect(() => {
    if (chatId) {
      // Clear previous chat data immediately for faster perceived performance
      setChat(null);
      setMessages([]);
      setLoading(true);
      loadMessages();
    }
  }, [chatId]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!chatId) return;

    const socket = getSocket();

    // Join the chat room
    socket.emit("join-chat", chatId);

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    };

    // Listen for chat status updates (approvals, completion, cancellation, lock-in)
    const handleChatUpdate = (updatedChat: Partial<Chat> & { tradeId?: string }) => {
      // Check if trade was just completed (status changed to COMPLETED with tradeId)
      // Show rating dialog for both participants
      if (updatedChat.status === "COMPLETED" && updatedChat.tradeId) {
        // Use functional updates to check current state and prevent duplicates
        setTradeId((prevTradeId) => prevTradeId || updatedChat.tradeId!);
        setShowRatingDialog((prev) => {
          // Only show if not already showing
          if (!prev) return true;
          return prev;
        });
      }

      setChat((prev) => {
        if (!prev) return prev;

        // Merge the update, ensuring we properly update participant data and listing
        return {
          ...prev,
          ...updatedChat,
          // Preserve participant data with updates if provided
          participant1: updatedChat.participant1 ? { ...prev.participant1, ...updatedChat.participant1 } : prev.participant1,
          participant2: updatedChat.participant2 ? { ...prev.participant2, ...updatedChat.participant2 } : prev.participant2,
          // Preserve listing data with updates if provided
          listing: updatedChat.listing
            ? {
                ...prev.listing,
                ...updatedChat.listing,
                // Preserve nested user and item data
                user: updatedChat.listing.user ? { ...prev.listing.user, ...updatedChat.listing.user } : prev.listing.user,
                item: updatedChat.listing.item ? { ...prev.listing.item, ...updatedChat.listing.item } : prev.listing.item,
              }
            : prev.listing,
        };
      });
    };

    socket.on("new-message", handleNewMessage);
    socket.on("chat-updated", handleChatUpdate);

    // Cleanup on unmount or chat change
    return () => {
      socket.emit("leave-chat", chatId);
      socket.off("new-message", handleNewMessage);
      socket.off("chat-updated", handleChatUpdate);
    };
  }, [chatId]);


  const loadMessages = async () => {
    try {
      setLoading(true);

      // Load messages and chat details in parallel for faster performance
      const [messagesRes, chatRes] = await Promise.all([
        fetch(`/api/chat/${chatId}/messages`),
        fetch(`/api/chat/${chatId}`)
      ]);

      if (!messagesRes.ok || !chatRes.ok) {
        throw new Error("Failed to load chat data");
      }

      const [messagesData, chatData] = await Promise.all([
        messagesRes.json(),
        chatRes.json()
      ]);

      setMessages(messagesData.messages || []);
      setChat(chatData);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chat) return;

    const content = newMessage.trim();
    setNewMessage("");

    // Send message via HTTP POST
    // The API route will save to DB and broadcast via Socket.IO
    try {
      const res = await fetch(`/api/chat/${chat.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        console.error("Failed to send message:", await res.text());
        // Restore the message if sending failed
        setNewMessage(content);
      }
      // No need to manually add to state - socket event will handle it
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore the message if sending failed
      setNewMessage(content);
    }
  };

  const handleLockIn = async () => {
    if (!chat) return;

    setLockingIn(true);
    try {
      const res = await fetch(`/api/chat/${chat.id}/lock-in`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setChat((prev) =>
          prev
            ? {
                ...prev,
                participant1LockedIn: data.chat.participant1LockedIn,
                participant2LockedIn: data.chat.participant2LockedIn,
                participant1: {
                  ...prev.participant1,
                  embark_id: data.chat.participant1.embark_id,
                  discord_username: data.chat.participant1.discord_username,
                },
                participant2: {
                  ...prev.participant2,
                  embark_id: data.chat.participant2.embark_id,
                  discord_username: data.chat.participant2.discord_username,
                },
              }
            : null
        );
      } else {
        const error = await res.json();
        alert(error.error || "فشل في تأكيد الدخول");
      }
    } catch (error) {
      console.error("Error locking in:", error);
      alert("فشل في تأكيد الدخول");
    } finally {
      setLockingIn(false);
    }
  };

  const handleApprove = async () => {
    if (!chat) return;

    setApproving(true);
    try {
      const res = await fetch(`/api/chat/${chat.id}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setChat((prev) =>
          prev
            ? {
                ...prev,
                participant1Approved: data.participant1Approved,
                participant2Approved: data.participant2Approved,
                status: data.status,
              }
            : null
        );

        // If trade completed and tradeId returned, show rating dialog
        if (data.status === "COMPLETED" && data.tradeId && !hasRated) {
          setTradeId(data.tradeId);
          setShowRatingDialog(true);
        }
      } else {
        const error = await res.json();
        alert(error.error || "فشل في تأكيد الصفقة");
      }
    } catch (error) {
      console.error("Error approving trade:", error);
      alert("فشل في تأكيد الصفقة");
    } finally {
      setApproving(false);
    }
  };

  const handleLeave = async () => {
    if (!chat) return;

    setLeaving(true);
    try {
      const res = await fetch(`/api/chat/${chat.id}/leave`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setChat((prev) =>
          prev
            ? {
                ...prev,
                status: data.status,
              }
            : null
        );
      } else {
        console.error("Failed to leave chat:", await res.text());
      }
    } catch (error) {
      console.error("Error leaving chat:", error);
    } finally {
      setLeaving(false);
    }
  };

  const handleSelectTrader = async () => {
    if (!chat) return;

    setSelectingTrader(true);
    try {
      const res = await fetch(`/api/chat/${chat.id}/select-trader`, {
        method: "POST",
      });

      if (res.ok) {
        // Refresh chat data to get updated status
        await loadMessages();
      } else {
        const error = await res.json();
        alert(error.error || "فشل في اختيار المتداول");
      }
    } catch (error) {
      console.error("Error selecting trader:", error);
      alert("فشل في اختيار المتداول");
    } finally {
      setSelectingTrader(false);
    }
  };

  const handleSubmitRating = async (ratingData: {
    score: number;
    honest: boolean;
    comment: string;
  }) => {
    if (!tradeId) return;

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeId,
          ...ratingData,
        }),
      });

      if (res.ok) {
        setHasRated(true);
        setShowRatingDialog(false);

        // Trigger chat list refresh to remove completed chat
        if (onChatListUpdate) {
          onChatListUpdate();
        }

        // Navigate back to chat list immediately
        if (onBack) {
          onBack();
        }
      } else {
        const error = await res.json();
        alert(error.error || "فشل إرسال التقييم"); // Failed to submit rating
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("فشل إرسال التقييم"); // Failed to submit rating
    }
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

  if (!chat || !otherUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">اختر محادثة من القائمة</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-card/50">
        <div className="flex items-start gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="md:hidden shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Item Icon */}
          <div className="w-12 h-12 shrink-0 bg-muted/30 rounded border border-border/50 flex items-center justify-center">
            {chat.listing.item?.icon ? (
              <img
                src={chat.listing.item.icon}
                alt={chat.listing.item.name}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <Sparkles className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          {/* Listing Info */}
          <div className="flex-1 min-w-0">
            <h2 className={`text-base font-semibold ${getRarityColor(chat.listing.item?.rarity ?? null)}`}>
              {chat.listing.item?.name || "عنصر محذوف"} x{chat.listing.quantity}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {chat.listing.type === "WTS" ? "للبيع" : "مطلوب"}
              </Badge>
              {chat.listing.paymentType === "SEEDS" && (
                <span className="text-xs text-amber-400">
                  {chat.listing.seedsAmount?.toLocaleString()} بذور
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Other User Info */}
        <div className="flex items-center gap-3 mt-3 p-3 bg-muted/20 rounded-lg">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={otherUser.image || undefined} />
            <AvatarFallback className="bg-gradient-orange text-white">
              {otherUser.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">
              {otherUser.username || otherUser.name || "مستخدم"}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {otherUser.totalRatings && otherUser.totalRatings > 0 ? (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span>{otherUser.averageRating?.toFixed(1)} ({otherUser.totalRatings})</span>
                </div>
              ) : (
                <span>لا تقييمات</span>
              )}
              {/* Only show embark_id if both users have locked in */}
              {chat.participant1LockedIn && chat.participant2LockedIn && otherUser.embark_id && (
                <div className="flex items-center gap-1">
                  <Gamepad2 className="h-3 w-3" />
                  <span>{otherUser.embark_id}</span>
                </div>
              )}
              {chat.participant1LockedIn && chat.participant2LockedIn && otherUser.discord_username && (
                <div className="flex items-center gap-1">
                  <DiscordIcon className="h-3 w-3" />
                  <span>{otherUser.discord_username}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Select for Trade button - only for listing owners */}
            {isListingOwner && chat.status === "ACTIVE" && !chat.listing.activeTraderChatId && (
              <Button
                onClick={handleSelectTrader}
                disabled={selectingTrader}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                title="اختيار للتداول"
              >
                {selectingTrader ? (
                  "جاري الاختيار..."
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 ml-1" />
                    اختيار للتداول
                  </>
                )}
              </Button>
            )}
            {/* Show selected trader badge */}
            {isActiveTrader && (
              <Badge className="bg-green-600/20 text-green-400">
                <CheckCircle2 className="h-3 w-3 ml-1" />
                المتداول المختار
              </Badge>
            )}
            <Button
              onClick={() => setShowDiscordDialog(true)}
              size="sm"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
              title="مشاركة على Discord"
            >
              <DiscordIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Trade Status & Actions */}
      {chat.status === "COMPLETED" && (
        <div className="p-4 bg-green-600/20 border-y border-green-600/30">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-semibold">تم إتمام الصفقة بنجاح!</p>
          </div>
          <p className="text-sm text-green-300/80 mt-1">
            كلا الطرفين أكدا نجاح التبادل
          </p>
        </div>
      )}

      {chat.status === "CANCELLED" && (
        <div className="p-4 bg-red-600/20 border-y border-red-600/30">
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="h-5 w-5" />
            <p className="font-semibold">تم إلغاء المحادثة</p>
          </div>
          <p className="text-sm text-red-300/80 mt-1">
            أحد المستخدمين غادر المحادثة
          </p>
        </div>
      )}

      {chat.status === "OWNER_TRADING" && (
        <OwnerTradingBanner
          itemName={chat.listing.item?.name || "عنصر محذوف"}
          onLeaveQueue={handleLeave}
          isLeaving={leaving}
        />
      )}

      {chat.status === "ACTIVE" && (
        <>
          {/* Lock-In Status Section */}
          {!chat.participant1LockedIn || !chat.participant2LockedIn ? (
            <div className="p-4 bg-blue-600/10 border-y border-blue-600/30">
              <div className="flex items-center gap-3">
                {/* Lock-In Status */}
                <div className="flex-1">
                  <p className="font-semibold text-blue-400 mb-2">تأكيد الدخول للصفقة</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className={`flex items-center gap-2 ${
                      chat.participant1LockedIn ? "text-green-400" : "text-muted-foreground"
                    }`}>
                      {chat.participant1LockedIn ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span className="truncate">
                        {chat.participant1.username || "مستخدم 1"}
                        {chat.participant1.id === currentUserId && " (أنت)"}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 ${
                      chat.participant2LockedIn ? "text-green-400" : "text-muted-foreground"
                    }`}>
                      {chat.participant2LockedIn ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span className="truncate">
                        {chat.participant2.username || "مستخدم 2"}
                        {chat.participant2.id === currentUserId && " (أنت)"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-300/80 mt-2">
                    سيتم إظهار معرفات Embark و Discord بعد تأكيد الطرفين
                  </p>
                </div>

                {/* Lock-In Button */}
                <div className="flex gap-2">
                  {!((chat.participant1.id === currentUserId && chat.participant1LockedIn) ||
                      (chat.participant2.id === currentUserId && chat.participant2LockedIn)) && (
                    <Button
                      onClick={handleLockIn}
                      disabled={lockingIn}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {lockingIn ? (
                        "جاري التأكيد..."
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          تأكيد الدخول
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={handleLeave}
                    disabled={leaving}
                    size="sm"
                    variant="destructive"
                  >
                    {leaving ? (
                      "جاري المغادرة..."
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        إلغاء
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Approval Status Section - Only shown after both locked in */
            <div className="p-4 bg-green-600/10 border-y border-green-600/30">
              <div className="flex items-center gap-3">
                {/* Approval Status */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <p className="font-semibold text-green-400">تم تأكيد الدخول من الطرفين!</p>
                  </div>
                  <div className="bg-green-950/30 border border-green-600/20 rounded-lg p-3 mb-3">
                    <p className="text-sm text-green-200 mb-2 font-semibold">معلومات الاتصال:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-green-100">
                        <Gamepad2 className="h-4 w-4" />
                        <span className="font-medium">Embark ID:</span>
                        <span className="text-green-300">{otherUser.embark_id || "غير متوفر"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-100">
                        <DiscordIcon className="h-4 w-4" />
                        <span className="font-medium">Discord:</span>
                        <span className="text-green-300">{otherUser.discord_username || "غير متوفر"}</span>
                      </div>
                    </div>
                  </div>
                  <p className="font-semibold text-green-400 mb-2">تأكيد إتمام الصفقة</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className={`flex items-center gap-2 ${
                      chat.participant1Approved ? "text-green-400" : "text-muted-foreground"
                    }`}>
                      {chat.participant1Approved ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span className="truncate">
                        {chat.participant1.username || "مستخدم 1"}
                        {chat.participant1.id === currentUserId && " (أنت)"}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 ${
                      chat.participant2Approved ? "text-green-400" : "text-muted-foreground"
                    }`}>
                      {chat.participant2Approved ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span className="truncate">
                        {chat.participant2.username || "مستخدم 2"}
                        {chat.participant2.id === currentUserId && " (أنت)"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-green-300/80 mt-2">
                    بعد إتمام الصفقة، اضغط على "تأكيد الصفقة" لإغلاق المحادثة
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!((chat.participant1.id === currentUserId && chat.participant1Approved) ||
                      (chat.participant2.id === currentUserId && chat.participant2Approved)) && (
                    <Button
                      onClick={handleApprove}
                      disabled={approving}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {approving ? (
                        "جاري التأكيد..."
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          تأكيد الصفقة
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={handleLeave}
                    disabled={leaving}
                    size="sm"
                    variant="destructive"
                  >
                    {leaving ? (
                      "جاري المغادرة..."
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        إلغاء
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            لا توجد رسائل بعد. ابدأ المحادثة!
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={message.sender.image || undefined} />
                  <AvatarFallback className={isOwn ? "bg-gradient-orange text-white" : "bg-muted"}>
                    {message.sender.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-3 py-2 rounded-lg max-w-[70%] ${
                      isOwn
                        ? "bg-orange-600/20 text-orange-100"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border/50 bg-card/50">
        {chat.status === "ACTIVE" ? (
          <>
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="اكتب رسالتك..."
                className="min-h-[60px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-orange-600 hover:bg-orange-700 h-[60px] px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              اضغط Enter للإرسال، Shift+Enter لسطر جديد
            </p>
          </>
        ) : chat.status === "OWNER_TRADING" ? (
          <div className="text-center text-amber-400/80 py-3">
            <p className="text-sm">
              لا يمكنك إرسال رسائل حتى يتم اختيارك للتداول
            </p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-3">
            <p className="text-sm">
              {chat.status === "COMPLETED"
                ? "تم إتمام هذه الصفقة"
                : "تم إلغاء هذه المحادثة"}
            </p>
          </div>
        )}
      </div>

      {/* Rating Dialog */}
      {showRatingDialog && otherUser && tradeId && (
        <RatingDialog
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          tradeId={tradeId}
          otherUser={otherUser}
          onSubmit={handleSubmitRating}
          onSkip={() => {
            setShowRatingDialog(false);

            // Trigger chat list refresh even when skipped
            if (onChatListUpdate) {
              onChatListUpdate();
            }

            // Navigate back to chat list immediately
            if (onBack) {
              onBack();
            }
          }}
        />
      )}

      {/* Discord Share Dialog */}
      {chat && (
        <DiscordShareDialog
          open={showDiscordDialog}
          onOpenChange={setShowDiscordDialog}
          discordUsername={otherUser?.discord_username || null}
          itemName={chat.listing.item?.name || "عنصر محذوف"}
        />
      )}
    </div>
  );
}

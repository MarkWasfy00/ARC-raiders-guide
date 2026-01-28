"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Clock,
  MessageSquare,
  Gamepad2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  X,
} from "lucide-react";
import { Listing } from "./Marketplace";

interface ListingDetailModalProps {
  listing: Listing;
  currentUserId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListingDetailModal({
  listing,
  currentUserId,
  open,
  onOpenChange,
}: ListingDetailModalProps) {
  const isOwnListing = currentUserId === listing.user.id;
  const router = useRouter();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [hasActiveChat, setHasActiveChat] = useState(false);
  const [existingChatId, setExistingChatId] = useState<string | null>(null);
  const [checkingChat, setCheckingChat] = useState(true);

  // Check if account is less than 7 days old
  const accountAge = new Date().getTime() - new Date(listing.user.createdAt).getTime();
  const daysOld = accountAge / (1000 * 60 * 60 * 24);
  const isNewAccount = daysOld < 7;

  // Check if user already has an active chat for this listing when modal opens
  useEffect(() => {
    const checkExistingChat = async () => {
      if (!currentUserId || isOwnListing || !open) {
        setCheckingChat(false);
        return;
      }

      try {
        setCheckingChat(true);
        const res = await fetch(`/api/chat/check/${listing.id}`);
        if (res.ok) {
          const data = await res.json();
          setHasActiveChat(data.hasActiveChat);
          setExistingChatId(data.chatId);
        }
      } catch (error) {
        console.error("Error checking existing chat:", error);
      } finally {
        setCheckingChat(false);
      }
    };

    checkExistingChat();
  }, [listing.id, currentUserId, isOwnListing, open]);

  const handleStartChat = async () => {
    if (!currentUserId || isCreatingChat) return;

    // If chat already exists, navigate to it
    if (hasActiveChat && existingChatId) {
      router.push(`/chat?id=${existingChatId}`);
      onOpenChange(false);
      return;
    }

    try {
      setIsCreatingChat(true);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          otherUserId: listing.user.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to create chat");

      const chat = await res.json();
      router.push(`/chat?id=${chat.id}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const getRarityTextColor = (rarity: string | null) => {
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

  const getRarityBadgeColor = (rarity: string | null) => {
    switch (rarity?.toUpperCase()) {
      case "LEGENDARY":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "EPIC":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "RARE":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "UNCOMMON":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const listingTypeConfig = listing.type === "WTS"
    ? {
        badge: "للبيع",
        icon: TrendingUp,
        bgColor: "bg-green-500/10",
        textColor: "text-green-400",
        borderColor: "border-green-500/30",
        actionText: "شراء الآن",
        actionBg: "bg-green-600 hover:bg-green-700",
      }
    : {
        badge: "مطلوب",
        icon: ShoppingCart,
        bgColor: "bg-blue-500/10",
        textColor: "text-blue-400",
        borderColor: "border-blue-500/30",
        actionText: "بيع الآن",
        actionBg: "bg-blue-600 hover:bg-blue-700",
      };

  const TypeIcon = listingTypeConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">تفاصيل القائمة</DialogTitle>
            <Badge
              variant="outline"
              className={`${listingTypeConfig.bgColor} ${listingTypeConfig.textColor} ${listingTypeConfig.borderColor}`}
            >
              <TypeIcon className="h-3.5 w-3.5 ml-1" />
              {listingTypeConfig.badge}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Details */}
          <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="w-20 h-20 shrink-0 bg-muted/30 rounded border border-border/50 flex items-center justify-center">
              {listing.item.icon ? (
                <img
                  src={listing.item.icon}
                  alt={listing.item.name}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <Sparkles className="w-10 h-10 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <h3 className={`text-2xl font-bold ${getRarityTextColor(listing.item.rarity)}`}>
                {listing.item.name}
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant="outline"
                  className={`text-sm px-2 py-1 ${getRarityBadgeColor(listing.item.rarity)}`}
                >
                  {listing.item.rarity || "COMMON"}
                </Badge>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">الكمية:</span>
                  <span className="text-lg font-semibold">{listing.quantity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">مقابل:</h4>
            <div className="p-4 bg-muted/20 rounded-lg border border-border/30">
              {listing.paymentType === "SEEDS" && (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  <span className="text-2xl font-bold text-amber-400">
                    {listing.seedsAmount?.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">بذور</span>
                </div>
              )}
              {listing.paymentType === "ITEMS" && (
                <div className="space-y-2">
                  {listing.paymentItems.map((paymentItem) => (
                    <div
                      key={paymentItem.id}
                      className="flex items-center gap-3 p-2 bg-card rounded"
                    >
                      {paymentItem.item.icon && (
                        <img
                          src={paymentItem.item.icon}
                          alt={paymentItem.item.name}
                          className="w-10 h-10 object-contain"
                        />
                      )}
                      <div className="flex-1">
                        <p className={`font-semibold ${getRarityTextColor(paymentItem.item.rarity)}`}>
                          {paymentItem.item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          الكمية: {paymentItem.quantity}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getRarityBadgeColor(paymentItem.item.rarity)}
                      >
                        {paymentItem.item.rarity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              {listing.paymentType === "OPEN_OFFERS" && (
                <div className="text-center py-2">
                  <Badge
                    variant="outline"
                    className="text-sm px-3 py-1 bg-blue-500/10 text-blue-400 border-blue-500/30"
                  >
                    متاح للعروض - قدم عرضك
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">الوصف:</h4>
              <p className="text-sm p-4 bg-muted/20 rounded-lg border border-border/30">
                {listing.description}
              </p>
            </div>
          )}

          {/* Seller Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">معلومات البائع:</h4>
            <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg border border-border/30">
              <Avatar className="h-12 w-12">
                <AvatarImage src={listing.user.image || undefined} />
                <AvatarFallback className="bg-gradient-orange text-white">
                  {listing.user.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {listing.user.username || listing.user.name || "مستخدم"}
                  </p>
                  {isNewAccount && (
                    <div className="flex items-center gap-1 text-amber-500">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs">حساب جديد</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {listing.user.totalRatings > 0 ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span>
                        {listing.user.averageRating.toFixed(1)} ({listing.user.totalRatings} تقييم)
                      </span>
                    </div>
                  ) : (
                    <span>لا توجد تقييمات</span>
                  )}
                  {listing.user.embark_id && (
                    <div className="flex items-center gap-1">
                      <Gamepad2 className="h-4 w-4" />
                      <span>{listing.user.embark_id}</span>
                    </div>
                  )}
                  {listing.user.discord_username && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{listing.user.discord_username}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Listing Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              نشر منذ{" "}
              {formatDistanceToNow(new Date(listing.created_at), {
                addSuffix: false,
                locale: ar,
              })}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border/30">
            {!isOwnListing && currentUserId ? (
              <Button
                onClick={handleStartChat}
                disabled={isCreatingChat || checkingChat}
                className={`flex-1 ${hasActiveChat ? 'bg-blue-600 hover:bg-blue-700' : listingTypeConfig.actionBg} text-white font-semibold`}
              >
                {checkingChat ? "..." : isCreatingChat ? "..." : hasActiveChat ? "فتح المحادثة" : listingTypeConfig.actionText}
              </Button>
            ) : !isOwnListing ? (
              <Button disabled className="flex-1 bg-muted text-muted-foreground">
                سجل دخول للمتابعة
              </Button>
            ) : (
              <Badge variant="secondary" className="flex-1 justify-center py-3 text-sm font-semibold">
                قائمتك
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              إغلاق
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

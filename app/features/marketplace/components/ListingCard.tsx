"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Star,
  AlertTriangle,
  Sparkles,
  Eye,
} from "lucide-react";
import { Listing } from "./Marketplace";
import { ListingDetailModal } from "./ListingDetailModal";
import Link from "next/link";

interface ListingCardProps {
  listing: Listing;
  currentUserId?: string;
  userProfile: {
    discord_username: string | null;
    embark_id: string | null;
  } | null;
  onUpdate: () => void;
}

export function ListingCard({ listing, currentUserId, userProfile }: ListingCardProps) {
  const isOwnListing = currentUserId === listing.user.id;
  const router = useRouter();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [hasActiveChat, setHasActiveChat] = useState(false);
  const [existingChatId, setExistingChatId] = useState<string | null>(null);
  const [checkingChat, setCheckingChat] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProfileWarning, setShowProfileWarning] = useState(false);

  // Check if account is less than 7 days old
  const accountAge = new Date().getTime() - new Date(listing.user.createdAt).getTime();
  const daysOld = accountAge / (1000 * 60 * 60 * 24);
  const isNewAccount = daysOld < 7;

  // Check if current user's profile is complete
  const isProfileIncomplete = !!currentUserId && (!userProfile?.discord_username || !userProfile?.embark_id);

  // Check if user already has an active chat for this listing
  useEffect(() => {
    const checkExistingChat = async () => {
      if (!currentUserId || isOwnListing) {
        setCheckingChat(false);
        return;
      }

      try {
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
  }, [listing.id, currentUserId, isOwnListing]);

  const handleStartChat = async () => {
    if (!currentUserId || isCreatingChat) return;

    // Check if profile is complete
    if (isProfileIncomplete) {
      setShowProfileWarning(true);
      return;
    }

    // If chat already exists, navigate to it
    if (hasActiveChat && existingChatId) {
      router.push(`/chat?id=${existingChatId}`);
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

  const listingTypeConfig = listing.type === "WTS"
    ? {
        badge: "للبيع",
        actionText: "شراء الآن",
        actionBg: "bg-green-600 hover:bg-green-700",
      }
    : {
        badge: "مطلوب",
        actionText: "بيع الآن",
        actionBg: "bg-blue-600 hover:bg-blue-700",
      };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/80 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* User Info Header */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={listing.user.image || undefined} />
          <AvatarFallback className="bg-gradient-orange text-white text-xs">
            {listing.user.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
            <span
              className={`rounded px-2 py-0.5 font-semibold tracking-wide ${
                listing.type === "WTS"
                  ? "bg-primary/15 text-primary"
                  : "bg-amber-500/10 text-amber-300"
              }`}
            >
              {listing.type}
            </span>
            <span className="text-muted-foreground">&bull;</span>
            <span>
              {formatDistanceToNow(new Date(listing.created_at), {
                addSuffix: false,
                locale: ar,
              })}
            </span>
          </div>
          <p className="font-semibold leading-tight text-foreground flex flex-wrap items-center gap-2">
            {listing.user.username || listing.user.name || "مستخدم"}
            {listing.user.embark_id && (
              <span className="text-[11px] text-muted-foreground bg-secondary/30 rounded px-2 py-0.5">
                {listing.user.embark_id}
              </span>
            )}
            {isNewAccount && (
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            )}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {listing.user.totalRatings > 0 ? (
              <>
                <Star className="h-4 w-4 text-amber-400" />
                <span>{listing.user.averageRating.toFixed(1)}</span>
              </>
            ) : (
              <span className="text-xs">لا توجد تقييمات</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">الكمية</p>
          <p className="text-lg font-semibold text-primary">{listing.quantity}</p>
        </div>
      </div>

      {/* Item Section */}
      <div className="flex gap-3 rounded-lg border border-border/70 bg-background/60 p-3">
        <div className="flex h-12 w-12 items-center justify-center rounded bg-secondary/40">
          {listing.item.icon ? (
            <img
              src={listing.item.icon}
              alt={listing.item.name}
              className="h-full w-full rounded object-contain"
            />
          ) : (
            <span className="text-xs text-muted-foreground">لا توجد صورة</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase text-muted-foreground">
            {listing.item.item_type || "نوع غير معروف"}
          </p>
          <p className={`font-semibold ${getRarityTextColor(listing.item.rarity)}`}>
            {listing.item.name}
          </p>
          {listing.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {listing.description}
            </p>
          )}
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>الندرة</p>
          <p className={`font-semibold ${getRarityTextColor(listing.item.rarity)}`}>
            {listing.item.rarity || "عادي"}
          </p>
        </div>
      </div>

      {/* Payment/Barter Section */}
      <div className="space-y-2 rounded-lg border border-dashed border-border/70 bg-secondary/10 p-3">
        {listing.paymentType === "SEEDS" && (
          <>
            <p className="text-xs uppercase text-muted-foreground">السعر</p>
            <p className="text-base font-semibold text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              {listing.seedsAmount?.toLocaleString()} بذور
            </p>
          </>
        )}
        {listing.paymentType === "OPEN_OFFERS" && (
          <>
            <p className="text-xs uppercase text-muted-foreground">عروض مفتوحة</p>
            <p className="text-sm text-foreground">
              {listing.description || "مفتوح لجميع العروض - مرن في التداول."}
            </p>
          </>
        )}
        {listing.paymentType === "ITEMS" && (
          <>
            <p className="text-xs uppercase text-muted-foreground">عناصر المقايضة</p>
            <div className="flex flex-wrap gap-2">
              {listing.paymentItems.map((paymentItem) => (
                <span
                  key={paymentItem.id}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs"
                >
                  {paymentItem.item.icon && (
                    <img
                      src={paymentItem.item.icon}
                      alt=""
                      className="h-6 w-6 rounded object-contain"
                    />
                  )}
                  <span className={`font-medium ${getRarityTextColor(paymentItem.item.rarity)}`}>
                    {paymentItem.quantity}x {paymentItem.item.name}
                  </span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetailModal(true)}
          className="text-sm"
        >
          <Eye className="h-4 w-4 ml-1" />
          عرض التفاصيل
        </Button>
        {!isOwnListing && currentUserId ? (
          <Button
            size="sm"
            className={`${hasActiveChat ? 'bg-blue-600 hover:bg-blue-700' : listingTypeConfig.actionBg} text-white font-semibold`}
            onClick={handleStartChat}
            disabled={isCreatingChat || checkingChat || isProfileIncomplete}
          >
            {checkingChat ? "..." : isCreatingChat ? "..." : hasActiveChat ? "فتح المحادثة" : listingTypeConfig.actionText}
          </Button>
        ) : !isOwnListing ? (
          <Button size="sm" variant="outline" disabled>
            سجل دخول للمتابعة
          </Button>
        ) : (
          <Badge variant="secondary" className="text-sm px-3 py-1.5 font-semibold">
            قائمتك
          </Badge>
        )}
      </div>

      {/* Detail Modal */}
      <ListingDetailModal
        listing={listing}
        currentUserId={currentUserId}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />

      {/* Profile Warning Alert Dialog */}
      <AlertDialog open={showProfileWarning} onOpenChange={setShowProfileWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>يجب إكمال ملفك الشخصي</AlertDialogTitle>
            <AlertDialogDescription className="text-right space-y-2">
              <p>
                يجب إضافة معرف Discord و Embark ID في ملفك الشخصي قبل التواصل مع البائعين أو المشترين.
              </p>
              <p className="font-semibold">
                انتقل إلى صفحة الملف الشخصي لإضافة هذه المعلومات.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <Link href="/profile">
              <AlertDialogAction className="bg-orange-600 hover:bg-orange-700">
                انتقل إلى الملف الشخصي
              </AlertDialogAction>
            </Link>
            <AlertDialogCancel onClick={() => setShowProfileWarning(false)}>
              إلغاء
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

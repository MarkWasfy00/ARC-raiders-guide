"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatList, ChatView } from "@/app/features/chat";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [chatListRefreshKey, setChatListRefreshKey] = useState(0);

  useEffect(() => {
    const chatId = searchParams.get("id");
    if (chatId) { 
      requestAnimationFrame(() => {
        setSelectedChatId(chatId);
        setShowMobileChat(true);
      });
    }
  }, [searchParams]);

  // Only show login prompt if definitely unauthenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">تسجيل الدخول مطلوب</h1>
        <p className="text-muted-foreground mb-4">
          يجب تسجيل الدخول للوصول إلى المحادثات
        </p>
        <Button onClick={() => router.push("/login")} className="bg-orange-600 hover:bg-orange-700">
          تسجيل الدخول
        </Button>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (status === "loading" || !session?.user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setShowMobileChat(true);
    router.push(`/chat?id=${chatId}`, { scroll: false });
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedChatId(null);
    router.push("/chat", { scroll: false });
  };

  const handleChatListUpdate = () => {
    // Increment key to trigger ChatList refresh
    setChatListRefreshKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">المحادثات</h1>
          <p className="text-muted-foreground">
            تواصل مع البائعين والمشترين
          </p>
        </div>

        <div className="grid md:grid-cols-[350px_1fr] gap-4 h-[calc(100vh-240px)]">
          {/* Chat List - Desktop always visible, mobile conditional */}
          <div className={`bg-card border border-border rounded-lg overflow-hidden ${showMobileChat ? "hidden md:block" : ""}`}>
            <ChatList
              currentUserId={session.user.id}
              selectedChatId={selectedChatId || undefined}
              onChatSelect={handleChatSelect}
              refreshKey={chatListRefreshKey}
            />
          </div>

          {/* Chat View - Desktop always visible, mobile conditional */}
          <div className={`bg-card border border-border rounded-lg overflow-hidden ${!showMobileChat ? "hidden md:block" : ""}`}>
            {selectedChatId ? (
              <ChatView
                chatId={selectedChatId}
                currentUserId={session.user.id}
                onBack={handleBackToList}
                onChatListUpdate={handleChatListUpdate}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">اختر محادثة</h3>
                <p className="text-sm text-muted-foreground">
                  اختر محادثة من القائمة لبدء المحادثة
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

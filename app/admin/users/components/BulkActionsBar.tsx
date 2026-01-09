"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ban, CheckCircle, X, Download } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface BulkActionsBarProps {
  selectedCount: number;
  selectedUserIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

export function BulkActionsBar({
  selectedCount,
  selectedUserIds,
  onClearSelection,
  onActionComplete,
}: BulkActionsBarProps) {
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleBulkBan = async () => {
    if (!banReason.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال سبب الحظر",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/users/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: selectedUserIds,
          action: "ban",
          reason: banReason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "نجح",
          description: `تم حظر ${data.updatedCount} مستخدم`,
        });
        setShowBanDialog(false);
        setBanReason("");
        onActionComplete();
      } else {
        toast({
          title: "خطأ",
          description: data.error || "فشل حظر المستخدمين",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في الاتصال",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUnban = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: selectedUserIds,
          action: "unban",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "نجح",
          description: `تم إلغاء حظر ${data.updatedCount} مستخدم`,
        });
        setShowUnbanDialog(false);
        onActionComplete();
      } else {
        toast({
          title: "خطأ",
          description: data.error || "فشل إلغاء حظر المستخدمين",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في الاتصال",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background/95 p-4 shadow-lg backdrop-blur-sm">
          <Badge variant="secondary" className="text-sm">
            {selectedCount} محدد (Selected)
          </Badge>

          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBanDialog(true)}
              disabled={loading}
            >
              <Ban className="ml-2 h-4 w-4" />
              حظر (Ban)
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUnbanDialog(true)}
              disabled={loading}
            >
              <CheckCircle className="ml-2 h-4 w-4" />
              إلغاء الحظر (Unban)
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              disabled={loading}
            >
              <X className="ml-2 h-4 w-4" />
              إلغاء
            </Button>
          </div>
        </div>
      </div>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              حظر {selectedCount} مستخدم؟
              <span className="block text-sm font-normal text-muted-foreground">
                Ban {selectedCount} user(s)?
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <p>
                  سيتم حظر المستخدمين المحددين وإلغاء جلساتهم الحالية.
                  <span className="block text-xs">
                    This action will ban the selected users and invalidate their
                    current sessions.
                  </span>
                </p>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    سبب الحظر (Ban Reason) *
                  </label>
                  <Textarea
                    placeholder="أدخل سبب الحظر..."
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkBan}
              disabled={loading || !banReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "جاري الحظر..." : "حظر"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unban Confirmation Dialog */}
      <AlertDialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              إلغاء حظر {selectedCount} مستخدم؟
              <span className="block text-sm font-normal text-muted-foreground">
                Unban {selectedCount} user(s)?
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إلغاء حظر المستخدمين المحددين والسماح لهم بتسجيل الدخول مرة أخرى.
              <span className="block text-xs">
                This action will unban the selected users and allow them to log in
                again.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkUnban} disabled={loading}>
              {loading ? "جاري إلغاء الحظر..." : "إلغاء الحظر"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import { DiscordIcon } from "@/components/icons/DiscordIcon";

interface DiscordShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discordUsername: string | null;
  itemName: string;
}

export function DiscordShareDialog({
  open,
  onOpenChange,
  discordUsername,
  itemName,
}: DiscordShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const shareText = discordUsername
    ? `@${discordUsername} أنا مهتم بهذا العنصر: ${itemName}`
    : `أنا مهتم بهذا العنصر: ${itemName}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleOpenDiscord = () => {
    // Try to open Discord desktop app first, fallback to web
    window.location.href = "discord://";

    // Fallback to web version after a short delay if app doesn't open
    setTimeout(() => {
      window.open("https://discord.com/app", "_blank");
    }, 1000);
  };

  const handleCopyAndOpen = async () => {
    await handleCopy();
    // Wait a moment for user to see the "copied" confirmation
    setTimeout(() => {
      handleOpenDiscord();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>مشاركة على Discord</DialogTitle>
          <DialogDescription>
            انسخ النص أدناه وأرسله على Discord
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <div className="p-4 bg-muted rounded-lg border border-border">
              <p className="text-sm select-all font-mono break-words">
                {shareText}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleCopyAndOpen}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 ml-2" />
                  تم النسخ! جاري فتح Discord...
                </>
              ) : (
                <>
                  <DiscordIcon className="h-4 w-4 ml-2" />
                  نسخ وفتح Discord
                </>
              )}
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 ml-2" />
                    تم النسخ!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 ml-2" />
                    نسخ فقط
                  </>
                )}
              </Button>
              <Button
                onClick={handleOpenDiscord}
                variant="outline"
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 ml-2" />
                فتح Discord
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

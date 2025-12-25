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
import { Copy, Check } from "lucide-react";

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
          <Button
            onClick={handleCopy}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 ml-2" />
                تم النسخ!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 ml-2" />
                نسخ النص
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

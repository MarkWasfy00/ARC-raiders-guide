"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradeId: string;
  otherUser: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
  };
  onSubmit: (rating: {
    score: number;
    honest: boolean;
    comment: string;
  }) => Promise<void>;
}

export function RatingDialog({
  open,
  onOpenChange,
  tradeId,
  otherUser,
  onSubmit,
}: RatingDialogProps) {
  const [score, setScore] = useState(0);
  const [hoveredScore, setHoveredScore] = useState(0);
  const [honest, setHonest] = useState(true);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (score === 0) {
      alert("الرجاء اختيار تقييم"); // Please select a rating
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ score, honest, comment });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">تقييم التاجر</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser.image || ""} />
              <AvatarFallback>
                {otherUser.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {otherUser.username || otherUser.name}
              </p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex flex-col items-center gap-2">
            <Label>كيف كانت تجربتك مع هذا التاجر؟</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setScore(star)}
                  onMouseEnter={() => setHoveredScore(star)}
                  onMouseLeave={() => setHoveredScore(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredScore || score)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Honesty Toggle */}
          <div className="flex items-center gap-3">
            <Label htmlFor="honest">هل كان التاجر أميناً؟</Label>
            <button
              id="honest"
              type="button"
              onClick={() => setHonest(!honest)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                honest ? "bg-green-500" : "bg-gray-400"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  honest ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm">{honest ? "نعم" : "لا"}</span>
          </div>

          {/* Comment */}
          <div className="w-full">
            <Label htmlFor="comment">تعليق (اختياري)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="شارك تجربتك مع هذا التاجر..."
              maxLength={500}
              className="mt-2 resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1"
            >
              تخطي
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || score === 0}
              className="flex-1"
            >
              {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

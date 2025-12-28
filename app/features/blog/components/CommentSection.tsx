"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentItem } from "./CommentItem";
import { createComment } from "../services/comment-actions";
import type { CommentData } from "../types";

interface CommentSectionProps {
  blogId: string;
  comments: CommentData[];
  currentUserId?: string;
}

export function CommentSection({
  blogId,
  comments,
  currentUserId,
}: CommentSectionProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      router.push("/login");
      return;
    }

    if (!content.trim()) {
      setError("المحتوى مطلوب");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const result = await createComment(blogId, content.trim(), replyToId || undefined);

      if (!result.success) {
        setError(result.error?.message || "فشل إضافة التعليق");
        return;
      }

      setContent("");
      setReplyToId(null);
      router.refresh();
    } catch (err: any) {
      console.error("Comment submit error:", err);
      setError(err.message || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyToId(commentId);
    // Scroll to comment form
    document.getElementById("comment-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">التعليقات ({comments.length})</h2>

      {/* Comment Form */}
      {currentUserId ? (
        <form id="comment-form" onSubmit={handleSubmit} className="space-y-3">
          {replyToId && (
            <div className="text-sm text-muted-foreground flex items-center justify-between bg-muted p-2 rounded">
              <span>الرد على تعليق</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReplyToId(null)}
              >
                إلغاء
              </Button>
            </div>
          )}

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyToId ? "اكتب ردك..." : "اكتب تعليقك..."}
            className="min-h-[100px]"
            dir="rtl"
            maxLength={2000}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between">
            <Button type="submit" disabled={submitting || !content.trim()}>
              {submitting ? "جاري النشر..." : "نشر التعليق"}
            </Button>
            <span className="text-xs text-muted-foreground">
              {content.length}/2000
            </span>
          </div>
        </form>
      ) : (
        <div className="p-4 border rounded-lg text-center">
          <p className="text-muted-foreground mb-2">سجل دخولك للتعليق</p>
          <Button variant="outline" onClick={() => router.push("/login")}>
            تسجيل الدخول
          </Button>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={handleReply}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          لا توجد تعليقات بعد. كن أول من يعلق!
        </p>
      )}
    </div>
  );
}

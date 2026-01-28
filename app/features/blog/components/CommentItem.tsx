"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, Reply } from "lucide-react";
import { deleteComment } from "../services/comment-actions";
import type { CommentData } from "../types";

interface CommentItemProps {
  comment: CommentData;
  currentUserId?: string;
  currentUserRole?: string;
  onReply?: (commentId: string) => void;
  isNested?: boolean;
}

export function CommentItem({
  comment,
  currentUserId,
  currentUserRole,
  onReply,
  isNested = false,
}: CommentItemProps) {
  const [deleting, setDeleting] = useState(false);
  const isAuthor = currentUserId === comment.userId;
  const isStaff = currentUserRole === 'ADMIN' || currentUserRole === 'MODERATOR';
  const canDelete = isAuthor || isStaff;

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) {
      return;
    }

    setDeleting(true);

    try {
      const result = await deleteComment(comment.id);

      if (!result.success) {
        alert(result.error?.message || "فشل حذف التعليق");
      }
      // Page will revalidate automatically
    } catch (error) {
      console.error("Delete error:", error);
      alert("حدث خطأ أثناء حذف التعليق");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`space-y-3 ${isNested ? "mr-8 border-r pr-4" : ""}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.user.image || undefined} />
          <AvatarFallback>
            {comment.user.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {comment.user.username || comment.user.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                locale: ar,
                addSuffix: true,
              })}
            </span>
          </div>

          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

          <div className="flex items-center gap-2">
            {onReply && currentUserId && !isNested && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(comment.id)}
              >
                <Reply className="h-3 w-3 ml-1" />
                رد
              </Button>
            )}

            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 ml-1" />
                {deleting ? "جاري الحذف..." : "حذف"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              isNested={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, MessageSquare } from "lucide-react";
import { deleteComment } from "@/app/features/blog/services/comment-actions";
import type { CommentData } from "@/app/features/blog/types";

interface CommentModerationProps {
  blogId: string;
  comments: CommentData[];
}

export function CommentModeration({ blogId, comments }: CommentModerationProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (commentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) {
      return;
    }

    setDeleting(commentId);
    try {
      const result = await deleteComment(commentId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error?.message || "فشل حذف التعليق");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("فشل حذف التعليق");
    } finally {
      setDeleting(null);
    }
  };

  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          التعليقات ({totalComments})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد تعليقات
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={comment.user.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {comment.user.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium truncate">
                      {comment.user.username || comment.user.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deleting === comment.id}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      locale: ar,
                      addSuffix: true,
                    })}
                  </p>
                  <p className="text-sm mt-1 line-clamp-2">{comment.content}</p>
                </div>
              </div>

              {comment.replies && comment.replies.length > 0 && (
                <div className="mr-6 space-y-2">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 border-r-2 border-primary/30"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={reply.user.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {reply.user.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium truncate">
                            {reply.user.username || reply.user.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(reply.id)}
                            disabled={deleting === reply.id}
                            className="h-5 w-5 p-0"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                        <p className="text-xs mt-1 line-clamp-2">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

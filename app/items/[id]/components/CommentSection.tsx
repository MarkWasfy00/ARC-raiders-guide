'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
};

interface CommentSectionProps {
  itemId: string;
}

export function CommentSection({ itemId }: CommentSectionProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newComment, setNewComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [showReauthDialog, setShowReauthDialog] = React.useState(false);

  const fetchComments = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/items/${itemId}/comments`);
      const result = await response.json();

      if (result.success) {
        setComments(result.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  React.useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/items/${itemId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setComments([result.data, ...comments]);
        setNewComment('');
      } else {
        // If user not found, show dialog to sign out and sign in again
        if (result.error === 'User not found') {
          setShowReauthDialog(true);
        } else {
          alert(result.message || 'فشل في إضافة التعليق');
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('حدث خطأ أثناء إضافة التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReauth = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'الآن';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `منذ ${minutes} دقيقة${minutes > 1 ? '' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `منذ ${hours} ساعة${hours > 1 ? '' : ''}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `منذ ${days} يوم${days > 1 ? '' : ''}`;
    } else {
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getUserDisplayName = (user: Comment['user']) => {
    return user.username || user.name || 'مستخدم';
  };

  const getUserInitial = (user: Comment['user']) => {
    const name = getUserDisplayName(user);
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Comment Form */}
        {status === 'authenticated' ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={session.user?.image || ''} />
                <AvatarFallback>
                  {session.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="اكتب تعليقك هنا..."
                  className="w-full min-h-[100px] p-3 rounded-md border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                <Send className="h-4 w-4 ml-2" />
                نشر التعليق
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-muted rounded-md text-center">
            <p className="text-muted-foreground mb-3">
              يجب عليك تسجيل الدخول لإضافة تعليق
            </p>
            <Button asChild>
              <a href="/login">تسجيل الدخول</a>
            </Button>
          </div>
        )}

        <Separator />

        {/* Comments List */}
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            جاري التحميل...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            لا توجد تعليقات بعد. كن أول من يعلق!
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={comment.user.image || ''} />
                  <AvatarFallback>{getUserInitial(comment.user)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {getUserDisplayName(comment.user)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Re-authentication Dialog */}
      <AlertDialog open={showReauthDialog} onOpenChange={setShowReauthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>يجب إعادة تسجيل الدخول</AlertDialogTitle>
            <AlertDialogDescription>
              حسابك غير موجود في قاعدة البيانات. يرجى تسجيل الخروج وتسجيل الدخول مرة أخرى لحل هذه المشكلة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleReauth}>
              تسجيل الخروج والدخول مرة أخرى
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

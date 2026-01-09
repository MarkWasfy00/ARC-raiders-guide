'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadoutEditor } from './LoadoutEditor';
import { Button } from '@/components/ui/button';
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
import { Edit, Trash2, Share2 } from 'lucide-react';
import { deleteLoadout } from '../services/loadouts-actions';
import { useToast } from '@/components/ui/use-toast';
import type { Loadout } from '../types';

interface LoadoutViewProps {
  loadout: Loadout;
  isOwner: boolean;
}

export function LoadoutView({ loadout, isOwner }: LoadoutViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteLoadout(loadout.id);

    if (result.success) {
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف الحمولة',
      });
      router.push('/loadouts');
    } else {
      toast({
        title: 'فشل الحذف',
        description: result.error || 'حدث خطأ أثناء حذف الحمولة',
        variant: 'destructive',
      });
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/loadouts/${loadout.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ رابط الحمولة إلى الحافظة',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">{loadout.name}</h1>
          {loadout.description && (
            <p className="mt-2 text-muted-foreground">{loadout.description}</p>
          )}
          {loadout.user && (
            <p className="mt-1 text-sm text-muted-foreground">
              بواسطة: {loadout.user.username || loadout.user.embark_id || 'مستخدم'}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleCopyLink} title="مشاركة">
            <Share2 className="h-4 w-4" />
          </Button>
          {isOwner && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/loadouts/${loadout.id}/edit`)}
              >
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="ml-2 h-4 w-4" />
                حذف
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Loadout Display */}
      <LoadoutEditor
        initialData={loadout.loadoutData}
        initialName={loadout.name}
        initialDescription={loadout.description || ''}
        initialTags={loadout.tags}
        initialIsPublic={loadout.is_public}
        onSave={async () => {}}
        isEditMode={false}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذه الحمولة نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadoutEditor } from './LoadoutEditor';
import { updateLoadout } from '../services/loadouts-actions';
import { useToast } from '@/components/ui/use-toast';
import { validateLoadoutData } from '../utils/slot-utils';
import type { Loadout } from '../types';

interface LoadoutEditFormProps {
  loadout: Loadout;
}

export function LoadoutEditForm({ loadout }: LoadoutEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: any) => {
    // Validate
    const validationError = validateLoadoutData(data);
    if (validationError) {
      toast({
        title: 'خطأ في التحقق',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    const result = await updateLoadout(loadout.id, {
      name: data.name,
      description: data.description,
      tags: data.tags,
      is_public: data.is_public,
      loadoutData: data.loadoutData,
    });

    setSaving(false);

    if (result.success) {
      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تم تحديث الحمولة',
      });
      router.push(`/loadouts/${loadout.id}`);
    } else {
      toast({
        title: 'فشل الحفظ',
        description: result.error || 'حدث خطأ أثناء حفظ التغييرات',
        variant: 'destructive',
      });
    }
  };

  return (
    <LoadoutEditor
      initialData={loadout.loadoutData}
      initialName={loadout.name}
      initialDescription={loadout.description || ''}
      initialTags={loadout.tags}
      initialIsPublic={loadout.is_public}
      onSave={handleSave}
      isSaving={saving}
    />
  );
}

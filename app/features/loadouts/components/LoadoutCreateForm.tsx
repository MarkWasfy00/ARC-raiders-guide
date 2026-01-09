'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadoutEditor } from './LoadoutEditor';
import { createLoadout } from '../services/loadouts-actions';
import { useToast } from '@/components/ui/use-toast';
import { validateLoadoutData } from '../utils/slot-utils';

export function LoadoutCreateForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);

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

    setCreating(true);

    const result = await createLoadout({
      name: data.name,
      description: data.description,
      tags: data.tags,
      is_public: data.is_public,
      loadoutData: data.loadoutData,
    });

    setCreating(false);

    if (result.success && result.data) {
      toast({
        title: 'تم الإنشاء بنجاح',
        description: 'تم حفظ الحمولة الجديدة',
      });
      router.push(`/loadouts/${result.data.id}`);
    } else {
      toast({
        title: 'فشل الإنشاء',
        description: result.error || 'حدث خطأ أثناء إنشاء الحمولة',
        variant: 'destructive',
      });
    }
  };

  return <LoadoutEditor onSave={handleSave} isSaving={creating} />;
}

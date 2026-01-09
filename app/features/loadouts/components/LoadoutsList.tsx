'use client';

import { useState, useEffect } from 'react';
import { LoadoutCard } from './LoadoutCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import type { Loadout } from '../types';

interface LoadoutsListProps {
  userId?: string;
}

export function LoadoutsList({ userId }: LoadoutsListProps) {
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'public' | 'mine'>('public');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoadouts();
  }, [tab, userId]);

  const fetchLoadouts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (tab === 'public') {
        params.append('public', 'true');
      } else if (tab === 'mine' && userId) {
        params.append('userId', userId);
      }

      const response = await fetch(`/api/loadouts?${params}`);
      const data = await response.json();

      if (data.success) {
        setLoadouts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch loadouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLoadouts = search
    ? loadouts.filter((loadout) =>
        loadout.name.toLowerCase().includes(search.toLowerCase()) ||
        loadout.description?.toLowerCase().includes(search.toLowerCase()) ||
        loadout.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      )
    : loadouts;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث عن حمولة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="public">الحمولات العامة</TabsTrigger>
          <TabsTrigger value="mine" disabled={!userId}>
            حمولاتي
          </TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="mt-6">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              جاري التحميل...
            </div>
          ) : filteredLoadouts.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed py-12 text-center text-muted-foreground">
              {search
                ? 'لا توجد نتائج للبحث'
                : 'لا توجد حمولات عامة بعد'}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLoadouts.map((loadout) => (
                <LoadoutCard
                  key={loadout.id}
                  loadout={loadout}
                  isOwner={loadout.userId === userId}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="mt-6">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              جاري التحميل...
            </div>
          ) : filteredLoadouts.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed py-12 text-center text-muted-foreground">
              {search
                ? 'لا توجد نتائج للبحث'
                : 'لم تقم بإنشاء أي حمولات بعد'}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLoadouts.map((loadout) => (
                <LoadoutCard key={loadout.id} loadout={loadout} isOwner />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { Loadout } from '../types';

interface LoadoutCardProps {
  loadout: Loadout;
  isOwner?: boolean;
}

export function LoadoutCard({ loadout, isOwner }: LoadoutCardProps) {
  return (
    <Link href={`/loadouts/${loadout.id}`}>
      <Card className="transition-all hover:border-primary hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-lg">{loadout.name}</CardTitle>
            {isOwner && (
              <div className="text-muted-foreground" title={loadout.is_public ? 'عام' : 'خاص'}>
                {loadout.is_public ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadout.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {loadout.description}
            </p>
          )}

          {loadout.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {loadout.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {loadout.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{loadout.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {loadout.user && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{loadout.user.username || loadout.user.embark_id || 'مستخدم'}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(loadout.created_at), {
                  addSuffix: true,
                  locale: ar,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

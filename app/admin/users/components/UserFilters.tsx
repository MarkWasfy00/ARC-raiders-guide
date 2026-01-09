"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface UserFiltersProps {
  search: string;
  role: string;
  banned: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onBannedChange: (value: string) => void;
  onClear: () => void;
}

export function UserFilters({
  search,
  role,
  banned,
  onSearchChange,
  onRoleChange,
  onBannedChange,
  onClear,
}: UserFiltersProps) {
  const hasFilters = search || role !== "all" || banned !== "all";

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو البريد أو Embark ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10"
          />
        </div>
        {hasFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={onClear}
            title="مسح الفلاتر"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Role Filter */}
        <div className="flex-1 min-w-[150px]">
          <Select value={role} onValueChange={onRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="الدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex flex-col">
                  <span>جميع الأدوار</span>
                  <span className="text-xs text-muted-foreground">All Roles</span>
                </div>
              </SelectItem>
              <SelectItem value="USER">
                <div className="flex flex-col">
                  <span>مستخدم</span>
                  <span className="text-xs text-muted-foreground">User</span>
                </div>
              </SelectItem>
              <SelectItem value="ADMIN">
                <div className="flex flex-col">
                  <span>مشرف</span>
                  <span className="text-xs text-muted-foreground">Admin</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Banned Status Filter */}
        <div className="flex-1 min-w-[150px]">
          <Select value={banned} onValueChange={onBannedChange}>
            <SelectTrigger>
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex flex-col">
                  <span>جميع الحالات</span>
                  <span className="text-xs text-muted-foreground">All Status</span>
                </div>
              </SelectItem>
              <SelectItem value="false">
                <div className="flex flex-col">
                  <span>نشط</span>
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
              </SelectItem>
              <SelectItem value="true">
                <div className="flex flex-col">
                  <span>محظور</span>
                  <span className="text-xs text-muted-foreground">Banned</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

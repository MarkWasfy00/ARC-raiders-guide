"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreVertical, Ban, CheckCircle, Shield, ShieldOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { formatArabicNumbers } from "@/lib/utils/chart-formatters";

interface User {
  id: string;
  username: string | null;
  email: string | null;
  name: string | null;
  image: string | null;
  role: string;
  banned: boolean;
  bannedAt: Date | null;
  banReason: string | null;
  embark_id: string | null;
  createdAt: Date;
  _count: {
    listings: number;
    tradesAsBuyer: number;
    tradesAsSeller: number;
    messages: number;
  };
}

interface UserTableProps {
  users: User[];
  selectedUserIds: string[];
  isAdmin?: boolean;
  onSelectUser: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onBanUser: (user: User) => void;
  onUnbanUser: (user: User) => void;
  onPromoteUser: (user: User) => void;
  onDemoteUser: (user: User) => void;
}

export function UserTable({
  users,
  selectedUserIds,
  isAdmin = false,
  onSelectUser,
  onSelectAll,
  onBanUser,
  onUnbanUser,
  onPromoteUser,
  onDemoteUser,
}: UserTableProps) {
  const allSelected = users.length > 0 && selectedUserIds.length === users.length;
  const someSelected = selectedUserIds.length > 0 && !allSelected;

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                aria-label="تحديد الكل"
                className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
              />
            </TableHead>
            <TableHead>
              <div className="flex flex-col">
                <span>المستخدم</span>
                <span className="text-xs font-normal text-muted-foreground">User</span>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex flex-col">
                <span>الدور</span>
                <span className="text-xs font-normal text-muted-foreground">Role</span>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex flex-col">
                <span>الإحصائيات</span>
                <span className="text-xs font-normal text-muted-foreground">Stats</span>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex flex-col">
                <span>التسجيل</span>
                <span className="text-xs font-normal text-muted-foreground">Registered</span>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex flex-col">
                <span>الحالة</span>
                <span className="text-xs font-normal text-muted-foreground">Status</span>
              </div>
            </TableHead>
            <TableHead className="w-[80px]">
              <div className="flex flex-col">
                <span>إجراءات</span>
                <span className="text-xs font-normal text-muted-foreground">Actions</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                لا توجد نتائج (No results found)
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const displayName = user.username || user.email || "Unknown";
              const isSelected = selectedUserIds.includes(user.id);
              const totalTrades = user._count.tradesAsBuyer + user._count.tradesAsSeller;

              return (
                <TableRow key={user.id} className={isSelected ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        onSelectUser(user.id, checked as boolean)
                      }
                      aria-label={`تحديد ${displayName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback>
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{displayName}</span>
                        {user.embark_id && (
                          <span className="text-xs text-muted-foreground">
                            {user.embark_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === "ADMIN" ? (
                      <Badge variant="destructive" className="gap-1">
                        <Shield className="h-3 w-3" />
                        مشرف
                      </Badge>
                    ) : user.role === "MODERATOR" ? (
                      <Badge className="gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        <Shield className="h-3 w-3" />
                        مراقب
                      </Badge>
                    ) : (
                      <Badge variant="secondary">مستخدم</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">إعلانات:</span>
                        <span className="font-medium">
                          {formatArabicNumbers(user._count.listings)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">صفقات:</span>
                        <span className="font-medium">
                          {formatArabicNumbers(totalTrades)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">رسائل:</span>
                        <span className="font-medium">
                          {formatArabicNumbers(user._count.messages)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <div className="flex flex-col gap-1">
                        <Badge variant="destructive" className="w-fit gap-1">
                          <Ban className="h-3 w-3" />
                          محظور
                        </Badge>
                        {user.banReason && (
                          <span className="text-xs text-muted-foreground line-clamp-2">
                            {user.banReason}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        نشط
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.banned ? (
                            <DropdownMenuItem onClick={() => onUnbanUser(user)}>
                              <CheckCircle className="ml-2 h-4 w-4" />
                              إلغاء الحظر
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => onBanUser(user)}>
                              <Ban className="ml-2 h-4 w-4 text-destructive" />
                              حظر المستخدم
                            </DropdownMenuItem>
                          )}
                          {user.role !== "ADMIN" && (
                            <DropdownMenuItem onClick={() => onPromoteUser(user)}>
                              <Shield className="ml-2 h-4 w-4 text-primary" />
                              {user.role === "USER" ? "ترقية" : "ترقية إلى مشرف"}
                            </DropdownMenuItem>
                          )}
                          {user.role !== "USER" && user.role !== "ADMIN" && (
                            <DropdownMenuItem onClick={() => onDemoteUser(user)}>
                              <ShieldOff className="ml-2 h-4 w-4 text-muted-foreground" />
                              تخفيض إلى مستخدم
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-xs text-muted-foreground">للمشرف فقط</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

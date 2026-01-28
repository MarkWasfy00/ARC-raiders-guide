"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Loader2, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { UserFilters } from "./components/UserFilters";
import { UserTable } from "./components/UserTable";
import { BulkActionsBar } from "./components/BulkActionsBar";

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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function UsersList() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [banned, setBanned] = useState("all");
  const [page, setPage] = useState(1);

  // Selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Dialog states
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [demoteDialogOpen, setDemoteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [promoteToRole, setPromoteToRole] = useState<"ADMIN" | "MODERATOR">("MODERATOR");

  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(role !== "all" && { role }),
        ...(banned !== "all" && { banned }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, role, banned]);

  // Selection handlers
  const handleSelectUser = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUserIds([...selectedUserIds, userId]);
    } else {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUserIds(users.map((user) => user.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedUserIds([]);
  };

  // Action handlers
  const handleBanUser = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: banReason }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "تم الحظر",
          description: "تم حظر المستخدم بنجاح",
        });
        fetchUsers();
        setBanDialogOpen(false);
        setBanReason("");
        setSelectedUser(null);
      } else {
        toast({
          title: "خطأ",
          description: data.error || "فشل في حظر المستخدم",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حظر المستخدم",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "تم إلغاء الحظر",
          description: "تم إلغاء حظر المستخدم بنجاح",
        });
        fetchUsers();
        setUnbanDialogOpen(false);
        setSelectedUser(null);
      } else {
        toast({
          title: "خطأ",
          description: data.error || "فشل في إلغاء حظر المستخدم",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إلغاء حظر المستخدم",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromoteUser = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: promoteToRole }),
      });

      const data = await response.json();

      if (data.success) {
        const roleLabel = promoteToRole === "ADMIN" ? "مشرف" : "مراقب";
        toast({
          title: "تمت الترقية",
          description: `تم ترقية المستخدم إلى ${roleLabel} بنجاح`,
        });
        fetchUsers();
        setPromoteDialogOpen(false);
        setSelectedUser(null);
        setPromoteToRole("MODERATOR"); // Reset to default
      } else {
        toast({
          title: "خطأ",
          description: data.error || "فشل في ترقية المستخدم",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في ترقية المستخدم",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDemoteUser = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/promote`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "تم التخفيض",
          description: "تم إلغاء صلاحيات المشرف بنجاح",
        });
        fetchUsers();
        setDemoteDialogOpen(false);
        setSelectedUser(null);
      } else {
        toast({
          title: "خطأ",
          description: data.error || "فشل في تخفيض رتبة المستخدم",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تخفيض رتبة المستخدم",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(role !== "all" && { role }),
        ...(banned !== "all" && { banned }),
      });

      const response = await fetch(`/api/admin/users/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "تم التصدير",
          description: "تم تصدير البيانات بنجاح",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تصدير البيانات",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRole("all");
    setBanned("all");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 shadow-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-3xl font-bold text-transparent">
              إدارة المستخدمين
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              User Management
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            <span>تصدير (Export)</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      <UserFilters
        search={search}
        role={role}
        banned={banned}
        onSearchChange={setSearch}
        onRoleChange={setRole}
        onBannedChange={setBanned}
        onClear={clearFilters}
      />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>المستخدمون</CardTitle>
          <CardDescription>
            {pagination && `${pagination.total} مستخدم مسجل`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <UserTable
                users={users}
                selectedUserIds={selectedUserIds}
                isAdmin={isAdmin}
                onSelectUser={handleSelectUser}
                onSelectAll={handleSelectAll}
                onBanUser={(user) => {
                  setSelectedUser(user);
                  setBanDialogOpen(true);
                }}
                onUnbanUser={(user) => {
                  setSelectedUser(user);
                  setUnbanDialogOpen(true);
                }}
                onPromoteUser={(user) => {
                  setSelectedUser(user);
                  // If user is already a MODERATOR, default to ADMIN
                  setPromoteToRole(user.role === "MODERATOR" ? "ADMIN" : "MODERATOR");
                  setPromoteDialogOpen(true);
                }}
                onDemoteUser={(user) => {
                  setSelectedUser(user);
                  setDemoteDialogOpen(true);
                }}
              />

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    السابق
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    صفحة {page} من {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                  >
                    التالي
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions Bar - Admin only */}
      {isAdmin && selectedUserIds.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedUserIds.length}
          selectedUserIds={selectedUserIds}
          onClearSelection={handleClearSelection}
          onActionComplete={() => {
            fetchUsers();
            handleClearSelection();
          }}
        />
      )}

      {/* Individual Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حظر المستخدم</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حظر {selectedUser?.username || selectedUser?.email}؟
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="mb-2 block text-sm font-medium">سبب الحظر</label>
              <Textarea
                placeholder="اذكر سبب حظر هذا المستخدم..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanUser}
              disabled={actionLoading || !banReason.trim()}
            >
              {actionLoading ? "جاري الحظر..." : "حظر المستخدم"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Individual Unban Dialog */}
      <Dialog open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إلغاء حظر المستخدم</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من إلغاء حظر {selectedUser?.username || selectedUser?.email}؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnbanDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUnbanUser} disabled={actionLoading}>
              {actionLoading ? "جاري إلغاء الحظر..." : "إلغاء الحظر"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote Dialog */}
      <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ترقية المستخدم</DialogTitle>
            <DialogDescription>
              اختر الدور الجديد لـ {selectedUser?.username || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium">اختر الدور</label>
              <div className="flex gap-3">
                {selectedUser?.role === "USER" && (
                  <Button
                    type="button"
                    variant={promoteToRole === "MODERATOR" ? "default" : "outline"}
                    onClick={() => setPromoteToRole("MODERATOR")}
                    className="flex-1"
                  >
                    <Shield className="ml-2 h-4 w-4" />
                    مراقب (Moderator)
                  </Button>
                )}
                <Button
                  type="button"
                  variant={promoteToRole === "ADMIN" ? "default" : "outline"}
                  onClick={() => setPromoteToRole("ADMIN")}
                  className={selectedUser?.role === "MODERATOR" ? "w-full" : "flex-1"}
                >
                  <Shield className="ml-2 h-4 w-4" />
                  مشرف (Admin)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedUser?.role === "MODERATOR"
                  ? "سيتم ترقية المراقب إلى مشرف بصلاحيات كاملة لإدارة النظام."
                  : promoteToRole === "MODERATOR"
                    ? "المراقب يمكنه إدارة الأدلة والخرائط والإعدادات، لكن لا يمكنه حظر المستخدمين أو ترقيتهم."
                    : "المشرف لديه صلاحيات كاملة لإدارة النظام بالكامل."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handlePromoteUser} disabled={actionLoading}>
              {actionLoading ? "جاري الترقية..." : "ترقية"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demote Dialog */}
      <Dialog open={demoteDialogOpen} onOpenChange={setDemoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إلغاء صلاحيات المشرف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من إلغاء صلاحيات المشرف من {selectedUser?.username || selectedUser?.email}؟
              سيصبح المستخدم مستخدماً عادياً.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDemoteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleDemoteUser} disabled={actionLoading} variant="destructive">
              {actionLoading ? "جاري التخفيض..." : "تخفيض الرتبة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

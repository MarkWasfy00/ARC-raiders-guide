"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Mail, AtSign, Gamepad2, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import { updateProfile } from "../services/profile-actions";
import type { UserProfile, UpdateProfileData } from "../types";

interface ProfileFormProps {
  user: UserProfile;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [formData, setFormData] = useState<UpdateProfileData>({
    name: user.name || "",
    username: user.username || "",
    embark_id: user.embark_id || "",
    discord_username: user.discord_username || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      const result = await updateProfile(formData);

      if (result.success) {
        setSuccess("تم تحديث الملف الشخصي بنجاح!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error?.message || "حدث خطأ");
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const missingFieldsCount = [!user.embark_id, !user.discord_username].filter(Boolean).length;
  const profileCompletion = Math.round(((4 - missingFieldsCount) / 4) * 100);

  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Profile Card */}
      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-xl">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="text-3xl font-bold bg-gradient-orange text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 w-full">
                <h2 className="text-2xl font-bold">{user.name || user.username || "User"}</h2>
                <p className="text-sm text-muted-foreground break-all">{user.email}</p>
              </div>

              <Separator />

              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">اكتمال الملف الشخصي</span>
                  <span className="text-lg font-bold">{profileCompletion}%</span>
                </div>

                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-orange transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>

                {profileCompletion === 100 ? (
                  <Badge variant="default" className="w-full justify-center gap-2 py-2">
                    <CheckCircle2 className="h-4 w-4" />
                    الملف الشخصي مكتمل
                  </Badge>
                ) : (
                  <Badge variant="outline" className="w-full justify-center gap-2 py-2 border-amber-500 text-amber-600 dark:text-amber-500">
                    <AlertCircle className="h-4 w-4" />
                    {missingFieldsCount} حقل ناقص
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="w-full space-y-2 text-right">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">معلومات سريعة</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground justify-end">
                    <span>{user.username || "غير محدد"}</span>
                    <AtSign className="h-3.5 w-3.5" />
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground justify-end">
                    <span>{user.embark_id || "لا يوجد معرف إمبارك"}</span>
                    <Gamepad2 className="h-3.5 w-3.5" />
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground justify-end">
                    <span>{user.discord_username || "لا يوجد ديسكورد"}</span>
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Edit Form */}
      <div className="lg:col-span-2">
        <Card className="shadow-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl">تعديل الملف الشخصي</CardTitle>
            <CardDescription>
              قم بتحديث تفاصيل ملفك الشخصي وبيانات اعتماد الألعاب الخاصة بك
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 text-sm text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-4 text-sm text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <div className="h-8 w-1 bg-gradient-orange rounded-full" />
                <h3 className="text-lg font-bold">المعلومات الأساسية</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    عنوان البريد الإلكتروني
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    لا يمكن تغيير البريد الإلكتروني
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center justify-between text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <AtSign className="h-4 w-4 text-muted-foreground" />
                      اسم المستخدم
                    </span>
                    {!user.username && (
                      <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-500">
                        مطلوب
                      </Badge>
                    )}
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="اختر اسم مستخدم فريد"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isPending}
                    required
                    className={!user.username ? "border-amber-500/50 focus:border-amber-500" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-muted-foreground" />
                    الاسم المعروض
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="اسمك المعروض"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    هذا هو كيف ستظهر للمستخدمين الآخرين
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Gaming Profiles */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <div className="h-8 w-1 bg-gradient-orange rounded-full" />
                <h3 className="text-lg font-bold">ملفات الألعاب</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="embark_id" className="flex items-center justify-between text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                      معرف إمبارك
                    </span>
                    {!user.embark_id && (
                      <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-500">
                        ناقص
                      </Badge>
                    )}
                  </Label>
                  <Input
                    id="embark_id"
                    name="embark_id"
                    type="text"
                    placeholder="معرف إمبارك ستوديوز الخاص بك"
                    value={formData.embark_id}
                    onChange={handleChange}
                    disabled={isPending}
                    className={!user.embark_id ? "border-amber-500/50 focus:border-amber-500" : ""}
                  />
                  {!user.embark_id && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        أضف معرف إمبارك الخاص بك للوصول إلى ميزات التداول والاتصال باللاعبين الآخرين
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discord_username" className="flex items-center justify-between text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      اسم مستخدم ديسكورد
                    </span>
                    {!user.discord_username && (
                      <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-500">
                        ناقص
                      </Badge>
                    )}
                  </Label>
                  <Input
                    id="discord_username"
                    name="discord_username"
                    type="text"
                    placeholder="@اسم_المستخدم أو اسم_المستخدم#0000"
                    value={formData.discord_username}
                    onChange={handleChange}
                    disabled={isPending}
                    className={!user.discord_username ? "border-amber-500/50 focus:border-amber-500" : ""}
                  />
                  {!user.discord_username && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        اربط حساب ديسكورد الخاص بك لتلقي الإشعارات والانضمام إلى المجتمع
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={isPending}
                size="lg"
                className="flex-1 bg-gradient-orange hover:opacity-90 transition-opacity"
              >
                {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isPending}
                onClick={() => {
                  setFormData({
                    name: user.name || "",
                    username: user.username || "",
                    embark_id: user.embark_id || "",
                    discord_username: user.discord_username || "",
                  });
                  setError("");
                  setSuccess("");
                }}
                className="sm:w-32"
              >
                إعادة تعيين
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

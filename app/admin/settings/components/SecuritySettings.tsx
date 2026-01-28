"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Shield, Clock, KeyRound, Gauge } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Setting {
  id: string;
  key: string;
  value: string;
  valueType: string;
  label: string;
  labelAr: string;
  description?: string;
  descriptionAr?: string;
}

interface SecuritySettingsProps {
  settings: Setting[];
  onUpdate: () => void;
}

const settingIcons: Record<string, React.ReactNode> = {
  session_timeout_hours: <Clock className="h-5 w-5" />,
  max_login_attempts: <KeyRound className="h-5 w-5" />,
  rate_limit_requests: <Gauge className="h-5 w-5" />,
};

export function SecuritySettings({ settings, onUpdate }: SecuritySettingsProps) {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    settings.forEach((s) => {
      initial[s.key] = s.value;
    });
    return initial;
  });
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: Object.entries(values).map(([key, value]) => ({
            key,
            value,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "تم الحفظ",
          description: "تم حفظ إعدادات الأمان بنجاح",
        });
        onUpdate();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <div className="flex flex-col">
              <span>إعدادات الأمان</span>
              <span className="text-sm font-normal text-muted-foreground">
                Security Settings
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            Configure security and rate limiting settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {settings.map((setting) => {
              const icon = settingIcons[setting.key] || <Shield className="h-5 w-5" />;

              return (
                <div key={setting.key} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {icon}
                    </div>
                    <div>
                      <Label htmlFor={setting.key} className="text-base">
                        {setting.labelAr}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {setting.label}
                      </p>
                    </div>
                  </div>
                  <div className="mr-13">
                    <Input
                      id={setting.key}
                      type="number"
                      value={values[setting.key] || ""}
                      onChange={(e) =>
                        setValues({ ...values, [setting.key]: e.target.value })
                      }
                      className="max-w-[200px]"
                      min={1}
                    />
                    {setting.descriptionAr && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {setting.descriptionAr}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">ملاحظة أمنية</p>
              <p className="text-sm text-muted-foreground">
                • <strong>مهلة الجلسة:</strong> تتطلب إعادة تشغيل الخادم لتأخذ مفعولها.
              </p>
              <p className="text-sm text-muted-foreground">
                • <strong>محاولات تسجيل الدخول:</strong> يتم تفعيلها فوراً. سيتم قفل الحساب لمدة 15 دقيقة عند تجاوز الحد.
              </p>
              <p className="text-sm text-muted-foreground">
                • <strong>حد المعدل:</strong> يتم تفعيله فوراً على جميع طلبات API.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Session timeout requires server restart. Login attempts and rate limiting take effect immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>حفظ الإعدادات (Save)</span>
        </Button>
      </div>
    </div>
  );
}

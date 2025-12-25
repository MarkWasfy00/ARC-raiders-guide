"use client";

import { Button } from "@/components/ui/button";
import { logoutAction } from "../services/auth-actions";

interface UserButtonProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserButton({ user }: UserButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {user.name || user.email}
      </span>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" size="sm">
          تسجيل الخروج
        </Button>
      </form>
    </div>
  );
}

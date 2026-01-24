import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SettingsPage } from "./SettingsPage";

export default async function AdminSettingsPage() {
  const session = await auth();

  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  if (!session?.user?.role || !isStaff) {
    redirect("/login");
  }

  return <SettingsPage />;
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ActivityLogsList } from "./ActivityLogsList";

export default async function AdminActivityLogsPage() {
  const session = await auth();

  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  if (!session?.user?.role || !isStaff) {
    redirect("/login");
  }

  return <ActivityLogsList />;
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MyListings } from "@/app/features/marketplace/components/MyListings";

export default async function MyListingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      discord_username: true,
      embark_id: true,
    },
  });

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">قوائمي</h1>
          <p className="text-muted-foreground">
            إدارة جميع قوائم البيع والشراء الخاصة بك
          </p>
        </div>
        <MyListings session={session} userProfile={userProfile} />
      </div>
    </main>
  );
}

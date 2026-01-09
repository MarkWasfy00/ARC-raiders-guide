import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      username?: string | null;
      embark_id?: string | null;
      discord_username?: string | null;
      role?: 'USER' | 'ADMIN';
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    username?: string | null;
    embark_id?: string | null;
    discord_username?: string | null;
    role?: 'USER' | 'ADMIN';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string | null;
  }
}

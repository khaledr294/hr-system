import "next-auth";
import { Permission } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      roleLabel: string;
      jobTitleId: string | null;
      permissions: Permission[];
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    roleLabel: string;
    jobTitleId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    roleLabel: string;
    jobTitleId?: string | null;
    permissions: Permission[];
  }
}

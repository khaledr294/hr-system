import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { Permission } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: string;
    roleLabel: string;
    permissions: Permission[];
    jobTitleId: string | null;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      roleLabel: string;
      jobTitleId: string | null;
      permissions: Permission[];
    }
  }
  interface JWT {
    role: string;
    roleLabel: string;
    jobTitleId?: string | null;
    permissions: Permission[];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        identifier: { type: "text" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier as string },
              { name: credentials.identifier as string }
            ]
          },
          include: {
            jobTitle: true
          }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password as string, user.password);
        if (!isPasswordValid) {
          return null;
        }

        // استخدام role من قاعدة البيانات أو "USER" كقيمة افتراضية
        // إذا كان المستخدم لديه jobTitle، نستخدم role المخزن
        const jobTitleName = user.jobTitle?.name ?? "General Staff";
        const roleSlug = jobTitleName
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '') || 'GENERAL_STAFF';
        const permissions = user.jobTitle?.permissions ?? [];
        return {
          id: user.id,
          email: user.email || "",
          name: user.name,
          role: roleSlug,
          roleLabel: jobTitleName,
          jobTitleId: user.jobTitleId ?? null,
          permissions,
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions ?? [];
        token.jobTitleId = user.jobTitleId;
        token.roleLabel = user.roleLabel;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || "";
        session.user.role = token.role as string;
        session.user.roleLabel = (token.roleLabel as string) || session.user.role;
        session.user.permissions = (token.permissions as Permission[]) ?? [];
        session.user.jobTitleId = (token.jobTitleId as string | null) ?? null;
      }
      return session;
    }
  }
});

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
  }
  interface Session {
    user: User;
  }
}

const config: NextAuthConfig = {
  debug: process.env.NODE_ENV === 'development', // تشغيل debug فقط في التطوير
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  trustHost: true,
  // إصلاح مؤقت: استخدام URL ثابت بدلاً من متغير البيئة المعطل
  ...(process.env.NODE_ENV === 'production' && {
    url: "https://hr-system-ochre.vercel.app"
  }),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "اسم المستخدم أو البريد الإلكتروني", type: "text" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("🔐 NextAuth authorize called with:", { 
            identifier: credentials?.identifier,
            password: credentials?.password ? "[PROVIDED]" : "[MISSING]"
          });

          if (!credentials?.identifier || !credentials?.password) {
            console.log("❌ Missing credentials");
            return null;
          }

          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.identifier as string },
                { name: credentials.identifier as string }
              ]
            }
          });

          console.log("👤 User found:", user ? { id: user.id, name: user.name, email: user.email } : "No user found");

          if (!user || !user.password) {
            console.log("❌ No user found or no password");
            return null;
          }

          const isPasswordValid = await compare(credentials.password as string, user.password);
          console.log("🔑 Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("❌ Invalid password");
            return null;
          }

          console.log("✅ Authentication successful for user:", user.name);
          return {
            id: user.id,
            email: user.email || "",
            name: user.name,
            role: user.role || "STAFF"
          };
        } catch (error) {
          console.error("💥 Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log("🔄 NextAuth redirect:", { url, baseUrl, fullUrl: `${baseUrl}/dashboard` });
      
      // دائماً توجه إلى dashboard بعد تسجيل الدخول الناجح
      if (url === "/dashboard" || url.includes("/dashboard")) {
        return `${baseUrl}/dashboard`;
      }
      
      // إذا كان URL يبدأ بـ baseUrl، استخدمه
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // إذا كان URL محلي، أضف baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      // الافتراضي: dashboard
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        console.log("🎟️ JWT token created for:", user.name);
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        console.log("📋 Session created for:", session.user.name);
      }
      return session;
    },
  },
};

console.log("⚙️ NextAuth config initialized with NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("⚙️ NextAuth secret exists:", !!process.env.NEXTAUTH_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth(config);
export { config as authOptions };
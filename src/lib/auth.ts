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
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days - مدة أقصر للاختبار
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  // إزالة إعدادات الكوكيز المخصصة للاستخدام الافتراضي
  useSecureCookies: process.env.NODE_ENV === 'production',
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
      console.log("🔄 NextAuth redirect:", { url, baseUrl });
      
      // بعد تسجيل الدخول الناجح، توجه إلى dashboard
      if (url === baseUrl || url === `${baseUrl}/` || url === '/dashboard') {
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
    async jwt({ token, user, account }) {
      console.log("🎟️ JWT Callback - User:", !!user, "Account:", !!account);
      
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.sub = user.id; // مهم للـ JWT
        console.log("✅ JWT token populated:", { id: token.id, name: token.name, role: token.role });
      }
      
      console.log("🔄 JWT token final:", { 
        id: token.id, 
        name: token.name, 
        role: token.role,
        sub: token.sub,
        exp: token.exp 
      });
      
      return token;
    },
    async session({ session, token }) {
      console.log("📋 Session Callback - Token exists:", !!token);
      
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        console.log("✅ Session populated:", session.user);
      } else {
        console.log("❌ Session callback failed - no token or session");
      }
      
      return session;
    },
  },
};

console.log("⚙️ NextAuth config initialized with NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("⚙️ NextAuth secret exists:", !!process.env.NEXTAUTH_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth(config);
export { config as authOptions };
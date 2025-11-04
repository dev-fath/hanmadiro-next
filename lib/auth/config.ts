import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/client";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as unknown as NextAuthOptions["adapter"],
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) {
          throw new Error("이름과 비밀번호를 입력해주세요");
        }

        const user = await prisma.user.findUnique({
          where: { name: credentials.name },
        });

        if (!user) {
          throw new Error("사용자를 찾을 수 없습니다");
        }

        // 계정 잠금 확인
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("계정이 잠금되었습니다. 나중에 다시 시도해주세요");
        }

        // 비밀번호 확인
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          // 로그인 시도 횟수 증가
          const newAttempts = user.loginAttempts + 1;
          const shouldLock = newAttempts >= 5;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: newAttempts,
              lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null, // 30분 잠금
            },
          });

          throw new Error("비밀번호가 올바르지 않습니다");
        }

        // 로그인 성공 시 시도 횟수 초기화
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: 0,
            lockedUntil: null,
          },
        });

        return {
          id: user.id,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};


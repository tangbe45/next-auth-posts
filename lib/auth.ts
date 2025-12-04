import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "./prisma";
import NextAuth from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const user = await db.user.findUnique({
            where: { email: String(credentials?.email) },
          });

          if (!user || !user.password) return null;

          const valid = await bcrypt.compare(
            String(credentials.password),
            user.password
          );
          return valid ? user : null;
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error("An unknown error occurred.");
          }
        }
      },
    }),
  ],
});

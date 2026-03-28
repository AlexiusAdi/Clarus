import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import { DEFAULT_CATEGORIES } from "./constants";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/signin",
  },
  events: {
    async createUser({ user }) {
      const userId = user.id;

      if (!userId) {
        throw new Error("User ID is missing");
      }

      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          userId,
          isDefault: true,
        })),
      });
    },
  },
});

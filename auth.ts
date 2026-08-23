import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import { PlanType } from "@/lib/generated/prisma/enums";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    /**
     * Paid plans lapse at planExpiresAt.
     *
     * cron/daily persists the downgrade, but this callback is the
     * authoritative read: every isPro()/isElite() gate in the app reads
     * session.user.plan, so reporting FREE here closes paid features the
     * moment the date passes — even if the cron has not run yet, or failed.
     * The database session strategy re-reads the user row on every auth()
     * call, so there is no stale-token window either.
     */
    session({ session, user }) {
      const lapsed =
        !!user.planExpiresAt && user.planExpiresAt.getTime() <= Date.now();

      session.user.plan = lapsed ? PlanType.FREE : user.plan;
      return session;
    },
  },
});

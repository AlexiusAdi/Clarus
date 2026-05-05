import { DefaultSession, DefaultUser } from "next-auth";
import { PlanType } from "@/app/Types";

declare module "next-auth" {
  interface Session {
    user: {
      plan: PlanType;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    plan: PlanType;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    plan: PlanType;
  }
}

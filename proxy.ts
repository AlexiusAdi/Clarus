import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "./lib/prisma";

const publicRoutes = ["/", "/login"];

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const isPublicRoute = publicRoutes.includes(pathname);

  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/home", nextUrl));
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Onboarding check for logged in users
  if (isLoggedIn && !isPublicRoute) {
    const userId = req.auth?.user?.id;

    if (!userId) return NextResponse.redirect(new URL("/login", nextUrl));

    const userDetail = await prisma.userDetail.findUnique({
      where: { userId },
      select: { id: true },
    });

    const hasOnboarded = !!userDetail;

    if (!hasOnboarded && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", nextUrl));
    }

    if (hasOnboarded && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/home", nextUrl));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (user?.plan === "FREE" && pathname.startsWith("/goals")) {
      return NextResponse.redirect(new URL("/upgrade", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};

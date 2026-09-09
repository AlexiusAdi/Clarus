import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "./lib/prisma";

const publicRoutes = ["/", "/login"];

/**
 * Reachable by everyone, signed in or not, and never redirected away from.
 *
 * Distinct from publicRoutes, which bounce a signed-in visitor to /home — that
 * is right for the landing and login screens but wrong for the legal documents,
 * which an existing user has just as much reason to read as a new one. Google's
 * OAuth consent screen and Midtrans's merchant review both crawl these URLs
 * while signed out, so any redirect here fails an external review.
 */
const openRoutes = ["/terms", "/privacy"];

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  if (openRoutes.includes(pathname)) return NextResponse.next();

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

    // Goals and group expenses are both paid features, so FREE is the only
    // plan turned away from either.
    const paidOnly = ["/goals", "/groups"];
    if (
      user?.plan === "FREE" &&
      paidOnly.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/upgrade", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};

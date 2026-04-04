import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login"];

export default auth((req) => {
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

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};

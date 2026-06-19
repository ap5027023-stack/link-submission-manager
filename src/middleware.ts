import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = [
    "/",
    "/login",
    "/admin/login",
    "/api/auth/login",
    "/api/auth/admin-login",
    "/api/auth/setup",
  ];

  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    const response = NextResponse.redirect(
      new URL(
        pathname.startsWith("/admin") ? "/admin/login" : "/login",
        request.url
      )
    );
    response.cookies.delete("auth-token");
    return response;
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  // Protect user routes
  if (pathname.startsWith("/user") && payload.role === "admin") {
    return NextResponse.redirect(new URL("/admin/users", request.url));
  }

  // Protect admin API routes
  if (pathname.startsWith("/api/admin") && payload.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

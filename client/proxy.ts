import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const customerProtectedPrefixes = ["/checkout", "/favorites", "/invoices", "/orders"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const role = typeof token?.role === "string" ? token.role : null;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login?callbackUrl=/admin", request.url));
    }

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
  }

  if (customerProtectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    if (!token) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/favorites/:path*",
    "/invoices/:path*",
    "/orders/:path*",
  ],
};

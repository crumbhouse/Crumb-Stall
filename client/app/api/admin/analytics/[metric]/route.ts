import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const allowedMetrics = new Set([
  "summary",
  "revenue-trend",
  "top-foods",
  "live-queue",
  "customer-insights",
]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ metric: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Login is required." }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const { metric } = await params;

  if (!allowedMetrics.has(metric)) {
    return NextResponse.json({ message: "Analytics metric not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const response = await fetch(`${apiUrl}/analytics/${metric}?${url.searchParams.toString()}`, {
    headers: {
      "x-customer-email": session.user.email,
      ...(process.env.AUTH_SYNC_SECRET
        ? { "x-auth-sync-secret": process.env.AUTH_SYNC_SECRET }
        : {}),
    },
    cache: "no-store",
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

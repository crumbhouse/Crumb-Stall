import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const apiUrl =
  process.env.SERVER_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api/v1";

const allowedReports = new Set(["orders", "customers", "food-sales"]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Login is required." }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const { type } = await params;

  if (!allowedReports.has(type)) {
    return NextResponse.json({ message: "Report not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "xlsx";
  const response = await fetch(`${apiUrl}/reports/${encodeURIComponent(type)}.${format}`, {
    headers: {
      "x-customer-email": session.user.email,
      ...(process.env.AUTH_SYNC_SECRET
        ? { "x-auth-sync-secret": process.env.AUTH_SYNC_SECRET }
        : {}),
    },
    cache: "no-store",
  });
  const body = await response.arrayBuffer();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ??
        (format === "csv"
          ? "text/csv; charset=utf-8"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      ...(response.headers.get("content-disposition")
        ? { "Content-Disposition": response.headers.get("content-disposition")! }
        : {}),
    },
  });
}

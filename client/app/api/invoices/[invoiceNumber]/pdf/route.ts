import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const apiUrl =
  process.env.SERVER_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api/v1";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceNumber: string }> },
) {
  const session = await getServerSession(authOptions);
  const { invoiceNumber } = await params;

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Login is required." }, { status: 401 });
  }

  const response = await fetch(`${apiUrl}/invoices/${encodeURIComponent(invoiceNumber)}/pdf`, {
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
      "Content-Type": response.headers.get("content-type") ?? "application/pdf",
      "Content-Disposition":
        response.headers.get("content-disposition") ??
        `attachment; filename="${invoiceNumber}.pdf"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

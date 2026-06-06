import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const apiUrl =
  process.env.SERVER_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api/v1";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const session = await getServerSession(authOptions);
  const { orderNumber } = await params;

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Login is required to rate orders." }, { status: 401 });
  }

  const response = await fetch(`${apiUrl}/reviews/orders/${encodeURIComponent(orderNumber)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-customer-email": session.user.email,
      ...(process.env.AUTH_SYNC_SECRET
        ? { "x-auth-sync-secret": process.env.AUTH_SYNC_SECRET }
        : {}),
    },
    body: await request.text(),
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

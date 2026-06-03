import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const body = await request.text();

  const response = await fetch(`${apiUrl}/orders/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.user?.email ? { "x-customer-email": session.user.email } : {}),
      ...(process.env.AUTH_SYNC_SECRET
        ? { "x-auth-sync-secret": process.env.AUTH_SYNC_SECRET }
        : {}),
    },
    body,
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

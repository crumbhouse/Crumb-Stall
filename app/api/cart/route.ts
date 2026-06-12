import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function GET() {
  return proxyCartRequest("GET");
}

export async function PUT(request: Request) {
  return proxyCartRequest("PUT", await request.text());
}

export async function DELETE() {
  return proxyCartRequest("DELETE");
}

async function proxyCartRequest(method: "GET" | "PUT" | "DELETE", body?: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Login is required to sync cart." }, { status: 401 });
  }

  const response = await fetch(`${apiUrl}/cart`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-customer-email": session.user.email,
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

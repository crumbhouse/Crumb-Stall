import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Login is required." }, { status: 401 });
  }

  const url = new URL(request.url);
  const response = await fetch(`${apiUrl}/notifications?${url.searchParams.toString()}`, {
    headers: getAuthHeaders(session.user.email),
  });

  return proxyResponse(response);
}

export async function PATCH() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Login is required." }, { status: 401 });
  }

  const response = await fetch(`${apiUrl}/notifications/read-all`, {
    method: "PATCH",
    headers: getAuthHeaders(session.user.email),
  });

  return proxyResponse(response);
}

function getAuthHeaders(email: string) {
  return {
    "x-customer-email": email,
    ...(process.env.AUTH_SYNC_SECRET
      ? { "x-auth-sync-secret": process.env.AUTH_SYNC_SECRET }
      : {}),
  };
}

async function proxyResponse(response: Response) {
  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

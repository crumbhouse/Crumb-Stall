import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const apiUrl =
  process.env.SERVER_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api/v1";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Login is required." }, { status: 401 });
  }

  const response = await fetch(`${apiUrl}/live/customer`, {
    headers: getAuthHeaders(session.user.email),
    cache: "no-store",
  });

  if (!response.ok || !response.body) {
    return NextResponse.json(
      { message: "Live customer stream is unavailable." },
      { status: response.status || 502 },
    );
  }

  return new Response(response.body, {
    status: response.status,
    headers: getStreamHeaders(),
  });
}

function getAuthHeaders(email: string) {
  return {
    "x-customer-email": email,
    ...(process.env.AUTH_SYNC_SECRET
      ? { "x-auth-sync-secret": process.env.AUTH_SYNC_SECRET }
      : {}),
  };
}

function getStreamHeaders() {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-store",
    "X-Accel-Buffering": "no",
  };
}

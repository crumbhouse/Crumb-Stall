import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Super admin access is required." }, { status: 403 });
  }

  const response = await fetch(`${apiUrl}/auth/admin/requests`, {
    headers: {
      "x-customer-email": session.user.email,
      ...(process.env.AUTH_SYNC_SECRET
        ? { "x-auth-sync-secret": process.env.AUTH_SYNC_SECRET }
        : {}),
    },
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

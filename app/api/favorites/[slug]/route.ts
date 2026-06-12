import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return proxyFavoriteMutation(slug, "POST");
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return proxyFavoriteMutation(slug, "DELETE");
}

async function proxyFavoriteMutation(slug: string, method: "POST" | "DELETE") {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Login is required to save favorites." }, { status: 401 });
  }

  const response = await fetch(`${apiUrl}/favorites/${encodeURIComponent(slug)}`, {
    method,
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

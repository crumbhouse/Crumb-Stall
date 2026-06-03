import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const response = await fetch(`${apiUrl}/reviews/foods/${encodeURIComponent(slug)}`, {
    headers: {
      ...(session?.user?.email ? { "x-customer-email": session.user.email } : {}),
      ...(process.env.AUTH_SYNC_SECRET
        ? { "x-auth-sync-secret": process.env.AUTH_SYNC_SECRET }
        : {}),
    },
  });

  return proxyResponse(response);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Login is required to review items." }, { status: 401 });
  }

  const response = await fetch(`${apiUrl}/reviews/foods/${encodeURIComponent(slug)}`, {
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

  return proxyResponse(response);
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

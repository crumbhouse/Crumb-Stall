import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const url = new URL(request.url);

  const response = await fetch(`${apiUrl}/recommendations/foods?${url.searchParams.toString()}`, {
    headers: {
      ...(session?.user?.email ? { "x-customer-email": session.user.email } : {}),
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

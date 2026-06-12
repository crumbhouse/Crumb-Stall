import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxFileSize = 5 * 1024 * 1024;
const apiUrl =
  process.env.SERVER_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api/v1";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Login is required." }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Image file is required." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json(
      { message: "Only JPG, PNG, and WebP food images are supported." },
      { status: 400 },
    );
  }

  if (file.size > maxFileSize) {
    return NextResponse.json(
      { message: "Food image must be 5MB or smaller." },
      { status: 400 },
    );
  }

  const uploadFormData = new FormData();
  uploadFormData.set("file", file);
  const response = await fetch(`${apiUrl}/storage/admin/food-image`, {
    method: "POST",
    headers: getAuthHeaders(session.user.email),
    body: uploadFormData,
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
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

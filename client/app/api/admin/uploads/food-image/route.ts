import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxFileSize = 5 * 1024 * 1024;

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

  const extension = allowedTypes.get(file.type);

  if (!extension) {
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

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "foods");
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const filePath = path.join(uploadsDir, fileName);

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({
    imageUrl: `/uploads/foods/${fileName}`,
  });
}

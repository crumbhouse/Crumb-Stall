import { NextResponse } from "next/server";

const apiUrl =
  process.env.SERVER_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api/v1";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ scope: string; path: string[] }> },
) {
  const { scope, path } = await params;
  const objectPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  const response = await fetch(
    `${apiUrl}/storage/objects/${encodeURIComponent(scope)}/${objectPath}`,
    { cache: "no-store" },
  );

  if (!response.ok || !response.body) {
    return NextResponse.json({ message: "File not found." }, { status: response.status });
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": response.headers.get("cache-control") ?? "public, max-age=31536000, immutable",
    },
  });
}

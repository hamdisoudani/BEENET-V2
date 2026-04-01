import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  
  // Auth from Clerk Next.js SDK
  const { userId, getToken } = await auth();
  const token = await getToken();

  const upReq = new Request(`${BACKEND_URL}/api/chat/${threadId}/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: await req.text(),
    // @ts-ignore
    duplex: "half",
    redirect: "manual",
  });

  const upstream = await fetch(upReq);

  // Return streamed response directly
  const outHeaders = new Headers(upstream.headers);
  outHeaders.delete("content-encoding");
  outHeaders.delete("content-length");
  outHeaders.delete("transfer-encoding");
  
  const ct = upstream.headers.get("content-type") || "";
  if (ct.includes("text/event-stream")) {
    outHeaders.set("cache-control", "no-cache, no-transform");
    outHeaders.set("x-accel-buffering", "no");
    outHeaders.set("connection", "keep-alive");
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}

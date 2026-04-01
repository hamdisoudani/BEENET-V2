import { NextRequest } from "next/server";

/**
 * Root CopilotKit proxy — handles requests to exactly /api/copilotkit
 * Sub-paths (/info, /agent/:id/connect, etc.) are handled by [...path]/route.ts
 *
 * This file exists only because Next.js App Router catch-all segments
 * ([...path]) do NOT match the root segment itself.
 */

const BACKEND_URL =
  (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000");

const STRIP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
]);

const STRIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
]);

function buildUpstreamHeaders(req: NextRequest): HeadersInit {
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!STRIP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers[key] = value;
    }
  });
  headers["host"] = new URL(BACKEND_URL).host;
  return headers;
}

function buildDownstreamHeaders(upstream: Response): Headers {
  const out = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      out.set(key, value);
    }
  });
  const ct = upstream.headers.get("content-type") || "";
  if (ct.includes("text/event-stream")) {
    out.set("cache-control", "no-cache, no-transform");
    out.set("x-accel-buffering", "no");
    out.set("connection", "keep-alive");
  }
  return out;
}

async function proxy(req: NextRequest): Promise<Response> {
  const targetUrl = `${BACKEND_URL}/api/copilotkit${req.nextUrl.search}`;
  const hasBody = !["GET", "HEAD", "OPTIONS"].includes(req.method.toUpperCase());

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: buildUpstreamHeaders(req),
    body: hasBody ? req.body : undefined,
    // @ts-ignore
    duplex: "half",
    redirect: "manual",
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: buildDownstreamHeaders(upstream),
  });
}

export async function GET(req: NextRequest) { return proxy(req); }
export async function POST(req: NextRequest) { return proxy(req); }
export async function PUT(req: NextRequest) { return proxy(req); }
export async function DELETE(req: NextRequest) { return proxy(req); }
export async function OPTIONS(req: NextRequest) { return proxy(req); }

export const maxDuration = 300;
export const dynamic = "force-dynamic";

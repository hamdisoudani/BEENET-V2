import { NextRequest } from "next/server";

/**
 * Catch-all proxy for CopilotKit v2 AG-UI sub-path requests.
 *
 * CopilotKit v2 makes requests to:
 *   GET  /api/copilotkit/info                     — agent discovery
 *   POST /api/copilotkit/agent/:agentId/connect   — agent SSE stream
 *
 * These sub-paths have no handler if only the root route.ts exists
 * (Next.js App Router catch-all [...path] does NOT match the root segment).
 *
 * All requests are forwarded to NestJS where:
 *   1. ClerkAuthGuard verifies JWT/session
 *   2. SecretsService injects per-user model + search keys
 *   3. CopilotRuntime + LangGraphAgent bridges to langgraph dev agent
 */

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const STRIP_REQUEST_HEADERS = new Set(["host", "connection", "content-length"]);
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

async function proxy(
  req: NextRequest,
  subPath: string
): Promise<Response> {
  const targetUrl = `${BACKEND_URL}/api/copilotkit/${subPath}${req.nextUrl.search}`;
  const hasBody = !["GET", "HEAD", "OPTIONS"].includes(req.method.toUpperCase());

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: buildUpstreamHeaders(req),
    body: hasBody ? req.body : undefined,
    // @ts-ignore — Node.js fetch needs duplex for streaming bodies
    duplex: "half",
    redirect: "manual",
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: buildDownstreamHeaders(upstream),
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, (path ?? []).join("/"));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, (path ?? []).join("/"));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, (path ?? []).join("/"));
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, (path ?? []).join("/"));
}

export async function OPTIONS(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, (path ?? []).join("/"));
}

// Long-lived SSE connections during agent execution
export const maxDuration = 300;
export const dynamic = "force-dynamic";

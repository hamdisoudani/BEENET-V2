"use client";

import React from "react";
import { useParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Chat layout — wraps the CopilotKitProvider (v2) for chat routes.
 *
 * runtimeUrl points to our Next.js proxy (/api/copilotkit) which forwards to
 * NestJS. NestJS applies Clerk auth + secret injection, then bridges to the
 * LangGraph agent running with `langgraph dev`.
 *
 * threadId belongs on <CopilotChat threadId={threadId} /> in CustomChat.tsx —
 * NOT on the provider. This lets the LangGraph checkpointer own conversation
 * persistence without any manual DB writes here.
 */
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [verified, setVerified] = React.useState<boolean>(false);
  const threadId = params?.id;

  React.useEffect(() => {
    if (!threadId) {
      setLoading(false);
      return;
    }
    setVerified(true);
    setLoading(false);
  }, [threadId]);

  if (loading) {
    return (
      <div className="flex-1 min-h-0 p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!verified || !threadId) return null;

  return <>{children}</>;
}

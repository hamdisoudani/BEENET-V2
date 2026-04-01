"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useConversations } from "@/context/conversations";

type Conversation = {
  threadId: string;
  title?: string;
};

type ConversationListItemProps = {
  conversation: Conversation;
};

function ConversationActions({ threadId, onDeleted }: { threadId: string; onDeleted: () => void }) {
  const { removeByThreadId, refresh } = useConversations();
  const [busy, setBusy] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleDelete = React.useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ threadId }),
      });
      const ok = res.ok;
      if (ok) {
        removeByThreadId(threadId);
        // Refresh in background to reconcile with server
        void refresh();
        onDeleted();
      }
    } finally {
      setBusy(false);
    }
  }, [busy, threadId, onDeleted, refresh, removeByThreadId]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200" aria-label="Actions">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuItem onClick={handleDelete} disabled={busy} className="text-red-600 text-sm">
          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export const ConversationListItem = React.memo(function ConversationListItem({ conversation }: ConversationListItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const active = Boolean(pathname && pathname === `/c/${encodeURIComponent(conversation.threadId)}`);

  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            onClick={() => router.push(`/c/${encodeURIComponent(conversation.threadId)}`)}
            className={cn(
              "group relative w-full cursor-pointer transition-all duration-200",
              "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
            )}
          >
            {/* Expanded state - full text */}
            <div className={cn(
              "flex items-center justify-between gap-2 px-2.5 py-2 rounded-md group-data-[collapsible=icon]:hidden transition-colors duration-200",
              active 
                ? "bg-primary/10 text-foreground" 
                : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
            )}>
              <span className={cn(
                "flex-1 truncate text-[13px] transition-colors duration-200",
                active ? "font-medium" : "font-normal"
              )}>
                {conversation.title || conversation.threadId}
              </span>
              
              {/* Action button - appears on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                <ConversationActions threadId={conversation.threadId} onDeleted={() => {
                  try {
                    const path = pathname || '';
                    if (path.startsWith(`/c/`) && path.includes(encodeURIComponent(conversation.threadId))) {
                      router.push('/');
                    }
                  } catch {}
                }} />
              </div>
            </div>
            
            {/* Collapsed state - icon only */}
            <div className={cn(
              "hidden group-data-[collapsible=icon]:flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200",
              active ? "bg-primary/20 text-primary" : "hover:bg-muted/40 text-muted-foreground"
            )}>
              <span className={cn(
                "text-xs font-semibold",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {(conversation.title || conversation.threadId).charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          <div className="max-w-xs break-words text-xs">{conversation.title || conversation.threadId}</div>
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  );
});

"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { Moon, Sun, Plus, Settings, ArrowLeft, MoreHorizontal, Trash2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserButton, useUser } from "@clerk/nextjs";
import { useConversations } from "@/context/conversations";
import React from "react";
import { cn } from "@/lib/utils";
import { useModelStore } from "@/stores/modelStore";
import { ConversationListItem } from "./ConversationListItem";

// Component to handle auto-collapse logic (must be inside SidebarProvider)
function SidebarAutoCollapse() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return null;
}

export default function SidebarAppShell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, systemTheme } = useTheme();
  const effectiveTheme = theme === "system" ? systemTheme : theme;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { conversations, loading, refresh, loadMore, addOrPrepend } = useConversations();
  const pathname = usePathname();

  const handleNewChat = useCallback(() => {
    // Simply go to the landing/start panel; conversation will be created after user submits
    router.push("/");
  }, [router]);



  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        // bootstrap a newly created item AFTER refresh to avoid transient duplicates
        try {
          const raw = sessionStorage.getItem("beenet:new-conv");
          if (raw) {
            const extra = JSON.parse(raw);
            sessionStorage.removeItem("beenet:new-conv");
            addOrPrepend(extra);
          }
        } catch {}
      }
    })();
  }, [refresh, addOrPrepend]);

  // React to new conversation creations from anywhere in the app
  useEffect(() => {
    const onCreated = (e: Event) => {
      const anyEvt = e as CustomEvent<any>;
      const c = anyEvt?.detail;
      if (!c) return;
      try {
        addOrPrepend(c);
      } catch {}
    };
    window.addEventListener("beenet:conversation-created", onCreated as any);
    return () => window.removeEventListener("beenet:conversation-created", onCreated as any);
  }, [addOrPrepend]);

  return (
    <SidebarProvider>
      <SidebarAutoCollapse />
      <div className="flex h-dvh w-full">
        <Sidebar className="peer group/sidebar" collapsible="icon">
                     <SidebarHeader className="px-3 py-3 border-b border-border/20 bg-background group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2.5">
            <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
              <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden">
                <Link href="/" aria-label="Home" className="inline-flex items-center hover:opacity-80 transition-opacity">
                  <Image src={Logo} alt="BeeNet" width={36} height={36} priority className="rounded-lg" />
                </Link>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-foreground">BeeNet</span>
                  <span className="text-[11px] text-muted-foreground">AI Research</span>
                </div>
              </div>
              {/* Logo for collapsed state with toggle */}
              <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-2 w-full">
                <Link href="/" aria-label="Home" className="inline-flex items-center hover:opacity-80 transition-opacity">
                  <Image src={Logo} alt="BeeNet" width={28} height={28} priority className="rounded-lg" />
                </Link>
                <SidebarTrigger className="h-6 w-6 hover:bg-muted/50 transition-colors rounded-md" aria-label="Expand sidebar" />
              </div>
              <SidebarTrigger className="hidden md:inline-flex h-7 w-7 shrink-0 hover:bg-muted/50 transition-colors rounded-md group-data-[collapsible=icon]:hidden" aria-label="Toggle sidebar" />
            </div>
          </SidebarHeader>
          
          <SidebarContent className="flex flex-col flex-1 min-h-0 bg-background">
            <div className="flex-shrink-0">
              <SecretsStatusBanner />
            </div>
            {/* Conversations taking remaining space */}
                         <SidebarGroup className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between px-3 py-2.5 w-full flex-shrink-0 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:justify-center">
                <SidebarGroupLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden">
                  Chats
                </SidebarGroupLabel>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-md"
                  onClick={handleNewChat}
                  aria-label="New chat"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full [&_[data-slot=scroll-area-scrollbar]]:hidden">
                <SidebarMenu className="px-2 space-y-0.5 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:space-y-1">
                  {loading && conversations.length === 0 && (
                    <div className="space-y-2 py-2 group-data-[collapsible=icon]:space-y-1.5">
                      <Skeleton className="h-9 w-full rounded-md group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:mx-auto" />
                      <Skeleton className="h-9 w-[85%] rounded-md group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:mx-auto" />
                      <Skeleton className="h-9 w-[90%] rounded-md group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:mx-auto" />
                      <Skeleton className="h-9 w-[80%] rounded-md group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:mx-auto" />
                    </div>
                  )}
                  {!loading && conversations.length === 0 && (
                    <div className="px-2 py-8 group-data-[collapsible=icon]:hidden">
                      <div className="text-center text-sm text-muted-foreground bg-muted/20 rounded-lg py-6 px-3 border border-border/20">
                        <div className="mb-2 text-xl">💬</div>
                        <div className="font-medium mb-1 text-xs">No chats yet</div>
                        <div className="text-[11px] leading-relaxed">Start researching to begin</div>
                      </div>
                    </div>
                  )}
                  {!loading && conversations.map((c) => (
                    <ConversationListItem key={c.threadId} conversation={c} />
                  ))}
                  {/* Infinite scroll sentinel */}
                  <SidebarMenuItem>
                    <IntersectionSentinel onVisible={() => loadMore()} />
                  </SidebarMenuItem>
                </SidebarMenu>
                </ScrollArea>
              </div>
            </SidebarGroup>
            
            <div className="flex-shrink-0">
              <SidebarSeparator />
              
              {/* Navigation Links */}
              <SidebarGroup className="bg-background py-1">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="mx-2 rounded-md hover:bg-muted/50 transition-colors group-data-[collapsible=icon]:mx-0 group-data-[collapsible=icon]:justify-center">
                      <Link href="/settings" className="flex items-center gap-2.5 px-2.5 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1.5">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </div>
          </SidebarContent>
          
          <SidebarFooter className="p-3 flex-shrink-0 border-t border-border/20 bg-background group-data-[collapsible=icon]:p-2">
            <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1.5 group-data-[collapsible=icon]:flex-none">
                <UserButton />
                {!isLoaded ? (
                  <Skeleton className="h-4 w-20 rounded group-data-[collapsible=icon]:hidden" />
                ) : (
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <div className="text-sm font-medium text-foreground truncate">
                      {user?.firstName || user?.username || "User"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Free Plan
                    </div>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted/50 transition-colors rounded-md flex-shrink-0 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7"
                onClick={() => setTheme(effectiveTheme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {mounted ? (
                  effectiveTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4" />
                )}
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="border-l border-border/30">
          {/* Mobile-only top navbar: back + trigger + brand on left, profile + theme on right */}
          <div className="md:hidden flex items-center justify-between h-12 px-3 border-b border-border/30">
            <div className="flex items-center gap-1">
              {pathname?.startsWith("/c/") && (
                <Link href="/" aria-label="Back to home" className="h-8 w-8 grid place-items-center text-muted-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              )}
              <SidebarTrigger className="h-8 w-8" aria-label="Open sidebar" />
              <span className="ml-1 text-base font-semibold">BeeNet</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTheme(effectiveTheme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {mounted ? (
                  effectiveTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4" />
                )}
              </Button>
              <UserButton />
            </div>
          </div>
          <div className="flex-1 min-h-0">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
function IntersectionSentinel({ onVisible }: { onVisible: () => void }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          onVisible();
        }
      }
    }, { rootMargin: "200px" });
    obs.observe(node);
    return () => obs.disconnect();
  }, [onVisible]);
  return <div ref={ref} aria-hidden className="h-1" />;
}


function CollapsedBrandReveal() {
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = state === "collapsed";
  
  // On mobile, show a floating button to open the sidebar modal
  if (isMobile) {
    return (
      <button
        className="fixed left-4 top-4 z-50 md:hidden inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 backdrop-blur-md px-3 py-2 shadow-lg hover:shadow-xl transition-all"
        onClick={() => setOpenMobile(true)}
        aria-label="Open menu"
      >
        <Image src={Logo} alt="BeeNet" width={24} height={24} />
        <span className="text-sm font-semibold">Menu</span>
      </button>
    );
  }

  // Only show on desktop when collapsed
  if (!isCollapsed) return null;

  return (
    <div
      className="fixed left-4 top-4 z-50 hidden md:flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 backdrop-blur-md px-3 py-2 shadow-lg transition-all duration-200 ease-out"
    >
      <Link href="/" aria-label="Home" className="inline-flex items-center">
        <Image src={Logo} alt="BeeNet" width={24} height={24} />
      </Link>
      {pathname?.startsWith("/c/") && (
        <Link href="/" aria-label="Back to home" className="ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </Link>
      )}
      <SidebarTrigger className="ml-1 h-7 w-7" aria-label="Open sidebar" />
    </div>
  );
}

// MobileTrigger removed; replaced by inline mobile navbar inside SidebarInset


function SecretsStatusBanner() {
  const { ready, hasSerperKey, statusLoading, statusError, setStatus, setStatusLoading, setStatusError } = useModelStore();
  const [dismissed, setDismissed] = React.useState(false);
  const needsModel = ready === false;
  const needsSerper = hasSerperKey === false;
  const show = !statusLoading && !dismissed && (needsModel || needsSerper || statusError === true);
  if (!show) return null;
  const neutral = statusError && !(needsModel || needsSerper);
  const text = neutral
    ? "We couldn’t verify your configuration."
    : !needsModel && needsSerper
      ? "Add your Serper key to enable web search."
      : "Add a default model to start chatting.";
  return (
    <div className="px-2 mb-2" role="status" aria-live="polite">
      <div className={cn("rounded-lg border p-2 shadow-sm", neutral ? "border-amber-300/60 bg-amber-50/70 text-amber-900" : "border-destructive/40 bg-destructive/10 text-destructive") }>
        <div className="flex items-start gap-1.5">
          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-[10px] font-medium">Setup required</div>
            <div className="text-[10px] mt-0.5 break-words whitespace-normal leading-tight">{text}</div>
          </div>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1 justify-end">
          <Button asChild size="sm" variant="outline" className="h-6 px-2 text-[10px]">
            <Link href="/settings">Settings</Link>
          </Button>
          <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={async () => {
            try {
              setStatusLoading(true); setStatusError(false);
              const res = await fetch('/api/secrets/status', { method: 'GET', credentials: 'include', cache: 'no-store' });
              const data = await res.json().catch(() => ({}));
              if (res.ok) setStatus(Boolean(data?.hasModel), Boolean(data?.hasSerperKey)); else setStatusError(true);
            } catch { setStatusError(true); }
            finally { setStatusLoading(false); }
          }}>Retry</Button>
          <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => setDismissed(true)}>Dismiss</Button>
        </div>
      </div>
    </div>
  );
}



/*** @license* SPDX-License-Identifier: Apache-2.0*/
"use client";

import { useAuth } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { AlertTriangle, Send, Paperclip, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { useConversations } from "@/context/conversations";
import { useRouter } from "next/navigation";
import { usePendingTurnStore } from "@/stores/pendingTurn";
import { useModelStore } from "@/stores/modelStore";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { UseCases } from "@/components/landing/UseCases";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { motion } from "motion/react";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  return isSignedIn ? <ChatWithSidebar /> : <Landing />;
}

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <UseCases />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

function ChatWithSidebar() { return (<><StartPanel /><Toaster richColors /></>); }

function StartPanel() {
  const router = useRouter();
  const [val, setVal] = useState("");
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const { addOrPrepend } = useConversations();
  const { ready, hasSerperKey } = useModelStore();

  const onSend = async () => {
    const text = val.trim();
    if (!text) return;
    if (!ready || !hasSerperKey) {
      toast.error('Please configure a model and Serper key in Settings before starting a chat.');
      router.push('/settings');
      return;
    }
    
    if (isCreatingConversation) return;
    setIsCreatingConversation(true);
    
    try {
      const queue = usePendingTurnStore.getState();
      const res = await fetch("/api/conversations/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: text.slice(0, 120) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.threadId) {
        toast.error("Failed to create conversation");
        return;
      }
      const id: string | undefined = data?.threadId || data?.id;
      if (id) {
        try {
          const detail = {
            conversationId: data?.conversationId,
            threadId: id,
            title: text.slice(0, 120),
            lastMessageAt: new Date().toISOString(),
            messageCount: 0,
          };
          addOrPrepend(detail);
          toast.success("Conversation created");
        } catch {}
        queue.queuePendingTurn(id, {
          id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`,
          content: text,
          createdAt: Date.now(),
        });
        router.push(`/c/${id}`);
      }
    } catch (error) {
      toast.error("Failed to create conversation");
    } finally {
      setIsCreatingConversation(false);
    }
  };

  return (
    <section className="relative flex flex-col overflow-hidden h-full">
      <div className="h-full">
        <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center flex-1 justify-center max-w-4xl mx-auto w-full">
            <motion.div 
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Animated Badge */}
              <Badge variant="outline" className="rounded-full bg-muted relative gap-2.5 px-1.5 py-1">
                <span className="bg-primary text-primary-foreground flex h-5.5 items-center rounded-full px-2.5 py-0.5 text-xs">
                  🐝 Ready
                </span>
                <span className="text-muted-foreground text-sm font-normal pr-1">Start Your Research</span>
                <BorderBeam />
              </Badge>

              {/* Logo with Animation */}
              <div className="relative inline-block py-2">
                <Image 
                  src={Logo} 
                  alt="BeeNet" 
                  width={56} 
                  height={56} 
                  priority 
                  className="mx-auto animate-[beeBuzz_3s_ease-in-out_infinite]" 
                />
              </div>

              {/* Hero Text */}
              <h1 className="text-2xl font-semibold sm:text-3xl lg:text-5xl lg:leading-[1.29167] px-4">
                Research anything with AI<br />powered by your own API keys
              </h1>
              <p className="text-muted-foreground max-w-2xl text-base sm:text-lg lg:text-xl mx-auto px-4">
                Unlimited searches with custom models, enterprise security, and full cost transparency.
              </p>
            </motion.div>

            {/* Main Input Area - Inspired by Landing Page */}
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-3xl"
            >
              <div className="relative border border-border/60 rounded-xl bg-card/80 backdrop-blur-sm transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-2xl focus-within:shadow-primary/10 overflow-hidden">
                <BorderBeam />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                
                <div className="relative">
                  <textarea
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        onSend();
                      }
                    }}
                    placeholder="Ask me anything..."
                    rows={1}
                    disabled={!ready || !hasSerperKey || isCreatingConversation}
                    className="w-full resize-none bg-transparent border-0 outline-none py-5 px-5 sm:py-6 sm:px-6 text-sm md:text-base placeholder:text-muted-foreground text-foreground min-h-[100px] sm:min-h-[110px] max-h-[180px] leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      fieldSizing: 'content',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    } as any}
                  />
                  
                  <div className="flex items-center justify-between px-5 pb-5 sm:px-6 sm:pb-6">
                    <div className="flex items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                      <button 
                        type="button"
                        onClick={() => toast.info("File attachments coming soon", {
                          description: "Document upload and analysis features in development",
                          duration: 2000,
                        })}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <div className="hidden sm:flex items-center gap-1.5 text-xs">
                        <kbd className="px-1.5 py-0.5 bg-muted/60 border border-border/50 rounded text-[10px] font-medium">⌘</kbd>
                        <span className="text-muted-foreground/60">+</span>
                        <kbd className="px-1.5 py-0.5 bg-muted/60 border border-border/50 rounded text-[10px] font-medium">↵</kbd>
                        <span className="ml-1 text-muted-foreground/80">to send</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onSend}
                      disabled={!val.trim() || !ready || !hasSerperKey || isCreatingConversation}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                      aria-label="Send message"
                    >
                      {isCreatingConversation ? (
                        <>
                          <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          <span className="hidden sm:inline">Creating...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span className="hidden sm:inline">Send</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Suggestion Pills - Landing Page Style */}
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-full max-w-3xl"
            >
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {[
                  { text: "Latest AI developments", icon: Sparkles },
                  { text: "Climate change research", icon: TrendingUp }, 
                  { text: "Stock market analysis", icon: Zap }
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setVal(suggestion.text)}
                    disabled={isCreatingConversation}
                    className="group relative inline-flex items-center gap-2 px-3.5 py-2 text-sm border border-border/50 rounded-lg bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-200 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-300" />
                    <suggestion.icon className="h-3.5 w-3.5 relative z-10" />
                    <span className="relative z-10">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </motion.div>
            
            {/* Setup Alert - Landing Page Inspired */}
            {((ready === false) || (hasSerperKey === false)) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="w-full max-w-2xl"
              >
                <div className="relative border border-orange-200/60 bg-orange-50/80 dark:border-orange-800/60 dark:bg-orange-950/30 rounded-xl p-4 backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-transparent dark:from-orange-900/20 pointer-events-none" />
                  <div className="relative flex items-start gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-orange-900 dark:text-orange-200 mb-1 text-sm">
                        Setup required
                      </p>
                      <p className="text-sm text-orange-800/90 dark:text-orange-300/90 leading-relaxed">
                        Configure your API keys in{" "}
                        <Link 
                          href="/settings" 
                          className="font-medium underline decoration-orange-600/30 hover:decoration-orange-600 underline-offset-2 transition-colors"
                        >
                          Settings
                        </Link>
                        {" "}to start researching
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stats Section - Like Landing Page */}
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex w-full items-center justify-center gap-5 max-sm:flex-col sm:gap-7 pt-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-row items-center justify-center">
                  {[7, 8, 3, 6].map((i) => (
                    <div key={i} className="relative -me-3 last:me-0">
                      <span className="flex shrink-0 overflow-hidden rounded-full ring-background relative size-9 ring-2 transition-all duration-300 ease-in-out hover:z-1 hover:scale-105">
                        <img 
                          alt={`Avatar ${i}`} 
                          className="aspect-square size-full" 
                          src={`https://shadcn-nextjs-orion-landing-page.vercel.app/images/avatar/${i}.webp`} 
                        />
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-medium">12K+</span>{" "}
                  <span className="text-muted-foreground">Users</span>
                </div>
              </div>
              <div className="bg-border shrink-0 w-px h-4 max-sm:hidden" />
              <div className="flex items-center gap-3">
                <div className="flex gap-px text-primary">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className={`size-4 ${i === 5 ? "fill-muted-foreground/20 stroke-muted-foreground/10" : "fill-current"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-medium">4.5</span>{" "}
                  <span className="text-muted-foreground">Ratings</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useTransition,
  memo,
} from "react";
import { useParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
import Logo from "@/public/logo.png";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import {
  Copy,
  Check,
  Send,
  Loader2,
  FileText,
  ChevronDown,
  Search,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BorderBeam } from "@/components/ui/border-beam";
import { toast } from "sonner";
import { usePendingTurnStore } from "@/stores/pendingTurn";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Types
interface SearchResult {
  title?: string;
  link: string;
  snippet?: string;
  position?: number;
  favicon?: string;
}

interface PlanControls {
  time_range?: string;
  country?: string;
  autocorrect?: boolean;
  max_results?: number;
}

interface PlanStep {
  id: string;
  title: string;
  queries: string[];
  results: SearchResult[];
  status: "pending" | "searching" | "reading" | "completed";
  controls?: PlanControls;
  error?: { type: string; message: string };
}

interface ResearchPlan {
  mode: "direct" | "search";
  steps: PlanStep[];
  reason?: string;
  error?: { type: string; message: string };
}

// Sanitize schema — stable module-level singleton, never re-created per render
const SANITIZE_SCHEMA: any = {
  ...defaultSchema,
  attributes: {
    ...(defaultSchema as any).attributes,
    a: [...(((defaultSchema as any).attributes?.a) || []), ["className"], ["target"], ["rel"]],
    img: [...(((defaultSchema as any).attributes?.img) || []), ["className"]],
    table: [...(((defaultSchema as any).attributes?.table) || []), ["className"]],
    th: [...(((defaultSchema as any).attributes?.th) || []), ["className"]],
    td: [...(((defaultSchema as any).attributes?.td) || []), ["className"]],
    blockquote: [...(((defaultSchema as any).attributes?.blockquote) || []), ["className"]],
    code: [...(((defaultSchema as any).attributes?.code) || []), ["className"]],
  },
};

// Plugin arrays — module-level singletons so ReactMarkdown never unmounts/remounts
const REMARK_PLUGINS: any[] = [remarkGfm, remarkBreaks, remarkMath, remarkSmartypants];
const REHYPE_PLUGINS: any[] = [
  rehypeRaw,
  [rehypeSanitize, SANITIZE_SCHEMA],
  rehypeSlug,
  [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
  rehypeKatex,
];

// Markdown component map — module-level singleton, zero re-allocation on every render/token
const MD_COMPONENTS: any = {
  h1: ({ children }: any) => (
    <h1 className="mt-8 mb-4 text-2xl md:text-3xl font-bold tracking-tight text-foreground border-b border-border/30 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="mt-7 mb-3 text-xl md:text-2xl font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="mt-6 mb-2 text-lg md:text-xl font-medium text-foreground">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="mt-5 mb-2 text-base md:text-lg font-medium text-foreground">
      {children}
    </h4>
  ),
  h5: ({ children }: any) => (
    <h5 className="mt-4 mb-2 text-sm md:text-base font-medium text-foreground">
      {children}
    </h5>
  ),
  h6: ({ children }: any) => (
    <h6 className="mt-4 mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
      {children}
    </h6>
  ),
  p: ({ children }: any) => (
    <p className="my-3 leading-7 text-foreground/90">{children}</p>
  ),
  ul: ({ children }: any) => (
    <ul className="my-4 ml-6 list-disc space-y-2 marker:text-primary">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="my-4 ml-6 list-decimal space-y-2 marker:text-primary marker:font-medium">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-7 text-foreground/90 pl-1">{children}</li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="my-4 border-l-4 border-primary/40 bg-muted/30 pl-4 pr-4 py-3 italic text-foreground/80 rounded-r-md">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  ),
  a: ({ children, href, ...rest }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/40 hover:decoration-primary transition-all duration-200 font-medium"
      {...rest}
    >
      {children}
    </a>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-foreground/90">{children}</em>
  ),
  del: ({ children }: any) => (
    <del className="line-through text-muted-foreground">{children}</del>
  ),
  table: ({ children }: any) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-border/40 shadow-sm">
      <table className="w-full border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-muted/40 border-b border-border/40">{children}</thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-border/30">{children}</tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-muted/20 transition-colors duration-150">{children}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-3 text-left font-semibold text-foreground text-sm">{children}</th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-3 text-foreground/90 text-sm">{children}</td>
  ),
  pre: ({ children }: any) => (
    <div className="my-4 overflow-hidden rounded-lg border border-border/40">{children}</div>
  ),
  code: ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children ?? "").replace(/\n$/, "");
    if (!inline && match) {
      return (
        <div className="relative">
          <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border/30">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {match[1]}
            </span>
            <CopyButton text={codeString} />
          </div>
          <SyntaxHighlighter
            language={match[1]}
            style={oneDark as any}
            PreTag="div"
            customStyle={{ margin: 0, borderRadius: 0, fontSize: 13, padding: "1rem", background: "transparent" }}
            showLineNumbers={false}
            wrapLongLines
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    }
    return (
      <code className="px-1.5 py-0.5 rounded-md font-mono text-primary bg-primary/10 text-sm border border-primary/20" {...props}>
        {children}
      </code>
    );
  },
  input: ({ type, checked, ...props }: any) => {
    if (type === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="mr-2 rounded border-border/40 text-primary focus:ring-primary/20"
          {...props}
        />
      );
    }
    return <input {...props} />;
  },
};

// Main component
export default function CustomChat() {
  const params = useParams();
  const threadId = params?.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [currentPlan, setCurrentPlan] = useState<ResearchPlan | null>(null);
  const [historicalPlans, setHistoricalPlans] = useState<ResearchPlan[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const hasLoadedHistory = useRef(false);
  const { state: sidebarState } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const [, startPlanTransition] = useTransition();

  const pendingTurn = usePendingTurnStore(
    useCallback((state) => (threadId ? state.peekPendingTurn(threadId) : null), [threadId])
  );
  const consumePendingTurn = usePendingTurnStore((s) => s.consumePendingTurn);

  const { messages, status, sendMessage, setMessages } = useChat({
    id: threadId,
    transport: new DefaultChatTransport({ api: `/api/chat/${threadId}/stream` }),
    onError: useCallback((error: Error) => {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
    }, []),
    onData: useCallback((dataPart: any) => {
      if (dataPart.type === "data-plan") {
        startPlanTransition(() => setCurrentPlan(dataPart.data as ResearchPlan));
      }
    }, []),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadHistory = useCallback(async () => {
    if (!threadId || hasLoadedHistory.current) return;
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/chat/${threadId}/history`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.messages?.length > 0) {
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          parts: [{ type: "text", text: msg.content }],
          content: msg.content,
        }));
        startTransition(() => {
          setMessages(formattedMessages);
          if (data.plans?.length > 0) setHistoricalPlans(data.plans);
          if (data.plan) setCurrentPlan(data.plan);
        });
      }
      hasLoadedHistory.current = true;
    } catch {
      toast.error("Failed to load conversation history");
    } finally {
      setIsLoadingHistory(false);
    }
  }, [threadId, setMessages]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Auto-send pending turn from store
  useEffect(() => {
    if (!pendingTurn || isLoading || isLoadingHistory) return;
    const text = pendingTurn;
    consumePendingTurn(threadId);
    setCurrentPlan(null);
    sendMessage({ text });
  }, [pendingTurn, isLoading, isLoadingHistory, threadId, consumePendingTurn, sendMessage]);

  // Scroll on new messages via rAF to avoid layout thrash
  useEffect(() => {
    if (messages.length === 0) return;
    const id = requestAnimationFrame(scrollToBottom);
    return () => cancelAnimationFrame(id);
  }, [messages.length, scrollToBottom]);

  const handleSubmit = useCallback(
    (e: React.FormEvent | React.KeyboardEvent) => {
      e.preventDefault();
      if (!inputValue.trim() || isLoading) return;
      setCurrentPlan(null);
      sendMessage({ text: inputValue });
      setInputValue("");
    },
    [inputValue, isLoading, sendMessage]
  );

  // Pre-compute message->plan map once instead of recalculating inside the render loop
  const messagePlanMap = useMemo(() => {
    const map = new Map<number, ResearchPlan | null>();
    let userIdx = 0;
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role !== "user") continue;
      const isLast = !messages.slice(i + 1).some((m) => m.role === "user");
      map.set(i, isLast && currentPlan ? currentPlan : (historicalPlans[userIdx] ?? null));
      userIdx++;
    }
    return map;
  }, [messages, currentPlan, historicalPlans]);

  const lastMessageRole = messages[messages.length - 1]?.role;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-40">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading conversation...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <Image src={Logo} alt="BeeNet" width={48} height={48} className="opacity-50" />
                </div>
                <p className="text-sm text-muted-foreground">Start a conversation</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const planForMessage = messagePlanMap.get(index) ?? null;
              const nextMessage = messages[index + 1];
              const isFollowedByAssistant = nextMessage?.role === "assistant";
              return (
                <MessageRow
                  key={message.id || index}
                  message={message}
                  index={index}
                  isLastMessage={index === messages.length - 1}
                  isLoading={isLoading}
                  planForMessage={planForMessage}
                  isFollowedByAssistant={isFollowedByAssistant}
                />
              );
            })
          )}

          {isLoading && currentPlan?.mode === "search" && lastMessageRole === "user" && (
            <PlanDisplay plan={currentPlan} />
          )}

          {isLoading && lastMessageRole === "user" && !currentPlan && (
            <div className="flex items-start gap-3.5">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Image src={Logo} alt="BeeNet" width={16} height={16} />
              </div>
              <BeeLoader />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 transition-[left] duration-300 ease-linear",
          "md:left-[16rem]",
          sidebarState === "collapsed" && "md:left-[3rem]"
        )}
      >
        <div className="w-full px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="relative border border-border/60 rounded-xl bg-card/90 backdrop-blur-md transition-all duration-200 focus-within:border-border focus-within:shadow-lg focus-within:shadow-black/5 overflow-hidden">
                <BorderBeam />
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ask me anything..."
                  rows={1}
                  disabled={isLoading}
                  className="w-full resize-none bg-transparent border-0 outline-none py-4 px-6 text-xs md:text-sm placeholder:text-muted-foreground text-foreground min-h-[60px] max-h-[200px] leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fieldSizing: "content", scrollbarWidth: "none", msOverflowStyle: "none" } as any}
                />
                <div className="flex items-center justify-between px-6 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toast.info("File attachments coming soon")}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 group"
                    >
                      <svg className="h-4 w-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.49" />
                      </svg>
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl group overflow-hidden"
                    aria-label="Send message"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <Send className="h-4 w-4 relative z-10 transition-transform group-hover:scale-110 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/95 via-background/60 to-transparent backdrop-blur-sm pointer-events-none -z-10" />
      </div>
    </div>
  );
}

// MessageRow — memo so only the one changed message re-renders per streaming token
const MessageRow = memo(function MessageRow({
  message,
  index,
  isLastMessage,
  isLoading,
  planForMessage,
  isFollowedByAssistant,
}: {
  message: any;
  index: number;
  isLastMessage: boolean;
  isLoading: boolean;
  planForMessage: ResearchPlan | null;
  isFollowedByAssistant: boolean;
}) {
  if (message.role === "user") {
    return (
      <div className="space-y-5">
        <UserMessage message={message} />
        {isFollowedByAssistant && planForMessage?.mode === "search" && (
          <PlanDisplay plan={planForMessage} />
        )}
      </div>
    );
  }
  return (
    <AssistantMessage
      message={message}
      isLoading={isLoading && isLastMessage}
    />
  );
});

// UserMessage
const UserMessage = memo(function UserMessage({ message }: { message: any }) {
  const textContent = useMemo(
    () =>
      message.parts
        ?.filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("") || message.content,
    [message.parts, message.content]
  );
  return (
    <div className="flex items-start justify-end">
      <div className="max-w-[85%] rounded-xl bg-muted/40 px-5 py-3.5 border border-border/40 shadow-sm">
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90">
          {textContent}
        </p>
      </div>
    </div>
  );
});

// AssistantMessage
// Key perf wins:
//   - No motion wrappers on the message bubble — was re-triggering animations on every streaming token
//   - MD_COMPONENTS / REMARK_PLUGINS / REHYPE_PLUGINS are module-level singletons (ReactMarkdown never remounts)
//   - memo() prevents sibling messages from re-rendering while streaming
const AssistantMessage = memo(function AssistantMessage({
  message,
  isLoading,
}: {
  message: any;
  isLoading: boolean;
}) {
  const content = useMemo(
    () =>
      message.parts
        ?.filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("") || message.content || "",
    [message.parts, message.content]
  );

  const [copiedResponse, setCopiedResponse] = useState(false);
  const handleCopyResponse = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 1500);
    } catch {}
  }, []);

  if (!content && !isLoading) return null;

  return (
    <div className="flex items-start gap-3.5">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
        <Image src={Logo} alt="BeeNet" width={16} height={16} />
      </div>
      <div className="flex-1 min-w-0">
        {content && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={REMARK_PLUGINS}
              rehypePlugins={REHYPE_PLUGINS}
              components={MD_COMPONENTS}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
        {isLoading && <BeeLoader />}
        {!isLoading && content && (
          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                copiedResponse
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
              onClick={() => handleCopyResponse(content)}
            >
              {copiedResponse ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedResponse ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// BeeLoader
function BeeLoader() {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span className="relative inline-block h-4 w-4">
        <Image
          src={Logo}
          alt="BeeNet"
          fill
          className="object-contain animate-[beeBuzz_900ms_ease-in-out_infinite]"
        />
      </span>
      <span>Thinking...</span>
    </div>
  );
}

// CopyButton
const CopyButton = memo(function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }, [text]);
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors duration-200"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
});

// PlanDisplay — all framer-motion wrappers replaced with Tailwind CSS animate-in classes
const PlanDisplay = memo(function PlanDisplay({ plan }: { plan: ResearchPlan }) {
  const [visibleSteps, setVisibleSteps] = useState<Set<string>>(new Set());
  const [currentActiveStep, setCurrentActiveStep] = useState<string | null>(null);

  useEffect(() => {
    const next = new Set<string>();
    let active: string | null = null;
    for (const step of plan.steps) {
      if (step.status !== "pending") next.add(step.id);
      if (step.status === "searching" || step.status === "reading") active = step.id;
    }
    setVisibleSteps(next);
    setCurrentActiveStep(active);
  }, [plan.steps]);

  if (plan.mode === "direct") {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-lg border border-border/40 bg-card/50 p-4 text-sm shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Answering directly without search</span>
        </div>
        {plan.reason && <p className="mt-2 text-xs text-muted-foreground/80">{plan.reason}</p>}
      </div>
    );
  }

  const completedCount = plan.steps.filter((s) => s.status === "completed").length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Search className="h-4 w-4 text-primary" />
          <span>Research Plan</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>{completedCount}</span>
          </div>
          <span>/</span>
          <span>{plan.steps.length} steps</span>
        </div>
      </div>

      {plan.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {plan.error.message}
        </div>
      )}

      <div className="relative">
        {plan.steps.map((step, index) => (
          <StepDisplay
            key={step.id}
            step={step}
            index={index}
            isLast={index === plan.steps.length - 1}
            isVisible={visibleSteps.has(step.id)}
            isCurrentActive={currentActiveStep === step.id}
          />
        ))}
      </div>
    </div>
  );
});

// StepDisplay — CSS-only animations; StepIcon extracted as its own memo component
// so status icon re-renders independently without touching the rest of the step
const StepDisplay = memo(function StepDisplay({
  step,
  index,
  isLast,
  isVisible,
  isCurrentActive,
}: {
  step: PlanStep;
  index: number;
  isLast: boolean;
  isVisible: boolean;
  isCurrentActive: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isCurrentActive) {
      setIsExpanded(true);
    } else if (step.status === "completed" && !isCurrentActive) {
      const t = setTimeout(() => setIsExpanded(false), 300);
      return () => clearTimeout(t);
    }
  }, [isCurrentActive, step.status]);

  if (!isVisible) return null;

  const statusColor =
    step.status === "completed"
      ? "text-primary"
      : step.status === "searching" || step.status === "reading"
      ? "text-secondary"
      : "text-muted-foreground";

  const statusLabel =
    step.status === "completed"
      ? "Completed"
      : step.status === "searching"
      ? "Searching..."
      : step.status === "reading"
      ? "Reading..."
      : "Pending";

  return (
    <div
      className={cn(
        "relative flex gap-4 animate-in fade-in slide-in-from-left-3 duration-300 transition-colors",
        isCurrentActive && "bg-secondary/5 -mx-2 px-2 py-1 rounded-lg"
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {!isLast && (
        <div
          className={cn(
            "absolute left-3 top-8 w-0.5 h-full origin-top transition-colors duration-500",
            step.status === "completed" ? "bg-primary/40" : "bg-border/40"
          )}
        />
      )}

      <div className="relative z-10 flex-shrink-0 mt-1">
        {isCurrentActive && (
          <div className="absolute inset-0 bg-secondary/10 rounded-full blur-md scale-150" />
        )}
        <StepIcon step={step} />
      </div>

      <div className="flex-1 min-w-0 pb-6">
        <div className="cursor-pointer group" onClick={() => setIsExpanded((v) => !v)}>
          <div className="flex items-center gap-2 mb-2">
            <h4 className={`text-sm font-medium ${statusColor} transition-colors duration-200`}>
              Step {index + 1}: {step.title}
            </h4>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full transition-all duration-300",
                step.status === "completed"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : step.status === "searching" || step.status === "reading"
                  ? "bg-secondary/10 text-secondary border border-secondary/20"
                  : "bg-muted text-muted-foreground border border-border/30"
              )}
            >
              {statusLabel}
            </span>
            {(step.queries.length > 0 || step.results.length > 0) && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            )}
          </div>
          {step.queries.length > 0 && (
            <div className="text-xs text-muted-foreground mb-2">
              <span className={cn("transition-colors duration-300", isCurrentActive && "text-secondary")}>
                {step.queries.length} {step.queries.length === 1 ? "query" : "queries"}
              </span>
              {step.results.length > 0 && <span> &bull; {step.results.length} results</span>}
            </div>
          )}
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="overflow-hidden">
            <div className="space-y-3 pt-2 border-t border-border/20">
              {step.error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-2.5 text-xs text-destructive">
                  {step.error.message}
                </div>
              )}
              {step.queries.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Search Queries:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {step.queries.map((q, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center text-xs bg-muted/60 rounded-md px-2 py-1 border border-border/30"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {step.controls && (
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {step.controls.time_range && step.controls.time_range !== "any" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted/60 rounded border border-border/30 text-muted-foreground">
                      <span className="opacity-70">Time:</span>
                      <span className="font-medium">{step.controls.time_range}</span>
                    </span>
                  )}
                  {step.controls.country && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted/60 rounded border border-border/30 text-muted-foreground">
                      <span className="opacity-70">Country:</span>
                      <span className="font-medium">{step.controls.country}</span>
                    </span>
                  )}
                  {step.controls.max_results && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted/60 rounded border border-border/30 text-muted-foreground">
                      <span className="opacity-70">Max:</span>
                      <span className="font-medium">{step.controls.max_results}</span>
                    </span>
                  )}
                </div>
              )}
              {step.results.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Sources Found ({step.results.length}):
                  </div>
                  <div className="grid gap-2">
                    {step.results.slice(0, 3).map((result, i) => (
                      <a
                        key={i}
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2.5 p-2.5 rounded-md border border-border/40 bg-background/50 hover:bg-accent/30 hover:border-border/60 transition-colors"
                      >
                        {result.favicon && (
                          <img
                            src={result.favicon}
                            alt=""
                            className="w-4 h-4 mt-0.5 flex-shrink-0 rounded-sm"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-primary truncate">
                            {result.title || result.link}
                          </div>
                          {result.snippet && (
                            <div className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 leading-relaxed">
                              {result.snippet}
                            </div>
                          )}
                        </div>
                      </a>
                    ))}
                    {step.results.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{step.results.length - 3} more sources
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
});

// StepIcon — isolated memo component so only the icon re-renders on status change.
// CSS animate-spin replaces motion rotate loop.
const StepIcon = memo(function StepIcon({ step }: { step: PlanStep }) {
  if (step.status === "completed") {
    return (
      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-200">
        <Check className="h-3.5 w-3.5 text-primary-foreground" />
      </div>
    );
  }
  if (step.status === "searching" || step.status === "reading") {
    return (
      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
        <Loader2 className="h-3.5 w-3.5 text-secondary-foreground animate-spin" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 bg-background flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
    </div>
  );
});

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { TrendingUp, Headset, BellRing, RefreshCcwDot, Clipboard, FileText, FileInput, EllipsisVertical, Clock8, CirclePlay, ArrowDownUp, CircleCheck, MessageSquareText, Mail, MessageSquare, Calendar, Target, FileSpreadsheet, Workflow, Send, Loader2, AlertCircle, History, PencilLine } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "lead-qualifier", label: "Lead Qualifier", icon: TrendingUp },
  { id: "meeting-prep", label: "Meeting Prep", icon: Headset },
  { id: "follow-ups", label: "Follow-ups", icon: BellRing },
  { id: "data-sync", label: "Data Sync", icon: RefreshCcwDot },
  { id: "reporting", label: "Reporting", icon: Clipboard },
  { id: "content-drafting", label: "Content Drafting", icon: FileText },
]

export function Features() {
  const [activeTab, setActiveTab] = React.useState(TABS[0].id)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const index = TABS.findIndex((t) => t.id === prev)
        return TABS[(index + 1) % TABS.length].id
      })
    }, 15000) // Increased duration to allow full animation sequence
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="features" className="flex flex-col">
      <div className="bg-border h-px w-full" />
      <div className="relative z-1 overflow-hidden pt-8 pb-5 text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-medium tracking-wider uppercase">Features</h2>
          <p className="text-muted-foreground text-base">Boost your efficiency with an AI agent that eliminates manual work and streamlines your operations.</p>
        </div>
      </div>
      <div className="bg-border h-px w-full" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl border-x">
            <TabsList className="w-full justify-start overflow-x-auto">
              {TABS.map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="relative h-15 flex-1 rounded-none border-x border-t-0 border-b-0 data-[state=active]:bg-muted overflow-hidden"
                >
                  <tab.icon className="size-4 mr-2" /> {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="tab-progress"
                      className="bg-primary absolute inset-x-0 bottom-0 left-0 h-0.5"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 15, ease: "linear" }}
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto h-[600px] max-w-7xl border-x bg-background/50 bg-dot overflow-hidden">
            <AnimatePresence mode="wait">
              <TabsContent 
                key={activeTab}
                value={activeTab} 
                className="h-full mt-0 flex items-center justify-center p-4 sm:p-6 lg:p-8"
              >
                {/* Lead Qualifier Tab */}
                {activeTab === "lead-qualifier" && (
                  <div className="relative h-full w-full max-w-4xl flex flex-col items-center justify-center">
                    <WorkflowAnimation 
                      input={{
                        icon: Mail,
                        title: "New Lead Inquiry",
                        desc: "Automatically qualify new inbound leads from email or forms.",
                        color: "sky"
                      }}
                      actions={[
                        {
                          icon: RefreshCcwDot,
                          title: "Data Enrichment",
                          desc: "Fetching detail...",
                          subtasks: [
                            { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/02.webp", text: "Company details" },
                            { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/03.webp", text: "LinkedIn profiles" }
                          ],
                          time: "2.1 sec"
                        },
                        {
                          icon: ArrowDownUp,
                          title: "Lead Scoring",
                          desc: "Analyzing",
                          subtasks: [
                            { icon: CircleCheck, text: "ICP Match", color: "green" },
                            { icon: CircleCheck, text: "Budget Check", color: "green" },
                            { icon: CircleCheck, text: "Priority: High", color: "green" }
                          ],
                          time: "1.5 sec"
                        }
                      ]}
                      output={{
                        icon: TrendingUp,
                        title: "Qualified Lead in CRM",
                        desc: "Lead synced to Salesforce with full context and score.",
                        footer: { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/05.webp", text: "Synced to Salesforce" },
                        time: "0.5 sec"
                      }}
                    />
                  </div>
                )}

                {/* Meeting Prep Tab */}
                {activeTab === "meeting-prep" && (
                  <div className="relative h-full w-full max-w-4xl flex flex-col items-center justify-center">
                    <WorkflowAnimation 
                      input={{
                        icon: Headset,
                        title: "Upcoming Meeting",
                        desc: "Four hours before a scheduled event, the agent triggers prep mode.",
                        color: "sky",
                        time: "1:32 AM"
                      }}
                      actions={[
                        {
                          icon: TrendingUp,
                          title: "Context Gathering",
                          desc: "Fetching detail...",
                          subtasks: [
                            { icon: Mail, text: "Collect recent emails", color: "blue" },
                            { icon: MessageSquare, text: "Check participant messages", color: "green" },
                            { icon: Calendar, text: "Past meeting notes", color: "red" }
                          ],
                          time: "4 sec"
                        },
                        {
                          icon: Clipboard,
                          title: "Brief Generation",
                          desc: "Generating",
                          subtasks: [
                            { icon: CircleCheck, text: "Summaries key points", color: "green" },
                            { icon: CircleCheck, text: "Open tasks", color: "green" },
                            { icon: CircleCheck, text: "Recommended topics", color: "green" }
                          ],
                          time: "1.3 sec"
                        }
                      ]}
                      output={{
                        icon: MessageSquareText,
                        title: "Meeting Brief Document",
                        desc: "A polished meeting brief sended to the organizer.",
                        footer: { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/04.webp", text: "Attached to the calendar" },
                        time: "0.8 sec"
                      }}
                    />
                  </div>
                )}

                {/* Follow-ups Tab */}
                {activeTab === "follow-ups" && (
                  <div className="relative h-full w-full max-w-4xl flex flex-col items-center justify-center">
                    <WorkflowAnimation 
                      input={{
                        icon: BellRing,
                        title: "Trigger Event",
                        desc: "Email goes unanswered after 48 hours.",
                        color: "sky"
                      }}
                      actions={[
                        {
                          icon: Target,
                          title: "Context Reviews",
                          desc: "Checking points",
                          subtasks: [
                            { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/06.webp", text: "Checking points" },
                            { icon: Mail, text: "Preparing points from conversation", color: "red" }
                          ],
                          time: "1.6 sec"
                        },
                        {
                          icon: FileText,
                          title: "Drafting message...",
                          desc: "Concise follow-up email summarizing next actions or deliverables.",
                          time: "2.4 sec"
                        }
                      ]}
                      output={{
                        icon: Send,
                        title: "Follow-up Sent",
                        desc: "Automated follow-up delivered to the recipient.",
                        footer: { icon: Mail, text: "Sent via Gmail", color: "red" },
                        time: "0.9 sec"
                      }}
                    />
                  </div>
                )}

                {/* Data Sync Tab */}
                {activeTab === "data-sync" && (
                  <div className="relative h-full w-full">
                    <WorkflowAnimation 
                      input={{
                        icon: History,
                        title: "New Data Row",
                        desc: "Keep data consistent across spreadsheets.",
                        color: "sky",
                        time: "0.0 sec",
                        subtasks: [
                           { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/02.webp", text: "Data source" }
                        ]
                      }}
                      actions={[
                        {
                          icon: FileText,
                          title: "Schema Mapping",
                          desc: "AI matches fields between source and target systems.",
                          subtasks: [
                            { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/02.webp", text: "Data source", color: "green" },
                            { icon: Loader2, text: "Source validation...", loading: true }
                          ],
                          time: "16 sec"
                        }
                      ]}
                      output={{
                        icon: Clock8,
                        title: "Confirmation Pending",
                        desc: "Posts sync summary to Slack for any anomalies for review.",
                        badge: "Pending",
                        footer: { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/02.webp", text: "Data source", color: "green" },
                        time: "24 min"
                      }}
                    />
                  </div>
                )}

                {/* Reporting Tab */}
                {activeTab === "reporting" && (
                  <div className="relative h-full w-full max-w-4xl flex flex-col items-center justify-center">
                    <WorkflowAnimation 
                      input={{
                        icon: Calendar,
                        title: "End of Week",
                        desc: "Scheduled trigger to generate weekly performance report.",
                        color: "sky",
                        time: "Friday 5:00 PM"
                      }}
                      actions={[
                        {
                          icon: FileSpreadsheet,
                          title: "Data Aggregation",
                          desc: "Compiling metrics...",
                          subtasks: [
                            { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/02.webp", text: "Salesforce data" },
                            { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/03.webp", text: "Google Analytics" },
                            { icon: CircleCheck, text: "Clean and format", color: "green" }
                          ],
                          time: "5.2 sec"
                        },
                        {
                          icon: Clipboard,
                          title: "Insight Generation",
                          desc: "Analyzing trends",
                          subtasks: [
                            { icon: TrendingUp, text: "Revenue up 12%", color: "green" },
                            { icon: AlertCircle, text: "Traffic down 3%", color: "red" }
                          ],
                          time: "3.1 sec"
                        }
                      ]}
                      output={{
                        icon: FileText,
                        title: "Weekly Report Ready",
                        desc: "Comprehensive PDF report distributed to stakeholders.",
                        footer: { icon: Mail, text: "Sent to Leadership Team", color: "blue" },
                        time: "1.2 sec"
                      }}
                    />
                  </div>
                )}

                {/* Content Drafting Tab */}
                {activeTab === "content-drafting" && (
                  <div className="relative h-full w-full max-w-4xl flex flex-col items-center justify-center">
                    <WorkflowAnimation 
                      input={{
                        icon: PencilLine,
                        title: "New Content Request",
                        desc: "Topic: 'Future of AI in Sales' added to Notion board.",
                        color: "sky",
                        time: "10:15 AM"
                      }}
                      actions={[
                        {
                          icon: FileText,
                          title: "Research & Outline",
                          desc: "Gathering sources...",
                          subtasks: [
                            { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/06.webp", text: "Web search" },
                            { icon: CircleCheck, text: "Identify key trends", color: "green" },
                            { icon: Clipboard, text: "Create structure", color: "blue" }
                          ],
                          time: "4.8 sec"
                        },
                        {
                          icon: MessageSquareText,
                          title: "Drafting Content",
                          desc: "Writing article",
                          subtasks: [
                            { icon: CircleCheck, text: "Apply brand voice", color: "green" },
                            { icon: CircleCheck, text: "SEO optimization", color: "green" }
                          ],
                          time: "6.5 sec"
                        }
                      ]}
                      output={{
                        icon: FileText,
                        title: "Draft Completed",
                        desc: "First draft ready for human review in Google Docs.",
                        footer: { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/04.webp", text: "Saved to Google Drive" },
                        time: "0.5 sec"
                      }}
                    />
                  </div>
                )}
              </TabsContent>
            </AnimatePresence>
          </div>
        </div>
      </Tabs>
    </section>
  )
}

interface WorkflowAnimationProps {
  input: any
  actions: any[]
  output: any
}

function WorkflowAnimation({ input, actions, output }: WorkflowAnimationProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLDivElement>(null);
  const actionRef = React.useRef<HTMLDivElement>(null);
  const outputRef = React.useRef<HTMLDivElement>(null);
  
  const [coords, setCoords] = React.useState({
    path1: { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } },
    path2: { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } },
  });

  const updateCoords = React.useCallback(() => {
    if (!containerRef.current || !inputRef.current || !actionRef.current || !outputRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const inputRect = inputRef.current.getBoundingClientRect();
    const actionRect = actionRef.current.getBoundingClientRect();
    const outputRect = outputRef.current.getBoundingClientRect();

    setCoords({
      path1: {
        start: {
          x: inputRect.left - containerRect.left + inputRect.width / 2,
          y: inputRect.bottom - containerRect.top + 6 // Offset to place diamond below card
        },
        end: {
          x: actionRect.left - containerRect.left,
          y: actionRect.top - containerRect.top + actionRect.height / 2
        }
      },
      path2: {
        start: {
          x: actionRect.left - containerRect.left + actionRect.width / 2,
          y: actionRect.top - containerRect.top - 6 // Offset to place diamond above card
        },
        end: {
          x: outputRect.left - containerRect.left,
          y: outputRect.top - containerRect.top + outputRect.height / 2
        }
      }
    });
  }, []);

  React.useEffect(() => {
    // Initial update
    updateCoords();
    
    // Update after a short delay to ensure layout is settled
    const timer = setTimeout(updateCoords, 100);

    const observer = new ResizeObserver(updateCoords);
    if (containerRef.current) observer.observe(containerRef.current);
    
    window.addEventListener('resize', updateCoords);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('resize', updateCoords);
    };
  }, [updateCoords]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[550px] flex items-center justify-center">
      <div className="relative w-full max-w-5xl h-full">
        {/* Input Card - Top Left */}
        <div ref={inputRef} className="absolute top-[10%] left-[5%] z-10">
          <WorkflowCard data={input} type="input" delay={0} />
        </div>

        {/* Action Card - Bottom Center */}
        <div ref={actionRef} className="absolute bottom-[10%] left-[35%] z-10">
          <WorkflowCard data={actions[0]} type="action" delay={1.5} />
        </div>

        {/* Output Card - Top Right */}
        <div ref={outputRef} className="absolute top-[5%] right-[5%] z-10">
          <WorkflowCard data={output} type="output" delay={3} />
        </div>

        {/* Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          {/* Path 1: Input (bottom) -> Action (left) */}
          <WorkflowPath 
            start={coords.path1.start}
            end={coords.path1.end}
            type="step-down-right"
            delay={0.5}
          />
          {/* Path 2: Action (top) -> Output (left) */}
          <WorkflowPath 
            start={coords.path2.start}
            end={coords.path2.end}
            type="step-up-right"
            delay={2}
          />
        </svg>
      </div>
    </div>
  )
}

function WorkflowPath({ start, end, type, delay }: { start: { x: number, y: number }, end: { x: number, y: number }, type: 'step-down-right' | 'step-up-right', delay: number }) {
  let d = "";
  const r = 20; // Corner radius
  const cardY = type === 'step-down-right' ? start.y - 6 : start.y + 6;
  
  if (type === 'step-down-right') {
    d = `M ${start.x} ${cardY} 
         L ${start.x} ${end.y - r} 
         Q ${start.x} ${end.y} ${start.x + r} ${end.y} 
         L ${end.x} ${end.y}`;
  } else {
    d = `M ${start.x} ${cardY} 
         L ${start.x} ${end.y + r} 
         Q ${start.x} ${end.y} ${start.x + r} ${end.y} 
         L ${end.x} ${end.y}`;
  }
  
  return (
    <g className="text-primary/30">
      <motion.path 
        d={d}
        stroke="currentColor" 
        strokeWidth="2" 
        strokeDasharray="4 4"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: delay + 0.3 }}
      />
      {/* Diamond at start */}
      <motion.path 
        d={`M ${start.x-6} ${start.y} L ${start.x} ${start.y-6} L ${start.x+6} ${start.y} L ${start.x} ${start.y+6} Z`}
        fill="currentColor"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay }}
      />
      {/* Chevron at end */}
      <motion.path 
        d={`M ${end.x-8} ${end.y-6} L ${end.x} ${end.y} L ${end.x-8} ${end.y+6}`}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: delay + 1.1 }}
      />
      {/* Moving dot */}
      <motion.circle
        r="3"
        fill="currentColor"
        className="text-primary"
        initial={{ opacity: 0 }}
        animate={{ 
          offsetDistance: ["0%", "100%"],
          opacity: [0, 1, 1, 0]
        }}
        style={{ offsetPath: `path("${d}")` }}
        transition={{ 
          duration: 2, 
          delay: delay + 0.5,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 1
        }}
      />
    </g>
  );
}

function WorkflowCard({ data, type, delay, className }: { data: any, type: string, delay: number, className?: string }) {
  const color = data.color || (type === "input" ? "sky" : type === "action" ? "amber" : "green")

  const headerStyles: any = {
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    green: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  }

  const iconColorClasses: any = {
    sky: "text-sky-600 dark:text-sky-400",
    amber: "text-amber-600 dark:text-amber-400",
    green: "text-green-600 dark:text-green-400",
    blue: "text-blue-500",
    red: "text-red-500"
  }

  const iconBgClasses: any = {
    sky: "bg-sky-500/10",
    amber: "bg-amber-500/10",
    green: "bg-green-500/10",
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn("z-10 w-72 relative", className)}
    >
      {data.badge && (
        <div className="absolute -top-3 -right-3 z-20">
          <Badge variant="destructive" className="flex items-center gap-1 px-2 py-0.5 rounded-md shadow-lg">
            <AlertCircle className="size-3" />
            {data.badge}
          </Badge>
        </div>
      )}
      
      <div className={cn(
        "absolute -top-6 left-0 flex items-center gap-1.5 rounded-t-lg px-3 py-1 capitalize text-[10px] font-semibold border-t border-x bg-card",
        headerStyles[color]
      )}>
        {data.icon && React.createElement(data.icon, { className: "size-3" })}
        {type}
      </div>

      <div className="bg-card text-card-foreground flex flex-col gap-3 rounded-xl rounded-tl-none border p-4 shadow-xl relative">
        <div className="flex w-full items-center gap-2.5">
          <div className={cn("p-2 rounded-lg", iconBgClasses[color])}>
            {data.icon && React.createElement(data.icon, { className: cn("size-4", iconColorClasses[color]) })}
          </div>
          <div className="grow font-medium text-sm">{data.title}</div>
          {data.time && type === "input" ? (
            <span className="text-[10px] text-muted-foreground">{data.time}</span>
          ) : (
            <EllipsisVertical className="size-4 text-muted-foreground/50" />
          )}
        </div>
        
        {data.desc && (
          <p className="text-muted-foreground text-xs leading-relaxed">{data.desc}</p>
        )}

        {data.subtasks && (
          <div className="bg-muted/50 space-y-2 rounded-lg p-2.5 border">
            {type === "action" && (
               <div className="flex items-center justify-between mb-1">
                 <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Processing</span>
                 <span className="text-[10px] text-muted-foreground">{data.time}</span>
               </div>
            )}
            <div className="space-y-1.5">
              {data.subtasks.map((task: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {task.loading ? (
                    <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                  ) : typeof task.icon === 'string' ? (
                    <img src={task.icon} className="size-3.5 rounded-sm" alt="" referrerPolicy="no-referrer" />
                  ) : (
                    React.createElement(task.icon, { className: cn("size-3.5", iconColorClasses[task.color || color]) })
                  )}
                  {task.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.footer && (
          <div className="bg-muted/50 rounded-lg p-2.5 flex items-center gap-2 text-xs border">
            {typeof data.footer.icon === 'string' ? (
              <img src={data.footer.icon} className="size-4 rounded-sm" alt="" referrerPolicy="no-referrer" />
            ) : (
              React.createElement(data.footer.icon, { className: cn("size-4", iconColorClasses[data.footer.color || color]) })
            )}
            {data.footer.text}
          </div>
        )}

        <div className="flex justify-between items-center mt-1">
          {type === "action" ? (
            <Badge variant="outline" className="text-[10px] h-5 border-primary/30 text-primary bg-primary/5 font-normal px-2">
              GPT-4-1 Mini
            </Badge>
          ) : <div />}
          
          {data.time && type !== "input" && (
            <div className="flex items-center text-[10px] text-muted-foreground">
              <Clock8 className="size-3 mr-1" /> {data.time}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

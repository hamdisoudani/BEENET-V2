import * as React from "react"
import { Workflow, FolderSync, Pencil, ArrowUpRight, Paperclip, ChevronDown, Bot, User, Sparkles, FileText, Check, Mail, Database, MessageSquare, ArrowRight, Zap, MoreVertical, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"

const ANIMATION_STYLES = `
  @keyframes tab-progress-5s { from { width: 0 } to { width: 100% } }
  @keyframes fadeBlurIn { from { opacity: 0; transform: scale(0.95); filter: blur(4px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }
  @keyframes fadeDownIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes fadeUpIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`

export function HowItWorks() {
  const [activeStep, setActiveStep] = React.useState(0)

  const steps = [
    {
      title: "Describe your workflow",
      icon: Workflow,
      description: "Inform the agent about what you wish to automate, ranging from daily team summaries to lead follow-ups, ensuring clarity in your request."
    },
    {
      title: "Connect your tools",
      icon: FolderSync,
      description: "Link Gmail, Slack, Notion, or any app your team already uses. The agent syncs data between them and builds context automatically."
    },
    {
      title: "Review and refine",
      icon: Pencil,
      description: "Every run is transparent. Approve, edit, or rerun workflows anytime — the agent learns from feedback to perform even better next time."
    }
  ]

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <>
    <style>{ANIMATION_STYLES}</style>
    <section id="works-features" className="flex flex-col">
      <div className="bg-border h-px w-full" />
      <div className="relative z-1 overflow-hidden pt-8 pb-5 text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-medium tracking-wider uppercase">How it works</h2>
          <p className="text-muted-foreground text-base">Here’s a quick look at how the AI agent effectively operates.</p>
        </div>
      </div>
      <div className="bg-border h-px w-full" />

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl border-x">
          <div className="grid max-lg:divide-y max-lg:divide-y-reverse lg:grid-cols-2 lg:divide-x">
            <div className="grid h-full grid-rows-3 divide-y max-lg:order-2">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    "relative flex cursor-pointer flex-col gap-5 px-4 py-9 text-left transition-colors duration-300 outline-none focus-visible:z-1 focus-visible:ring-3 sm:px-6 lg:px-8",
                    activeStep === index ? "bg-muted/50" : "hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-5">
                    <span className={cn("size-5", activeStep === index ? "text-foreground" : "text-muted-foreground")}>
                      <step.icon className="size-full" />
                    </span>
                    <h3 className={cn("text-xl font-medium", activeStep === index ? "text-foreground" : "text-muted-foreground")}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                  {activeStep === index && (
                    <div 
                      key={`progress-${index}`}
                      className="bg-primary absolute inset-x-0 bottom-0 left-0 h-0.5"
                      style={{ animation: 'tab-progress-5s 5s linear forwards' }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="relative flex items-center justify-center overflow-hidden px-4 py-12 max-lg:h-120 bg-background min-h-[450px]">
                {activeStep === 0 && (
                  <div 
                    key={`step-${activeStep}`}
                    style={{ animation: 'fadeBlurIn 0.4s ease-out both' }}
                    className="relative z-1 w-full max-w-sm flex-col rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] bg-card border border-border overflow-hidden absolute"
                  >
                    <div 
                      className="bg-sky-500/10 dark:bg-sky-500/20 px-4 py-2 flex items-center justify-between text-sky-600 dark:text-sky-400 text-sm font-medium border-b border-sky-500/20"
                    >
                      Connecting tools
                      <MoreVertical className="size-4" />
                    </div>
                    
                    <div className="p-5 space-y-5">
                      <div 
                        className="text-lg font-medium leading-tight text-foreground"
                      >
                        Summarize daily team updates from Slack and email
                      </div>
                      
                      <div 
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-normal border-border shadow-sm rounded-md">
                            <Sparkles className="size-3.5 text-emerald-500" />
                            GPT-5-mini
                            <ChevronDown className="size-3 text-muted-foreground" />
                          </Button>
                          <div 
                            className="size-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center border border-rose-200 dark:border-rose-500/30"
                          >
                            <Paperclip className="size-3.5 text-rose-400" />
                          </div>
                        </div>
                        <div 
                          className="size-8 rounded-full bg-rose-400 flex items-center justify-center shadow-sm"
                        >
                          <Loader2 className="size-4 text-white" />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        {[
                          { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/03.webp", text: "1. Checking Content", delay: 0.5 },
                          { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/06.webp", text: "2. Working on insights", delay: 0.6 },
                          { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/02.webp", text: "3. Checking permissions and updates", delay: 0.7 },
                          { icon: "https://shadcn-nextjs-orion-landing-page.vercel.app/images/hero-section/04.webp", text: "4. Checking connections", delay: 0.8 }
                        ].map((item, i) => (
                          <div 
                            key={i}
                            className="flex items-center gap-3 text-sm text-muted-foreground"
                          >
                            <img src={item.icon} className="size-4" alt="" referrerPolicy="no-referrer" />
                            <span>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div 
                    key={`step-${activeStep}`}
                    style={{ animation: 'fadeBlurIn 0.4s ease-out both' }}
                    className="relative z-1 w-full max-w-md flex-col rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] bg-card border border-border p-8 absolute"
                  >
                    <div className="flex flex-col items-center justify-center gap-10 h-[280px]">
                      <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
                        {/* Center Node */}
                        <div 
                          className="absolute z-20 size-20 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center border-4 border-background"
                        >
                          <Bot className="size-10 text-primary-foreground" />
                        </div>
                        
                        {/* Orbiting Rings */}
                        <div 
                          className="absolute inset-0 rounded-full border border-dashed border-primary/30"
                        />
                        <div 
                          className="absolute inset-6 rounded-full border border-primary/20"
                        />
                        
                        {/* Tool Nodes */}
                        <div 
                          className="absolute -top-4 left-10 z-10 size-14 rounded-2xl bg-card shadow-md border border-border flex items-center justify-center"
                        >
                          <MessageSquare className="size-6 text-[#4A154B]" />
                        </div>
                        
                        <div 
                          className="absolute top-1/2 -right-4 -translate-y-1/2 z-10 size-14 rounded-2xl bg-card shadow-md border border-border flex items-center justify-center"
                        >
                          <Mail className="size-6 text-[#EA4335]" />
                        </div>
                        
                        <div 
                          className="absolute -bottom-4 left-10 z-10 size-14 rounded-2xl bg-card shadow-md border border-border flex items-center justify-center"
                        >
                          <div className="size-6 rounded bg-muted" />
                        </div>

                        {/* Connection Lines */}
                        <svg className="absolute inset-0 w-full h-full -z-10" overflow="visible">
                          <path 
                            d="M 80 30 L 140 140" 
                            stroke="currentColor"
                            className="text-primary/40"
                            strokeWidth="1.5" 
                          />
                          <path 
                            d="M 280 140 L 140 140" 
                            stroke="currentColor"
                            className="text-primary/40"
                            strokeWidth="1.5" 
                          />
                          <path 
                            d="M 80 250 L 140 140" 
                            stroke="currentColor"
                            className="text-primary/40"
                            strokeWidth="1.5" 
                          />
                          
                          {/* Data particles */}
                          <circle r="3" className="fill-primary"
                            style={{ offsetPath: 'path("M 80 30 L 140 140")' }}
                          />
                          <circle r="3" className="fill-primary"
                            style={{ offsetPath: 'path("M 280 140 L 140 140")' }}
                          />
                          <circle r="3" className="fill-primary"
                            style={{ offsetPath: 'path("M 80 250 L 140 140")' }}
                          />
                        </svg>
                      </div>
                      
                      <div 
                        className="absolute -bottom-4 flex items-center gap-2 bg-primary/10 dark:bg-primary/20 backdrop-blur-sm px-5 py-2.5 rounded-full border border-primary/30 text-sm font-medium text-foreground shadow-sm"
                      >
                        <div
                        >
                          <FolderSync className="size-4 text-primary" />
                        </div>
                        Authenticating and syncing data...
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div 
                    key={`step-${activeStep}`}
                    style={{ animation: 'fadeBlurIn 0.4s ease-out both' }}
                    className="relative z-1 w-full max-w-sm flex-col rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] bg-card border border-border overflow-hidden absolute"
                  >
                    <div 
                      className="bg-sky-500/10 dark:bg-sky-500/20 px-4 py-2 flex items-center justify-between text-sky-600 dark:text-sky-400 text-sm font-medium border-b border-sky-500/20"
                    >
                      Review Output
                      <MoreVertical className="size-4" />
                    </div>
                    
                    <div className="p-5 space-y-5">
                      <div 
                        className="text-lg font-medium leading-tight text-foreground"
                      >
                        Daily Team Summary - Approved
                      </div>
                      
                      <div 
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-normal border-border shadow-sm rounded-md">
                            <Sparkles className="size-3.5 text-emerald-500" />
                            GPT-5-mini
                            <ChevronDown className="size-3 text-muted-foreground" />
                          </Button>
                          <div 
                            className="size-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30"
                          >
                            <Check className="size-3.5 text-emerald-500" />
                          </div>
                        </div>
                        <div 
                          className="size-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm"
                        >
                          <Check className="size-4 text-white" />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        {[
                          { text: "1. Checking Content", delay: 0.7 },
                          { text: "2. Working on insights", delay: 0.8 },
                          { text: "3. Checking permissions and updates", delay: 0.9 },
                          { text: "4. Checking connections", delay: 1.0 }
                        ].map((item, i) => (
                          <div 
                            key={i}
                            className="flex items-center gap-3 text-sm text-muted-foreground"
                          >
                            <div
                            >
                              <Check className="size-4 text-emerald-500" />
                            </div>
                            <span className="line-through opacity-60">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

import * as React from "react"
import { motion } from "motion/react"
import { ArrowUpRight, DollarSign } from "lucide-react"
import { SignUpButton } from "@clerk/nextjs"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"
import { BorderBeam } from "../ui/border-beam"

export function Hero() {
  return (
    <section className="relative -mt-15.75 flex flex-col overflow-hidden pt-15.75" id="home">
      <div className="border-b px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-x px-4 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="flex flex-col items-center gap-6 text-center">
            <motion.div 
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <Badge variant="outline" className="rounded-full bg-muted relative gap-2.5 px-1.5 py-1">
                <span className="bg-primary text-primary-foreground flex h-5.5 items-center rounded-full px-2 py-0.5">🐝 New</span>
                <span className="text-muted-foreground text-sm font-normal">Unlimited AI Research</span>
                <BorderBeam />
              </Badge>
              <h1 className="text-2xl font-semibold sm:text-3xl lg:text-5xl lg:leading-[1.29167]">
                Research anything with AI<br />powered by your own API keys
              </h1>
              <p className="text-muted-foreground max-w-3xl text-xl mx-auto">
                Unlike Perplexity's limits, get unlimited searches with custom models, enterprise security, and full cost transparency.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <SignUpButton mode="modal">
                <Button size="lg" className="rounded-lg">
                  <ArrowUpRight className="size-5" />
                  Get Started Free
                </Button>
              </SignUpButton>
              <Button variant="secondary" size="lg" className="rounded-lg" asChild>
                <a href="#pricing">
                  <DollarSign className="size-5" />
                  View Pricing
                </a>
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex w-full items-center justify-center gap-4 max-sm:flex-col sm:gap-7"
          >
            <div className="flex flex-1 items-center justify-end gap-3">
              <div className="flex flex-row items-center justify-center">
                {[7, 8, 3, 6].map((i) => (
                  <div key={i} className="relative -me-3.5 last:me-0">
                    <span className="flex shrink-0 overflow-hidden rounded-full ring-background relative size-10 ring-2 transition-all duration-300 ease-in-out hover:z-1 hover:scale-105">
                      <img 
                        alt={`Avatar ${i}`} 
                        className="aspect-square size-full" 
                        src={`https://shadcn-nextjs-orion-landing-page.vercel.app/images/avatar/${i}.webp`} 
                      />
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <span className="text-lg font-medium">12K+</span> <span className="text-muted-foreground">Users</span>
              </div>
            </div>
            <div className="bg-border shrink-0 w-px h-4 max-sm:hidden" />
            <div className="flex flex-1 items-center gap-3">
              <div className="flex gap-px text-primary">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className={cn("size-5", i === 5 ? "fill-muted-foreground/20 stroke-muted-foreground/10" : "fill-current")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                  </svg>
                ))}
              </div>
              <div>
                <span className="text-lg font-medium">4.5</span> <span className="text-muted-foreground">Ratings</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

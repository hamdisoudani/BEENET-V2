import * as React from "react"
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
            <div
              className="space-y-4"
            >
              <Badge variant="outline" className="rounded-full bg-muted relative gap-2.5 px-1.5 py-1">
                <span className="bg-primary text-primary-foreground flex h-5.5 items-center rounded-full px-2 py-0.5">💝 New</span>
                <span className="text-muted-foreground text-sm font-normal">Unlimited AI Research</span>
                <BorderBeam />
              </Badge>
              <h1 className="text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl">Automate Research With AI</h1>
              <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">BEENET lets you search and explore the web like never before, with an AI agent that thinks deeply and delivers answers directly.</p>
            </div>
            <div
              className="flex items-center gap-4"
            >
              <SignUpButton>
                <Button size="lg" className="rounded-full">
                  Get Started For Free
                </Button>
              </SignUpButton>
              <Button variant="ghost" size="lg" className="rounded-full">
                Learn More <ArrowUpRight />
              </Button>
            </div>
          </div>
          <div
            className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-t-md border"
          >
            <div className="bg-muted/something flex items-center gap-2 rounded-t-md border-b px-4 py-2">
              <span className="bg-red-400 size-3 rounded-full"></span>
              <span className="bg-yellow-400 size-3 rounded-full"></span>
              <span className="bg-green-400 size-3 rounded-full"></span>
            </div>
            <img
              src="/hero-preview.png"
              alt="Hero preview"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

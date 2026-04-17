import * as React from "react"
import { BadgePercent, TrendingUp, Crown, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

export function UseCases() {
  return (
    <section id="use-cases">
      <div className="bg-border h-px w-full" />
      <div className="relative z-1 overflow-hidden pt-8 pb-5 text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-medium tracking-wider uppercase">Use Cases</h2>
          <p className="text-muted-foreground text-base">Practical ways our AI agent automates your daily tasks.</p>
        </div>
      </div>
      <div className="bg-border h-px w-full" />

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl border-x">
          <Tabs defaultValue="sales" className="w-full">
            <div className="grid lg:grid-cols-3">
              <div className="flex flex-col justify-between lg:col-span-2">
                <h2 className="px-4 py-9 text-3xl font-medium sm:px-6 md:text-4xl lg:px-8 lg:text-5xl">
                  See how we drives <span className="text-muted-foreground">success</span> for <span className="text-muted-foreground">every</span> team.
                </h2>
                <div className="bg-border h-px w-full" />
                
                <TabsContent value="sales" className="mt-0 px-4 pt-8 sm:px-6 lg:px-8 pb-8">
                  <div
                    className="space-y-4"
                  >
                    <h3 className="text-3xl font-medium">Sales Leaders use ai agent to automate and optimise sales workflows</h3>
                    <p className="text-muted-foreground text-lg">
                      This helps sales teams reduce tasks like lead qualification and follow-ups. With automated workflows, sales teams can focus on closing deals faster, prioritizing high-value prospects, and increasing conversion rates consistently.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary group">
                      Learn more <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="marketing" className="mt-0 px-4 pt-8 sm:px-6 lg:px-8 pb-8">
                  <div
                    className="space-y-4"
                  >
                    <h3 className="text-3xl font-medium">Marketing Teams automate content creation and distribution</h3>
                    <p className="text-muted-foreground text-lg">
                      From drafting social media posts to analyzing campaign performance, our AI agent handles the heavy lifting so your creative team can focus on big-picture strategy and brand growth.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary group">
                      Learn more <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="founders" className="mt-0 px-4 pt-8 sm:px-6 lg:px-8 pb-8">
                  <div
                    className="space-y-4"
                  >
                    <h3 className="text-3xl font-medium">Founders scale their operations without increasing headcount</h3>
                    <p className="text-muted-foreground text-lg">
                      Automate administrative tasks, manage investor relations, and keep your entire operation running smoothly with a 24/7 AI assistant that understands your business goals.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary group">
                      Learn more <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </TabsContent>

                <div className="bg-border h-px w-full" />
                <TabsList className="w-full justify-start h-auto bg-transparent border-t-0">
                  <TabsTrigger value="sales" className="flex-1 h-18 rounded-none border-r data-[state=active]:bg-muted data-[state=active]:text-primary gap-4">
                    <BadgePercent className="size-5" />
                    <span className="text-base lg:text-xl font-normal">Sales leader</span>
                  </TabsTrigger>
                  <TabsTrigger value="marketing" className="flex-1 h-18 rounded-none border-r data-[state=active]:bg-muted data-[state=active]:text-primary gap-4">
                    <TrendingUp className="size-5" />
                    <span className="text-base lg:text-xl font-normal">Marketing leader</span>
                  </TabsTrigger>
                  <TabsTrigger value="founders" className="flex-1 h-18 rounded-none data-[state=active]:bg-muted data-[state=active]:text-primary gap-4">
                    <Crown className="size-5" />
                    <span className="text-base lg:text-xl font-normal">Founders</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="border-l max-lg:hidden relative h-140 w-full overflow-hidden">
                <img 
                  alt="Use Case" 
                  className="size-full object-cover" 
                  src="https://shadcn-nextjs-orion-landing-page.vercel.app/images/use-cases/01.webp" 
                />
                <div className="absolute inset-x-6 bottom-6">
                  <div className="bg-card rounded-md border p-5 shadow-md">
                    <span className="line-clamp-3 text-xl font-medium italic">
                      "Our sales cycle has been cut down by 30%, thanks to the efficiency and precision provided by AI automation."
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  )
}

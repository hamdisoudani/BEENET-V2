import * as React from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"

export function Pricing() {
  const [isYearly, setIsYearly] = React.useState(false)

  const plans = [
    {
      name: "Starter",
      description: "For individuals or small teams getting started",
      price: isYearly ? "5" : "8",
      features: [
        "Up to 3 active AI agents",
        "100 automated tasks per month",
        "Workflow designer access",
        "Integration with Slack + Notion",
        "Community support",
        "1 shared workspace",
        "API access"
      ]
    },
    {
      name: "Pro",
      description: "For growing teams ready to automate deeper",
      price: isYearly ? "8" : "12",
      popular: true,
      features: [
        "Up to 15 active AI agents",
        "500 automated tasks per month",
        "Workflow designer + AI templates",
        "Integration with Slack, Notion, and GitHub",
        "Priority chat support",
        "5 team workspaces",
        "API + Webhook access"
      ]
    },
    {
      name: "Enterprise",
      description: "For large organizations needing scale & control",
      price: isYearly ? "16" : "25",
      features: [
        "Unlimited active AI agents",
        "Unlimited automated tasks",
        "Advanced workflow orchestration",
        "Integration with custom enterprise tools",
        "Dedicated success manager",
        "Unlimited workspaces",
        "Advanced security & compliance"
      ]
    }
  ]

  return (
    <section id="pricing">
      <div className="bg-border h-px w-full" />
      <div className="relative z-1 overflow-hidden pt-8 pb-5 text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-medium tracking-wider uppercase">pricing</h2>
          <p className="text-muted-foreground text-base">Flexible plans tailored to automate your workflow effortlessly.</p>
        </div>
      </div>
      <div className="bg-border h-px w-full" />

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl border-x">
          <div className="flex flex-col items-center gap-5 px-4 py-8 text-center md:py-16 lg:py-24">
            <h3 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">Plans that Scale with Your Workflow</h3>
            <p className="text-muted-foreground text-lg">Find the perfect balance of features and scalability for your workflow,<br className="hidden lg:block" /> designed to help you work smarter and grow effortlessly.</p>
            
            <div className="bg-muted inline-flex items-center gap-1 rounded-md p-1">
              <button 
                onClick={() => setIsYearly(false)}
                className={cn(
                  "flex cursor-pointer items-center gap-1 rounded-sm px-6 py-2 text-sm transition-colors",
                  !isYearly ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsYearly(true)}
                className={cn(
                  "flex cursor-pointer items-center gap-1 rounded-sm px-3 py-2 text-sm transition-colors",
                  isYearly ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Yearly <Badge variant="destructive" className="rounded-full px-2 py-0.5">Save 35%</Badge>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t">
            {plans.map((plan, index) => (
              <div key={index} className={cn(
                "flex flex-col gap-6 py-8 px-8 border-b md:border-b-0 md:border-r last:border-r-0",
                plan.popular && "bg-muted/30"
              )}>
                <div className="space-y-4 border-b pb-6">
                  <div className="space-y-2">
                    <h4 className="text-2xl font-semibold lg:text-3xl">{plan.name}</h4>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-muted-foreground text-lg font-medium">$</span>
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-lg">/month</span>
                  </div>
                  <Button 
                    variant={plan.popular ? "default" : "secondary"} 
                    size="lg" 
                    className="w-full rounded-lg"
                  >
                    Purchase plan
                  </Button>
                </div>
                <ul className="space-y-4 pt-4">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex gap-2 py-1">
                      <span className="bg-primary mt-2 size-2 shrink-0 rounded-full" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import * as React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Button } from "../ui/button"

export function FAQ() {
  const productFaqs = [
    {
      q: "What exactly is this ai agent?",
      a: "This is your personal AI productivity agent that automates repetitive tasks, efficiently manages workflows, and helps you stay organised across all your essential tools."
    },
    {
      q: "Do I need to install any software?",
      a: "No, Orion is a cloud-based platform. You can access it from any web browser on your desktop or mobile device."
    },
    {
      q: "How does this tool keep my data secure?",
      a: "We use enterprise-grade encryption and follow strict data privacy protocols. Your data is only used to power your specific workflows and is never shared."
    }
  ]

  const usageFaqs = [
    {
      q: "Can I switch plans anytime?",
      a: "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes take effect at the start of the next billing cycle."
    },
    {
      q: "What happens if I exceed my task limit?",
      a: "Once you reach your monthly limit, your automations will pause until your next billing cycle. You can upgrade anytime for more capacity."
    }
  ]

  return (
    <section id="faq">
      <div className="bg-border h-px w-full" />
      <div className="relative z-1 overflow-hidden pt-8 pb-5 text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-medium tracking-wider uppercase">FAQ</h2>
          <p className="text-muted-foreground text-base">Essential answers about using and integrating the AI agent.</p>
        </div>
      </div>
      <div className="bg-border h-px w-full" />

      <div className="border-b px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl border-x">
          <div className="flex flex-col items-center gap-5 border-b px-4 py-8 text-center md:py-16 lg:py-24">
            <h3 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">Need Help? We've Got Answers</h3>
            <p className="text-muted-foreground text-lg">Explore Our Most Commonly Asked Questions and Find the Information You Need.</p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Button size="lg" className="rounded-lg">Docs</Button>
              <Button variant="secondary" size="lg" className="rounded-lg">Contact Us</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 px-4 py-4 sm:px-8 md:py-16 lg:grid-cols-2 lg:gap-9 lg:py-24">
            <div>
              <p className="text-primary pb-2.5 text-lg font-semibold lg:text-xl">Product & Features</p>
              <Accordion type="single" collapsible className="w-full">
                {productFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`product-${index}`}>
                    <AccordionTrigger>{index + 1}. {faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div className="max-lg:mt-8">
              <p className="text-primary pb-2.5 text-lg font-semibold lg:text-xl">Plans & Usage</p>
              <Accordion type="single" collapsible className="w-full">
                {usageFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`usage-${index}`}>
                    <AccordionTrigger>{index + 1}. {faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import * as React from "react"
import { Button } from "../ui/button"
import Image from "next/image"
import Logo from "@/public/logo.png"

export function Footer() {
  return (
    <footer className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8 border-x px-4 py-8 sm:px-6 sm:py-16 md:py-24 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-5 xl:gap-24">
          <div className="col-span-1 space-y-2 lg:col-span-3">
            <h6 className="text-2xl font-semibold">Subscribe to our newsletter</h6>
            <p className="text-muted-foreground">
              Stay in the loop with the latest updates on AI research, productivity tips, and new features.
              <br className="hidden lg:block" />
              One email a week no spam, just smart insights.
            </p>
          </div>
          <div className="col-span-1 lg:col-span-2">
            <div className="flex justify-start gap-3 lg:justify-end">
              <input 
                className="flex h-10 w-full max-w-70 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Your Email" 
                type="email" 
              />
              <Button size="lg" className="rounded-lg">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-flow-row grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          <FooterColumn title="Pages" links={["Features", "Use cases", "Testimonials", "Pricing", "How It Works"]} />
          <FooterColumn title="Company" links={["About Us", "Careers", "News", "Media kit", "Contact"]} />
          <FooterColumn title="Resources" links={["Blog", "Help Center", "Tutorials", "Api Docs", "Support"]} />
          <FooterColumn title="Social" links={["X", "LinkedIn", "Facebook", "Github", "Product Hunt"]} />
          <FooterColumn title="Legal" links={["Terms of Service", "Privacy Policy", "Cookie Policy", "Licenses", "Security"]} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-x">
        <div className="bg-border h-px w-full" />
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image src={Logo} alt="BeeNet" width={32} height={32} />
            <span className="text-xl font-semibold">BeeNet</span>
          </div>
          <p className="text-muted-foreground font-light text-sm">
            ©2026 <a className="link-animated" href="#home">BeeNet</a>, Made with passion and creativity.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string, links: string[] }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-lg font-medium">{title}</div>
      <ul className="text-muted-foreground space-y-3">
        {links.map((link) => (
          <li key={link}>
            <a className="text-muted-foreground hover:text-foreground transition-colors duration-300" href="#">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

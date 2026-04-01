import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"

export function Testimonials() {
  const companies = [
    { name: "Bright Sync", logo: "01" },
    { name: "Novas Solution", logo: "02" },
    { name: "Looma Labs", logo: "03" },
    { name: "Crestline", logo: "04" },
    { name: "Cognitech Labs", logo: "05" },
    { name: "Tech Wave", logo: "06" }
  ]

  return (
    <section id="testimonials">
      <div className="bg-border h-px w-full" />
      <div className="relative z-1 overflow-hidden pt-8 pb-5 text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-medium tracking-wider uppercase">Testimonials</h2>
          <p className="text-muted-foreground text-base">Real experiences from users who automated work with AI.</p>
        </div>
      </div>
      <div className="bg-border h-px w-full" />

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center overflow-hidden border-x">
          <div className="flex w-full max-w-207.5 flex-col items-center gap-8 px-4 py-8 md:px-6 md:py-16 lg:px-8 lg:py-24">
            <h3 className="text-center text-xl font-medium md:text-3xl">
              "This is completely transformed how we manage our daily tasks. What used to take hours now happens automatically and we've never been more productive."
            </h3>
            <div className="flex items-center gap-2">
              <Avatar className="size-10">
                <AvatarImage src="https://shadcn-nextjs-orion-landing-page.vercel.app/images/avatar/1.webp" alt="Jamie Lee" />
                <AvatarFallback>JL</AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground">Jamie Lee, Operations Manager</span>
            </div>
          </div>

          <div className="w-full border-t">
            <div className="flex overflow-x-auto no-scrollbar">
              {companies.map((company, index) => (
                <div key={index} className="flex-1 min-w-[160px] border-r last:border-r-0 py-8 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                  <img 
                    alt={company.name} 
                    className="h-8 object-contain dark:invert" 
                    src={`https://shadcn-nextjs-orion-landing-page.vercel.app/images/testimonial/${company.logo}${index === 1 || index === 2 || index === 3 || index === 4 ? "-dark" : ""}.webp`} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

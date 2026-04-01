import * as React from "react"
import { MoonStar, Sun, Menu } from "lucide-react"
import { SignUpButton } from "@clerk/nextjs"
import { useTheme } from "next-themes"
import { Button } from "../ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Logo from "@/public/logo.png"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b px-4 transition-all duration-300 sm:px-6 lg:px-8 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 border-x px-4 sm:px-6 lg:px-8">
        <a href="/#home">
          <div className="flex items-center gap-3">
            <Image src={Logo} alt="BeeNet" width={32} height={32} />
            <span className="text-xl font-semibold">BeeNet</span>
          </div>
        </a>

        <nav className="hidden lg:block">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#features"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-3 py-1.5 text-base font-medium text-muted-foreground transition-colors hover:text-primary focus:text-primary outline-none"
                >
                  Features
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#how-it-works"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-3 py-1.5 text-base font-medium text-muted-foreground transition-colors hover:text-primary focus:text-primary outline-none"
                >
                  How It Works
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#use-cases"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-3 py-1.5 text-base font-medium text-muted-foreground transition-colors hover:text-primary focus:text-primary outline-none"
                >
                  Use Cases
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#testimonials"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-3 py-1.5 text-base font-medium text-muted-foreground transition-colors hover:text-primary focus:text-primary outline-none"
                >
                  Testimonials
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#pricing"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-3 py-1.5 text-base font-medium text-muted-foreground transition-colors hover:text-primary focus:text-primary outline-none"
                >
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="flex items-center gap-3">
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="size-10 relative"
            >
              <MoonStar className={cn("size-5 transition-all absolute", theme === "dark" ? "scale-0 rotate-90" : "scale-100 rotate-0")} />
              <Sun className={cn("size-5 transition-all absolute", theme === "dark" ? "scale-100 rotate-0" : "scale-0 -rotate-90")} />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          <SignUpButton mode="redirect" forceRedirectUrl="/sign-up">
            <Button size="lg">
              Sign Up
            </Button>
          </SignUpButton>

          <Button variant="secondary" size="icon" className="lg:hidden">
            <Menu className="size-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

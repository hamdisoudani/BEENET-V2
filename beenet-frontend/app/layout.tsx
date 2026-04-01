import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ConversationsProvider } from "@/context/conversations";
import SidebarAppShell from "@/components/SidebarAppShell";
import { Toaster } from "@/components/ui/sonner";
import { ClerkReady } from "@/components/ClerkReady";
import { AuthLayout } from "@/components/AuthLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BeeNet - AI Research Without Limits",
  description: "Unlike Perplexity's restrictions, BeeNet gives you unlimited research with your own API keys, custom models, and enterprise-grade security. Start free today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <AuthLayout
            signedIn={
              <ClerkReady>
                <ConversationsProvider>
                  <SidebarAppShell>{children}</SidebarAppShell>
                </ConversationsProvider>
              </ClerkReady>
            }
            signedOut={children}
          />
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}

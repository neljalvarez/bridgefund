import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: { default: "BridgeFund — Small gaps. Big futures.", template: "%s · BridgeFund" },
  description: "BridgeFund helps UAE students reach competitions, internships and university — cutting costs first, then funding only what remains.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#090E18" },
  ],
};

const themeScript = `try{if(localStorage.getItem('bf-theme')==='dark'){document.documentElement.classList.add('dark')}var st=JSON.parse(localStorage.getItem('bridgefund-state')||'null');if(st&&st.display&&st.display.locale==='ar'){document.documentElement.dir='rtl';document.documentElement.lang='ar'}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
          Skip to content
        </a>
        <StoreProvider>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}

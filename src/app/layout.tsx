import type { Metadata, Viewport } from "next";
// Self-hosted type (no external font requests): editorial serif, humanist sans, mono figures, Arabic.
import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource-variable/newsreader/opsz-italic.css";
import "@fontsource-variable/dm-sans/opsz.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-400.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-500.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-600.css";
import "@fontsource/noto-naskh-arabic/arabic-500.css";
import "@fontsource/noto-naskh-arabic/arabic-600.css";
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
    { media: "(prefers-color-scheme: light)", color: "#EDE7DA" },
    { media: "(prefers-color-scheme: dark)", color: "#242426" },
  ],
};

const themeScript = `try{if(localStorage.getItem('bf-theme')==='dark'){document.documentElement.classList.add('dark')}var st=JSON.parse(localStorage.getItem('bridgefund-state')||'null');if(st&&st.display&&st.display.locale==='ar'){document.documentElement.dir='rtl';document.documentElement.lang='ar'}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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

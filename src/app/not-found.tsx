import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Logo />
      <h1 className="mt-6 text-3xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">The page you were looking for doesn&apos;t exist. It may have been part of demo data that was reset.</p>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/demo">Launch interactive demo</Link>
        </Button>
      </div>
    </main>
  );
}

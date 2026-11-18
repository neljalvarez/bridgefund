"use client";

import "./globals.css";
import { ErrorScreen } from "@/components/shared/ErrorScreen";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ErrorScreen error={error} retry={reset} />
      </body>
    </html>
  );
}

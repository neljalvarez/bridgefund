"use client";

import { ErrorScreen } from "@/components/shared/ErrorScreen";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorScreen error={error} retry={reset} />;
}

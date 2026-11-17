"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "group rounded-xl border bg-card text-card-foreground shadow-elevated font-sans",
          description: "text-muted-foreground",
          success: "[&_[data-icon]]:text-primary",
        },
      }}
    />
  );
}

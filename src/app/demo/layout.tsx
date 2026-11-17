import type { Metadata } from "next";

export const metadata: Metadata = { title: "Judge demo mode" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

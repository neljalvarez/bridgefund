import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impact receipt" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

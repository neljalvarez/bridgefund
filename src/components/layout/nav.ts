import {
  Award,
  BookOpen,
  Building2,
  Calculator,
  CalendarDays,
  Compass,
  HandCoins,
  Inbox,
  LayoutDashboard,
  Map,
  PieChart,
  Package,
  Receipt,
  ScanLine,
  Ticket,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const ROLE_NAV: Record<Role, NavItem[]> = {
  student: [
    { href: "/student", label: "Quest journal", icon: BookOpen, description: "Your opportunities, gaps and progress" },
    { href: "/student/scanner", label: "Barrier scanner", icon: ScanLine, description: "Identify the exact costs in your way" },
    { href: "/student/calculator", label: "Cost calculator", icon: Calculator, description: "Compare the true cost of opportunities" },
    { href: "/student/engine", label: "BridgeEngine", icon: Wand2, description: "Build your personalised action plan" },
    { href: "/student/waivers", label: "Fee waivers", icon: Ticket, description: "Search waivers and reductions" },
    { href: "/student/resources", label: "Resource rescue", icon: Package, description: "Borrow instead of buying" },
    { href: "/student/requests", label: "Requests", icon: Inbox, description: "Funding requests and their status" },
    { href: "/student/calendar", label: "Deadlines", icon: CalendarDays, description: "Every deadline on one calendar" },
    { href: "/student/passport", label: "Passport", icon: Award, description: "Your opportunity passport" },
  ],
  sponsor: [
    { href: "/sponsor", label: "Verified needs", icon: Map, description: "Marketplace of verified educational needs" },
    { href: "/sponsor/allocate", label: "Smart allocation", icon: Compass, description: "Spread a budget across urgent needs" },
    { href: "/sponsor/contributions", label: "My impact", icon: Receipt, description: "Contributions and impact receipts" },
  ],
  institution: [
    { href: "/institution", label: "Verification desk", icon: LayoutDashboard, description: "Review, verify and distribute assistance" },
    { href: "/institution/heatmap", label: "Barrier heatmap", icon: PieChart, description: "Aggregated barrier analytics" },
  ],
};

export const ROLE_META: Record<Role, { label: string; persona: string; home: string; icon: LucideIcon }> = {
  student: { label: "Student", persona: "Amina · Grade 12", home: "/student", icon: BookOpen },
  sponsor: { label: "Sponsor", persona: "Juniper Demo Fund", home: "/sponsor", icon: HandCoins },
  institution: { label: "Institution", persona: "Verification desk", home: "/institution", icon: Building2 },
};

export const PUBLIC_NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/business", label: "Business model" },
  { href: "/#faq", label: "FAQ" },
];

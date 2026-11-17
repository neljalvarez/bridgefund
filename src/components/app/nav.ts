import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  Calculator,
  CalendarCheck,
  FileText,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  Package,
  PieChart,
  ScanSearch,
  ScrollText,
  Shuffle,
  Siren,
  Settings,
  Sparkles,
  Store,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const ROLE_NAV: Record<Role, { section: string; items: NavItem[] }[]> = {
  student: [
    {
      section: "Overview",
      items: [
        { href: "/student", label: "Dashboard", icon: LayoutDashboard, description: "Your opportunities, gaps and progress" },
        { href: "/student/tracker", label: "Opportunity tracker", icon: CalendarCheck, description: "Calendar, documents and reminders" },
      ],
    },
    {
      section: "Resolve barriers",
      items: [
        { href: "/student/scanner", label: "Barrier scanner", icon: ScanSearch, description: "Identify exactly what's in the way" },
        { href: "/student/engine", label: "BridgeEngine", icon: Sparkles, description: "Explainable gap resolution plan" },
        { href: "/student/requests", label: "Assistance requests", icon: FileText, description: "Submit and track requests" },
      ],
    },
    {
      section: "Tools",
      items: [
        { href: "/student/calculator", label: "Cost calculator", icon: Calculator, description: "Compare the true cost of opportunities" },
        { href: "/student/waivers", label: "Fee waiver finder", icon: Ticket, description: "Search waivers and reductions" },
        { href: "/student/resources", label: "Resource Rescue", icon: Package, description: "Borrow instead of buying" },
      ],
    },
  ],
  sponsor: [
    {
      section: "Sponsor",
      items: [
        { href: "/sponsor", label: "Dashboard", icon: LayoutDashboard, description: "Contributions and impact" },
        { href: "/sponsor/marketplace", label: "Opportunity marketplace", icon: Store, description: "Verified educational needs" },
        { href: "/sponsor/allocate", label: "Impact planner", icon: PieChart, description: "Plan a budget across verified needs" },
      ],
    },
  ],
  institution: [
    {
      section: "Institution",
      items: [
        { href: "/institution", label: "Dashboard", icon: LayoutDashboard, description: "Verification queue and funding" },
        { href: "/institution/urgent", label: "Urgent cases", icon: Siren, description: "Deadline risks, manual reviews and sponsor allocations" },
        { href: "/institution/matching", label: "Needs matching", icon: Shuffle, description: "Match student needs with resources and programmes" },
      ],
    },
    {
      section: "Operations",
      items: [
        { href: "/institution/resources", label: "Lending inventory", icon: Package, description: "Manage equipment loans" },
        { href: "/institution/analytics", label: "Barrier analytics", icon: BarChart3, description: "Aggregated insights" },
        { href: "/institution/audit", label: "Audit log", icon: ScrollText, description: "Every verification and funding action" },
      ],
    },
  ],
};

export const ACCOUNT_NAV: NavItem[] = [
  { href: "/notifications", label: "Notifications", icon: Bell, description: "All notifications" },
  { href: "/activity", label: "Activity history", icon: Activity, description: "Everything that happened in the demo" },
  { href: "/settings", label: "Settings", icon: Settings, description: "Profile and preferences" },
];

export const ROLE_META: Record<Role, { label: string; persona: string; home: string; icon: LucideIcon; description: string }> = {
  student: { label: "Student", persona: "Amina Y.", home: "/student", icon: GraduationCap, description: "Identify barriers and request assistance" },
  sponsor: { label: "Sponsor", persona: "Juniper Demo Fund", home: "/sponsor", icon: HandCoins, description: "Fund verified educational needs" },
  institution: { label: "Institution", persona: "Verification team", home: "/institution", icon: Building2, description: "Verify requests and allocate assistance" },
};

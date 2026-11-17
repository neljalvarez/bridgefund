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
  Receipt,
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

/** Five primary sections for every role. Labels inside each section adapt to the role. */
export const SECTIONS = ["Overview", "Find Assistance", "My Opportunities", "Resources", "Impact"] as const;

export const ROLE_NAV: Record<Role, { section: (typeof SECTIONS)[number]; items: NavItem[] }[]> = {
  student: [
    { section: "Overview", items: [{ href: "/student", label: "Dashboard", icon: LayoutDashboard, description: "Your gap, deadline and next step" }] },
    {
      section: "Find Assistance",
      items: [
        { href: "/student/engine", label: "Get assistance", icon: Sparkles, description: "BridgeEngine: from costs to a funded request" },
        { href: "/student/waivers", label: "Opportunities", icon: Ticket, description: "UAE competitions, internships and cost help" },
      ],
    },
    { section: "My Opportunities", items: [{ href: "/student/requests", label: "My requests", icon: FileText, description: "Track every request" }] },
    {
      section: "Resources",
      items: [
        { href: "/student/resources", label: "Borrow equipment", icon: Package, description: "Borrow instead of buying" },
        { href: "/student/calculator", label: "Cost calculator", icon: Calculator, description: "Compare the true cost of opportunities" },
      ],
    },
    { section: "Impact", items: [{ href: "/student/tracker", label: "My progress", icon: CalendarCheck, description: "Deadlines, savings and milestones" }] },
  ],
  sponsor: [
    { section: "Overview", items: [{ href: "/sponsor", label: "Dashboard", icon: LayoutDashboard, description: "Balance, needs and next step" }] },
    { section: "Find Assistance", items: [{ href: "/sponsor/marketplace", label: "Verified needs", icon: Store, description: "Needs checked by schools" }] },
    { section: "My Opportunities", items: [{ href: "/sponsor/contributions", label: "My contributions", icon: Receipt, description: "Contributions and receipts" }] },
    { section: "Resources", items: [{ href: "/sponsor/allocate", label: "Budget planner", icon: PieChart, description: "Plan a budget across verified needs" }] },
    { section: "Impact", items: [{ href: "/sponsor/impact", label: "My impact", icon: BarChart3, description: "Impact multiplier and where money went" }] },
  ],
  institution: [
    { section: "Overview", items: [{ href: "/institution", label: "Dashboard", icon: LayoutDashboard, description: "Queue, funds and next step" }] },
    {
      section: "Find Assistance",
      items: [
        { href: "/institution/matching", label: "Needs matching", icon: Shuffle, description: "Match needs with resources and programmes" },
        { href: "/institution/urgent", label: "Urgent cases", icon: Siren, description: "Deadline risks and items to review" },
      ],
    },
    { section: "My Opportunities", items: [{ href: "/institution/requests", label: "Requests", icon: FileText, description: "Verify and fund requests" }] },
    { section: "Resources", items: [{ href: "/institution/resources", label: "Lending inventory", icon: Package, description: "Manage equipment loans" }] },
    {
      section: "Impact",
      items: [
        { href: "/institution/analytics", label: "Analytics", icon: BarChart3, description: "Barriers and impact" },
        { href: "/institution/audit", label: "Audit log", icon: ScrollText, description: "Every action, recorded" },
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
  student: { label: "Student", persona: "Mariam A.", home: "/student", icon: GraduationCap, description: "Identify barriers and request assistance" },
  sponsor: { label: "Sponsor", persona: "Ghaf Community Fund", home: "/sponsor", icon: HandCoins, description: "Fund verified educational needs" },
  institution: { label: "Institution", persona: "Verification team", home: "/institution", icon: Building2, description: "Verify requests and allocate assistance" },
};

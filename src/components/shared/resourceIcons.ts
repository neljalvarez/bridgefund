import { BookOpen, Calculator, Cog, FlaskConical, GraduationCap, Laptop, Printer, type LucideIcon } from "lucide-react";
import type { ResourceType } from "@/lib/types";

export const RESOURCE_ICON: Record<ResourceType, LucideIcon> = {
  calculator: Calculator,
  laptop: Laptop,
  textbook: BookOpen,
  "lab-equipment": FlaskConical,
  engineering: Cog,
  "exam-prep": GraduationCap,
  "school-equipment": Printer,
};

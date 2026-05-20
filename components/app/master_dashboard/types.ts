import type { LucideIcon } from "lucide-react";

export type DashboardTone = "slate" | "blue" | "emerald" | "amber" | "violet" | "rose";

export type ActionItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type AiToolItem = {
  name: string;
  href: string;
  status: string;
  description: string;
};

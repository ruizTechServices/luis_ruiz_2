import type { LucideIcon } from "lucide-react";

export type DashboardTone = "slate" | "blue" | "emerald" | "amber" | "violet" | "rose";

export type MetricItem = {
  label: string;
  value: string;
  detail: string;
  tone: DashboardTone;
};

export type ActionItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type DashboardProject = {
  name: string;
  status: string;
  next: string;
};

export type DashboardLink = {
  label: string;
  href: string;
  description: string;
  external?: boolean;
};

export type DecisionItem = {
  title: string;
  status: string;
  note: string;
};

export type AiToolItem = {
  name: string;
  href: string;
  status: string;
  description: string;
};

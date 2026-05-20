import {
  Bot,
  FilePlus2,
  FolderKanban,
  Github,
  ImagePlus,
  MessageSquareText,
  Newspaper,
  Wrench,
} from "lucide-react";
import type {
  ActionItem,
  AiToolItem,
  DashboardLink,
  DashboardProject,
  DecisionItem,
  MetricItem,
} from "./types";

export const commandMetrics: MetricItem[] = [
  {
    label: "Tracked revenue",
    value: "$0",
    detail: "Placeholder until dashboard_money_entries exists",
    tone: "emerald",
  },
  {
    label: "Open opportunity value",
    value: "$0",
    detail: "Placeholder until lead values are connected",
    tone: "blue",
  },
  {
    label: "Unpaid invoices",
    value: "$0",
    detail: "Placeholder until invoicing data exists",
    tone: "amber",
  },
];

export const activeProjects: DashboardProject[] = [
  {
    name: "luis-ruiz.com Master Hub",
    status: "building",
    next: "Continue feature-spec implementation loop",
  },
  {
    name: "ruizTechServices",
    status: "active",
    next: "Clarify services and lead intake path",
  },
  {
    name: "Nucleus",
    status: "product track",
    next: "Protect API product contract while dashboard work continues",
  },
  {
    name: "24HourGPT",
    status: "paused",
    next: "Revisit positioning after master hub foundation",
  },
];

export const quickActions: ActionItem[] = [
  {
    label: "New Post",
    description: "Draft a build-log update",
    href: "/gio_dash/blog/new",
    icon: FilePlus2,
  },
  {
    label: "Projects",
    description: "Edit public project records",
    href: "/gio_dash/projects",
    icon: FolderKanban,
  },
  {
    label: "Photos",
    description: "Review media library",
    href: "/gio_dash/photos",
    icon: ImagePlus,
  },
  {
    label: "Admin Chat",
    description: "Open owner chat surface",
    href: "/gio_dash/chat",
    icon: MessageSquareText,
  },
];

export const systemLinks: DashboardLink[] = [
  {
    label: "luis-ruiz.com",
    href: "/",
    description: "Public master hub",
  },
  {
    label: "ruizTechServices",
    href: "https://ruiztechservices.com",
    description: "Business site",
    external: true,
  },
  {
    label: "Nucleus",
    href: "/api/nucleus/models",
    description: "API product model endpoint",
  },
  {
    label: "GitHub repo",
    href: "https://github.com/ruizTechServices/luis_ruiz_2",
    description: "Source repository",
    external: true,
  },
  {
    label: "Supabase",
    href: "https://supabase.com/dashboard",
    description: "Database, auth, and storage dashboard",
    external: true,
  },
  {
    label: "Vercel",
    href: "https://vercel.com/dashboard",
    description: "Deployments and production settings",
    external: true,
  },
];

export const decisions: DecisionItem[] = [
  {
    title: "Use luis-ruiz.com as the master hub",
    status: "active",
    note: "Public site in front, owner command center behind it.",
  },
  {
    title: "Keep dashboard data separate from public projects",
    status: "active",
    note: "Operational project records will come from later dashboard tables.",
  },
  {
    title: "Protect existing AI and Nucleus surfaces",
    status: "active",
    note: "Dashboard shell work should not rewrite product routes.",
  },
];

export const aiTools: AiToolItem[] = [
  {
    name: "Ollama Chat",
    href: "/ollama",
    status: "available",
    description: "Local-model chat surface with optional persistence and context.",
  },
  {
    name: "Round-Robin",
    href: "/round-robin",
    status: "available",
    description: "Multi-model discussion tool for comparing model responses.",
  },
  {
    name: "Nucleus API",
    href: "/api/nucleus/models",
    status: "protected",
    description: "Bearer-token API product with model catalog endpoints.",
  },
  {
    name: "GitHub Snapshot",
    href: "https://github.com/ruizTechServices/luis_ruiz_2/tree/GioClaw-Edit",
    status: "owner tool",
    description: "Branch and repo activity view through the legacy admin card.",
  },
];

export const contentActions = [
  {
    label: "Blog admin",
    href: "/gio_dash/blog",
    icon: Newspaper,
  },
  {
    label: "GitHub branch",
    href: "https://github.com/ruizTechServices/luis_ruiz_2/tree/GioClaw-Edit",
    icon: Github,
    external: true,
  },
  {
    label: "System health",
    href: "/api/health/deep",
    icon: Wrench,
  },
  {
    label: "AI lab",
    href: "/round-robin",
    icon: Bot,
  },
];

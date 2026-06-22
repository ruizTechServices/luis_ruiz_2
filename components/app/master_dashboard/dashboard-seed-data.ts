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
} from "./types";

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

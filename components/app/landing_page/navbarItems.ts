// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\components\app\landing_page\navbarItems.ts
export interface NavItem {
  label: string;
  href: string;
}

export const items: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Build Log', href: '/blog' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
  { label: 'Experiments', href: '/ollama' },
  { label: 'Round-Robin', href: '/round-robin' }
];

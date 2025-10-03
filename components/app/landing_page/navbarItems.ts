// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\components\app\landing_page\navbarItems.ts
export interface NavItem {
  label: string;
  href: string;
}

export const items: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Gio-Dash', href: '/gio_dash' },//<==This is supposed to be displayed only if the user is authenticated and the email is "giosterr44@gmail.com"
  { label: 'Blog', href: '/blog' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
  { label: 'Chat', href: '/ollama' },
  // { label: `${user?.name}`Dashboard', href: '/dashboard'` },//<==This is supposed to be displayed only if the user is authenticated
];

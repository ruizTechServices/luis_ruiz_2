// components/app/landing_page/skills.ts
export interface Skill {
    name: string;
    logo: string;
  }
  
  export const skills: Skill[] = [
    { name: 'Next.js', logo: 'https://nextjs.org/favicon.ico' },
    { name: 'React', logo: 'https://react.dev/favicon-32x32.png' },
    { name: 'TypeScript', logo: 'https://www.typescriptlang.org/favicon.ico' },
    { name: 'TailwindCSS', logo: 'https://tailwindcss.com/favicon.ico' },
    { name: 'ShadCN', logo: 'https://ui.shadcn.com/favicon.ico' },
    { name: 'Supabase', logo: 'https://supabase.com/dashboard/favicon/favicon-48x48.png' },
  ];
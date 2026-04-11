'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const highlights = [
  {
    title: 'ruizTechServices',
    description: 'The business layer behind the work, where software systems, client execution, and product direction come together.',
    href: 'https://ruiztechservices.com',
    cta: 'Visit business site',
  },
  {
    title: 'Projects',
    description: 'A visible record of shipped builds, technical experiments, and practical software work that proves capability.',
    href: '/projects',
    cta: 'View projects',
  },
  {
    title: 'Blog / Build Log',
    description: 'Public notes, blog posts, and project updates that show active execution instead of hiding the process.',
    href: '/blog',
    cta: 'Read blog / build log',
  },
  {
    title: 'Current Direction',
    description: 'Founder-builder work focused on AI products, local-first tooling, and practical systems meant to become real businesses.',
    href: '/contact',
    cta: 'Start a conversation',
  },
];

export function Highlights() {
  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            What this site is for
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            This is not a generic developer portfolio. It is a public gateway for founder-builder work, technical proof, and the business direction behind ruizTechServices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {highlights.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                'group relative p-6 rounded-xl transition-all duration-300',
                'bg-white dark:bg-slate-800/50',
                'border border-gray-100 dark:border-slate-700',
                'hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800',
                'hover:scale-[1.01]'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </div>
              </div>

              <div className="mt-5 text-sm font-medium text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform">
                {item.cta} →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

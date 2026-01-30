'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const highlights = [
  {
    value: '5+',
    label: 'Projects',
    description: 'Full-stack applications deployed',
    href: '/projects',
  },
  {
    value: '100%',
    label: 'Uptime',
    description: 'Reliability on deployed apps',
    href: '/projects',
  },
  {
    value: '10+',
    label: 'Clients',
    description: 'Satisfied customers served',
    href: '/contact',
  },
  {
    value: '5+ yrs',
    label: 'Experience',
    description: 'Building web solutions',
    href: '/contact',
  },
];

export function Highlights() {
  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Why Work With Me
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Delivering quality results with a focus on performance, reliability, and user experience.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {highlights.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'group relative p-6 rounded-xl transition-all duration-300',
                'bg-white dark:bg-slate-800/50',
                'border border-gray-100 dark:border-slate-700',
                'hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800',
                'hover:scale-[1.02]'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 mb-2">
                  {item.value}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {item.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </div>
              </div>
              
              {/* Hover indicator */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-violet-600 dark:text-violet-400">View →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

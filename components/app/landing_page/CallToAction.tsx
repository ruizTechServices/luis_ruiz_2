import Link from 'next/link';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

const stats = [
  { value: 'Full-stack', label: 'Web applications' },
  { value: 'AI-ready', label: 'Modern workflows' },
  { value: 'Production', label: 'Focused delivery' },
];

export default function CallToAction() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.35),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.25),transparent_30%)]" />

      <div className="relative z-10 container mx-auto px-6">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100">
                  <SparklesIcon className="h-4 w-4" />
                  Available for select projects
                </div>

                <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Let&apos;s build something fast, reliable, and maintainable.
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
                  If you need a portfolio site, a business platform, or an AI-enabled product, I can help design and ship a solution that fits the product goals and the user experience.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Button asChild size="lg" variant="cta" className="rounded-full px-7 py-6">
                    <Link href="/contact">
                      Start a conversation
                      <ArrowRightIcon className="h-5 w-5" />
                    </Link>
                  </Button>

                  <Button asChild size="lg" variant="cta-outline" className="rounded-full px-7 py-6">
                    <Link href="/projects">
                      View projects
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-slate-950/30 p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
                  >
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="mt-1 text-sm text-slate-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

const audienceSignals = [
  { value: 'Founders', label: 'People who need a builder who can turn direction into working systems' },
  { value: 'Small businesses', label: 'Operators who need clearer digital systems, not vague web help' },
  { value: 'Collaborators', label: 'Teams looking for practical technical execution with product judgment' },
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
                  Founder-builder • ruizTechServices
                </div>

                <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Need a builder for a real product, business system, or AI workflow?
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
                  luis-ruiz.com is aimed at founders, small businesses, and serious collaborators who need practical software execution, not branding theater. If the work needs product judgment, technical range, and honest iteration, this is the right intake point.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Button asChild size="lg" variant="cta" className="rounded-full px-7 py-6">
                    <Link href="/contact">
                      Start project conversation
                      <ArrowRightIcon className="h-5 w-5" />
                    </Link>
                  </Button>

                  <Button asChild size="lg" variant="cta-outline" className="rounded-full px-7 py-6">
                    <Link href="/blog">
                      Read Blog / Build Log
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {audienceSignals.map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-2xl border border-white/10 bg-slate-950/30 p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
                  >
                    <div className="text-2xl font-bold text-white">{signal.value}</div>
                    <div className="mt-1 text-sm text-slate-300">{signal.label}</div>
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

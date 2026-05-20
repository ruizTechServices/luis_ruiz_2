import React from 'react';

const Quote = () => {
  return (
    <section className="px-6">
      <blockquote className="p-6 sm:p-8 md:p-10 text-center mx-auto w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 my-8 sm:my-12 md:my-16 lg:my-20 rounded-3xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm">
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-left leading-relaxed text-slate-900 dark:text-slate-100">
          &ldquo;I treat software like a system, not a pile of features. Product direction, architecture, interfaces, tooling, and long-term maintainability all matter.&rdquo;
        </p>
        <footer className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 mt-4 text-left">
          <span className="font-semibold">Luis Ruiz</span>
        </footer>
      </blockquote>
    </section>
  );
};

export default Quote;

'use client';
import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, SparklesIcon } from '@heroicons/react/20/solid';
import { ArrowDownIcon } from '@heroicons/react/24/outline';
import NextImage from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMousePosition } from './hooks/useMousePosition';
import { useAvailability } from './hooks/useAvailability';
import { useHeroSlides } from './hooks/useHeroSlides';

export default function Hero() {
  const mousePosition = useMousePosition();
  const { isAvailable, availabilityText } = useAvailability();
  const { slides, currentSlide } = useHeroSlides();

  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<{ left: number; top: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    setIsVisible(true);

    // Generate floating particles client-side after mount to avoid SSR/client mismatch
    const count = 30;
    const generated = Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 20,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />

      {/* Dynamic mesh gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`,
        }}
      />

      {/* Floating particles (client-only after mount to prevent hydration mismatch) */}
      <div className="absolute inset-0">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          >
            <div className="h-1 w-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-60" />
          </div>
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20`} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-center">
          {/* Left Content */}
          <div className={`transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            {/* Status Badge (links to Contact when available; hidden when text says "not available") */}
            {isAvailable && !availabilityText.toLowerCase().includes('not available') ? (
              <Link href="/contact" className="inline-block">
                <div className={`inline-flex items-center gap-x-2 rounded-full px-4 py-2 backdrop-blur-md mb-8 group hover:scale-105 transition-transform cursor-pointer border
                  ${isAvailable ? 'bg-gradient-to-r from-green-400/10 to-emerald-400/10 border-green-400/20' : 'bg-gradient-to-r from-rose-400/10 to-red-400/10 border-red-400/20'}`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAvailable ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </span>
                  <span className={`text-sm font-medium ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>{availabilityText}</span>
                  <ChevronRightIcon className={`h-4 w-4 group-hover:translate-x-1 transition-transform ${isAvailable ? 'text-green-400' : 'text-red-400'}`} />
                </div>
              </Link>
            ) : null}

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
                Luis Giovanni Ruiz
              </span>
              <span className="block text-white mt-2">
                Full-Stack
                <span className="relative inline-block ml-3">
                  <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 blur-lg opacity-75 animate-pulse"></span>
                  <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                    Developer
                  </span>
                </span>
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-xl sm:text-2xl text-violet-300 font-medium mb-6">
              Building fast, scalable web experiences
            </p>

            {/* Description */}
            <p className="text-lg text-gray-300 mb-10 leading-relaxed max-w-xl">
              Crafting next-generation digital experiences with cutting-edge technologies.
              Specialized in building scalable, performant applications that push the boundaries
              of what&#39;s possible on the web.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button variant="cta" size="lg" className="px-8 py-6 text-base" asChild>
                <Link href="/contact">
                  <SparklesIcon className="h-5 w-5" />
                  Let&#39;s Connect
                </Link>
              </Button>

              <Button variant="cta-outline" size="lg" className="px-8 py-6 text-base group" asChild>
                <Link href="/projects">
                  View Projects
                  <ChevronRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className={`relative mt-16 lg:mt-0 transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
            <div className="relative mx-auto w-full max-w-lg">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur-3xl opacity-50 animate-pulse"></div>

              {/* Glass morphism card */}
              <div className="hidden md:block relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 h-20 w-20 bg-gradient-to-br from-pink-500 to-violet-500 rounded-full blur-2xl opacity-60"></div>
                <div className="absolute -bottom-4 -left-4 h-24 w-24 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-60"></div>

                {/* Profile image placeholder (slideshow) */}
                <div className="relative aspect-square rounded-2xl bg-transparent overflow-hidden group">
                  <div className="absolute inset-0">
                    {slides.map((src, idx) => (
                      <NextImage
                        key={src}
                        src={src}
                        alt={`Slideshow image ${idx + 1}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 640px"
                        className="object-cover transition-opacity duration-700 ease-in-out mix-blend-multiply"
                        style={{ opacity: idx === currentSlide ? 1 : 0 }}
                        priority={idx === 0}
                      />
                    ))}
                    {/* Gradient overlay on top */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 to-indigo-600/0 group-hover:from-violet-600/20 group-hover:to-indigo-600/20 transition-all duration-300"></div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDownIcon className="h-6 w-6 text-white/40" />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(20px) rotate(240deg); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
          from {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

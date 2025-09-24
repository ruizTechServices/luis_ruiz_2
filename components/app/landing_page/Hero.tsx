'use client';
import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, SparklesIcon, CodeBracketIcon, ServerIcon, DevicePhoneMobileIcon, CloudIcon } from '@heroicons/react/20/solid';
import { ArrowDownIcon } from '@heroicons/react/24/outline';
import NextImage from 'next/image';
import Link from 'next/link';
 

// Slideshow images from public/edited
const SLIDESHOW_IMAGES = [
  '/edited/luis-4.png',
  '/edited/luis-2.png',
  '/edited/luis-3-removebg-preview.png',
  '/edited/luis_businessman-2.png',
];
// TODO: change this to be images retrieved from Supabase and modified by the user admin dashboard

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<{ left: number; top: number; delay: number; duration: number }[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [availabilityText, setAvailabilityText] = useState<string>('Available for hire');
  // Dynamically loaded slideshow images from Supabase (fallback to static defaults)
  const [slides, setSlides] = useState<string[]>(SLIDESHOW_IMAGES);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Generate floating particles client-side after mount to avoid SSR/client mismatch
    const count = 30;
    const generated = Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 20,
    }));
    setParticles(generated);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Fetch availability settings from API (server-proxied Supabase)
  useEffect(() => {
    let active = true;
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/site_settings/availability', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to fetch settings (${res.status})`);
        const data = await res.json();
        if (!active) return;
        setAvailability(!!data.availability);
        setAvailabilityText(data.availability_text ?? 'Available for hire');
      } catch {
        // No-op: fall back to defaults
      }
    };
    fetchSettings();
    return () => { active = false };
  }, []);

  // Fetch hero slideshow images from server API (Supabase-backed)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/photos?prefix=hero&limit=10', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const urls: string[] = Array.isArray(data?.images)
          ? (data.images as Array<{ url?: string }>)
              .map((img) => img?.url ?? '')
              .filter((u): u is string => !!u)
          : [];
        if (active && urls.length > 0) {
          setSlides(urls);
          setCurrentSlide(0);
        }
      } catch {
        // ignore, fallback to static
      }
    })();
    return () => { active = false };
  }, []);

  // Rotate slideshow every 5s based on current slides length
  useEffect(() => {
    if (!slides.length) return;
    const intervalId = window.setInterval(() => {
      setCurrentSlide((idx) => (idx + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [slides]);

  const isAvailable = availability ?? true;

  const techStack = [
    { icon: CodeBracketIcon, name: 'Frontend' },
    { icon: ServerIcon, name: 'Backend' },
    { icon: CloudIcon, name: 'Cloud' },
    { icon: DevicePhoneMobileIcon, name: 'Mobile' },
  ];

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
                  <span className={`text-sm font-medium ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>{availabilityText}</span>{/* dynamic via Supabase site_settings */}
                  <ChevronRightIcon className={`h-4 w-4 group-hover:translate-x-1 transition-transform ${isAvailable ? 'text-green-400' : 'text-red-400'}`} />
                </div>
              </Link>
            ) : null}

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
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

            {/* Description */}
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Crafting next-generation digital experiences with cutting-edge technologies. 
              Specialized in building scalable, performant applications that push the boundaries 
              of what&#39;s possible on the web.
            </p>

            {/* Tech Stack Icons */}
            <div className="flex gap-4 mb-10">
              {techStack.map((tech, index) => (
                <div
                  key={tech.name}
                  className="group relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:border-white/40 transition-all hover:scale-110 cursor-pointer">
                    <tech.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mt-12">
              <Link href="/contact">
                <button className="group relative px-8 py-4 overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-2xl transition-all hover:scale-105 hover:shadow-violet-500/25">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                  <span className="relative flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5" />
                    Let&#39;s Connect
                  </span>
                </button>
              </Link> 
              
              <Link href="/projects">
                <button className="group px-8 py-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/20 text-white font-semibold transition-all hover:bg-white/10 hover:scale-105 hover:border-white/40">
                  <span className="flex items-center gap-2">
                    View Projects
                    <ChevronRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16">
              {[
                { label: 'Projects', value: '5+' },
                { label: 'Clients', value: '10+' },
                { label: 'Experience', value: '4+ yrs' },
              ].map((stat, index) => (
                <div 
                  key={stat.label}
                  className="text-center opacity-0 animate-fadeInUp"
                  style={{ animationDelay: `${0.5 + index * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
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

                {/* Floating badges */}
                <div className={`absolute -top-3 -right-3 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce 
                  ${isAvailable ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-rose-400 to-red-400'}`}>
                  {/* dynamic via Supabase site_settings */}
                  {isAvailable ? 'AVAILABLE' : 'BOOKED'}
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
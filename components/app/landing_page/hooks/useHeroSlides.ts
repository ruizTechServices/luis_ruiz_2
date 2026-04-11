import { useState, useEffect } from 'react';

const STATIC_IMAGES = [
  '/edited/luis-4.png',
  '/edited/luis-2.png',
  '/edited/luis-3-removebg-preview.png',
  '/edited/luis_businessman-2.png',
];

type PhotoApiImage = {
  url?: string;
  path?: string;
};

function looksUsable(url: string) {
  return /^https?:\/\//.test(url) || url.startsWith('/');
}

export function useHeroSlides() {
  const [slides, setSlides] = useState<string[]>(STATIC_IMAGES);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch('/api/photos?prefix=hero&limit=10', { cache: 'no-store' });
        if (!res.ok) return;

        const data = await res.json();
        const urls: string[] = Array.isArray(data?.images)
          ? (data.images as PhotoApiImage[])
              .map((img) => img?.url ?? '')
              .filter((u): u is string => !!u && looksUsable(u))
          : [];

        if (active && urls.length > 0) {
          setSlides(urls);
          setCurrentSlide(0);
        }
      } catch {
        // ignore, fallback to static images from /public/edited
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Rotate slideshow every 5s
  useEffect(() => {
    if (!slides.length) return;
    const intervalId = window.setInterval(() => {
      setCurrentSlide((idx) => (idx + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [slides]);

  return { slides, currentSlide };
}

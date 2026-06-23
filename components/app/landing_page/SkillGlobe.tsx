'use client';

import { useEffect, useRef } from 'react';

/**
 * SkillGlobe
 * A Canvas 2D "digital planet": tech labels orbit a glowing dotted sphere
 * in true 3D depth (front labels bright, back labels dimmed + occluded by
 * the planet body). Ambient rotation only. No dependencies. Retina-aware.
 * Respects prefers-reduced-motion (renders a single static frame).
 */

type Vec3 = [number, number, number];

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  p: number;
  s: number;
}

const DEFAULT_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'Python', 'Tailwind', 'Supabase', 'PostgreSQL', 'HTML5',
  'CSS3', 'Linux', 'Git', 'Three.js',
];

const getTokenColor = (
  styles: CSSStyleDeclaration,
  token: string,
  fallback: string,
) => styles.getPropertyValue(token).trim() || fallback;

const withAlpha = (color: string, alpha: number) => {
  const value = color.trim();
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const raw = hex[1].length === 3
      ? hex[1].split('').map((char) => char + char).join('')
      : hex[1];
    const int = Number.parseInt(raw, 16);
    return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
  }

  const rgb = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const [r, g, b] = rgb[1].split(',').map((part) => part.trim());
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return value;
};

export default function SkillGlobe({ skills = DEFAULT_SKILLS }: { skills?: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const readColors = () => {
      const styles = getComputedStyle(document.documentElement);

      return {
        accent: getTokenColor(styles, '--color-signal-info', 'Highlight'),
        canvas: getTokenColor(styles, '--color-canvas', 'Canvas'),
        surface: getTokenColor(styles, '--color-surface', 'Canvas'),
        surfaceRaised: getTokenColor(styles, '--color-surface-raised', 'Canvas'),
        textPrimary: getTokenColor(styles, '--color-text-primary', 'CanvasText'),
        textSecondary: getTokenColor(styles, '--color-text-secondary', 'GrayText'),
        textSubtle: getTokenColor(styles, '--color-text-subtle', 'GrayText'),
      };
    };
    let colors = readColors();

    let w = 0, h = 0, cx = 0, cy = 0, R = 0, dpr = 1, raf = 0;
    let rotation = 0;
    const tilt = -0.42; // fixed camera tilt (radians)

    // Even point distribution on a unit sphere (golden angle / Fibonacci).
    const fib = (n: number): Vec3[] => {
      const pts: Vec3[] = [];
      const ga = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < n; i++) {
        const y = 1 - ((i + 0.5) / n) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const t = ga * i;
        pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
      }
      return pts;
    };

    const dots = fib(440);
    const labelPts = fib(skills.length);
    let stars: Star[] = [];

    const setSize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2; cy = h / 2;
      R = Math.min(w, h) * 0.34;
      const count = Math.round((w * h) / 5500);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.5 + 0.15,
        p: Math.random() * Math.PI * 2,
        s: Math.random() * 0.0015 + 0.0004,
      }));
    };

    // Rotate a unit-sphere point by current spin + tilt -> screen-space depth.
    const rot = (
      p: Vec3, cosR: number, sinR: number, cosT: number, sinT: number
    ) => {
      const [x0, y0, z0] = p;
      const x = x0 * cosR + z0 * sinR;
      const z = -x0 * sinR + z0 * cosR;
      const y2 = y0 * cosT - z * sinT;
      const z2 = y0 * sinT + z * cosT;
      return { x, y: y2, z: z2 };
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const cosR = Math.cos(rotation), sinR = Math.sin(rotation);
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);

      // 1) starfield
      for (const st of stars) {
        const tw = st.a + Math.sin(time * st.s + st.p) * 0.22;
        ctx.globalAlpha = Math.max(0, Math.min(1, tw));
        ctx.fillStyle = colors.textSubtle;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 2) outer atmosphere halo
      const halo = ctx.createRadialGradient(cx, cy, R * 0.35, cx, cy, R * 1.85);
      halo.addColorStop(0, withAlpha(colors.accent, 0.2));
      halo.addColorStop(0.55, withAlpha(colors.accent, 0.05));
      halo.addColorStop(1, withAlpha(colors.canvas, 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.85, 0, Math.PI * 2);
      ctx.fill();

      // label screen positions on a slightly larger orbit, sorted back->front
      const ORB = R * 1.16;
      const labels = labelPts
        .map((p, i) => {
          const r = rot(p, cosR, sinR, cosT, sinT);
          return { text: skills[i], sx: cx + r.x * ORB, sy: cy - r.y * ORB, z: r.z };
        })
        .sort((a, b) => a.z - b.z);

      const drawLabel = (lb: { text: string; sx: number; sy: number; z: number }) => {
        const dn = (lb.z + 1) / 2; // 0 (back) .. 1 (front)
        const behind = lb.z < -0.1;
        const size = 11 + dn * 9;
        ctx.font = `600 ${size}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = behind ? 0.16 + dn * 0.18 : 0.55 + dn * 0.45;
        ctx.shadowColor = withAlpha(colors.accent, behind ? 0.15 : 0.85);
        ctx.shadowBlur = behind ? 3 : 14;
        ctx.fillStyle = behind ? withAlpha(colors.textSecondary, 0.85) : colors.textPrimary;
        ctx.fillText(lb.text, lb.sx, lb.sy);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      };

      // 3) labels behind the planet (body will occlude them)
      labels.filter((l) => l.z < 0).forEach(drawLabel);

      // 4) planet body (lit from top-left)
      const body = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.38, R * 0.1, cx, cy, R);
      body.addColorStop(0, withAlpha(colors.surfaceRaised, 0.97));
      body.addColorStop(0.62, withAlpha(colors.surface, 0.96));
      body.addColorStop(1, withAlpha(colors.canvas, 0.94));
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // 5) digital surface dots (depth sorted)
      const pdots = dots
        .map((p) => rot(p, cosR, sinR, cosT, sinT))
        .sort((a, b) => a.z - b.z);
      for (const d of pdots) {
        const dn = (d.z + 1) / 2;
        ctx.globalAlpha = 0.12 + dn * 0.55;
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(cx + d.x * R, cy - d.y * R, 0.5 + dn * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 6) limb highlight to define the sphere edge
      ctx.strokeStyle = withAlpha(colors.accent, 0.5);
      ctx.lineWidth = 1.2;
      ctx.shadowColor = withAlpha(colors.accent, 0.7);
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 7) labels in front of the planet
      labels.filter((l) => l.z >= 0).forEach(drawLabel);
    };

    const loop = (time: number) => {
      render(time);
      rotation += 0.0022;
      raf = requestAnimationFrame(loop);
    };

    setSize();
    if (reduced) render(0);
    else raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      setSize();
      if (reduced) render(0);
    });
    ro.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      colors = readColors();
      if (reduced) render(0);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObserver.disconnect();
    };
  }, [skills]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      role="img"
      aria-label="Rotating globe of programming languages and technologies"
    />
  );
}

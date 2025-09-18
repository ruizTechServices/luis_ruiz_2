'use client';
import Image from "next/image";
import { useEffect, useRef } from "react";


export default function About() {
  // Word labels and refs for animation (3D positions computed in rAF)
  const labels = useRef(
    [
      { name: "JavaScript", lat: 0, lon: 0 },
      { name: "Python", lat: -30, lon: 60 },
      { name: "HTML5", lat: -30, lon: -60 },
      { name: "Tailwind CSS", lat: 0, lon: 120 },
      { name: "PHP", lat: 0, lon: -120 },
      { name: "Node.js", lat: 30, lon: 60 },
      { name: "React", lat: 30, lon: -60 },
      { name: "Next.js", lat: 0, lon: 180 },
      { name: "Svelte", lat: 60, lon: 0 },
      { name: "Linux", lat: -60, lon: 0 }
    ]
  ).current;
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const spinRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const labelHalfWidths = useRef<number[]>([]);

  useEffect(() => {
    const R = 150; // sphere radius (px)
    const tilt = 18 * Math.PI / 180; // camera tilt around X
    const speed = 0.006; // radians per frame

    const project = (latDeg: number, lonDeg: number, spin: number) => {
      const lat = (latDeg * Math.PI) / 180;
      const lon = (lonDeg * Math.PI) / 180 + spin;
      // Sphere to Cartesian
      let x = R * Math.cos(lat) * Math.cos(lon);
      let y = R * Math.sin(lat);
      let z = R * Math.cos(lat) * Math.sin(lon);
      // Apply global tilt around X axis
      const yT = y * Math.cos(tilt) - z * Math.sin(tilt);
      const zT = y * Math.sin(tilt) + z * Math.cos(tilt);
      return { x, y: yT, z: zT };
    };

    const frame = () => {
      spinRef.current += speed;
      const spin = spinRef.current;
      labels.forEach((lbl, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const p = project(lbl.lat, lbl.lon, spin);
        el.style.transform = `translate(-50%, -50%) translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, ${p.z.toFixed(2)}px)`;
        el.style.zIndex = String(1000 + Math.round(p.z));
        // Fade and scale by depth and radial proximity to the limb
        const front = Math.max(0, p.z / R); // 0..1 for front hemisphere
        let t = Math.max(0, Math.min(1, (front - 0.2) / 0.8)); // start showing after 20% frontness
        t = t * t; // ease-in for nicer pop-in
        // Limb fade based on screen-space radius plus label width so tips never clip
        const r = Math.min(1, Math.sqrt(p.x * p.x + p.y * p.y) / R);
        const baseScale = 0.85 + 0.25 * t;
        const halfW = (labelHalfWidths.current[i] ?? 40) * baseScale; // px
        const margin = Math.min(0.2, halfW / R); // normalized margin (cap at 0.2)
        const limbStart = Math.max(0.6, 1 - (margin + 0.10));
        const limbEnd = Math.max(0.65, 1 - (margin + 0.02));
        const limbFactor = Math.max(0, Math.min(1, (limbEnd - r) / (limbEnd - limbStart)));
        let opacity = t * limbFactor;
        // Hard cut very close to the limb to eliminate tiny white slivers
        if (opacity < 0.08) opacity = 0;
        const scale = baseScale * (0.95 + 0.05 * limbFactor);
        el.style.opacity = String(opacity);
        const child = (el.firstElementChild as HTMLElement | null);
        child?.style.setProperty('transform', `scale(${scale.toFixed(3)})`);
        // Reduce drop shadow as we approach the edge to avoid detached shadow artifacts
        const shadowStrength = Math.max(0, Math.min(1, opacity));
        const shadow = shadowStrength > 0
          ? `0 4px 10px rgba(0,0,0,${0.12 * shadowStrength}), 0 2px 4px rgba(0,0,0,${0.08 * shadowStrength})`
          : 'none';
        if (child) child.style.boxShadow = shadow;
      });
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [labels]);

  // Measure label widths to improve edge fading
  useEffect(() => {
    const measure = () => {
      labelRefs.current.forEach((el, i) => {
        const child = el?.firstElementChild as HTMLElement | null;
        if (child) labelHalfWidths.current[i] = child.getBoundingClientRect().width / 2;
      });
    };
    // Delay to allow first paint
    const id = setTimeout(measure, 0);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', measure);
    };
  }, []);
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Image 
                src="/edited/luis-2.png" 
                alt="Portrait of Gio" 
                className="w-20 h-20 rounded-full object-cover"
                width={80}
                height={80}
              />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Gio</h2>
                <p className="text-lg text-gray-600">(Luis Giovanni Ruiz)</p>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              I'm a Bronx-born, bilingual full-stack AI engineer and founder of RuizTechServices LLC (est. 2024). 
              My flagship product 24Hour-AI is a high-performance LLM platform achieving sub-200ms latency, 
              99.9% uptime, and 30% cost optimization while supporting 100+ concurrent users. I specialize in 
              scalable AI infrastructure and enterprise-grade solutions that deliver measurable business value.
            </p>
            
            <blockquote className="text-xl font-semibold text-blue-600 border-l-4 border-blue-500 pl-4">
              "Learn → Build → Ship → Iterate."
            </blockquote>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Versatility at its Best: Mastering Multiple Languages & Frameworks
            </h3>
            
            <div
              className="relative w-full h-96 flex items-center justify-center overflow-hidden"
              style={{ perspective: '800px' }}
            >
              <div className="relative w-80 h-80 mx-auto" style={{ borderRadius: '50%', overflow: 'hidden' }}>
                {/* Sphere background stays circular (doesn't spin) */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(198,224,255,0.9) 18%, rgba(164,202,252,0.9) 45%, rgba(134,185,246,0.92) 65%, rgba(116,170,236,0.95) 80%, rgba(95,152,226,1) 100%)',
                    boxShadow:
                      'inset -20px -40px 80px rgba(0,0,0,0.18), inset 20px 20px 60px rgba(255,255,255,0.6), 0 8px 24px rgba(30,64,175,0.25)',
                    zIndex: 1
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(120px 90px at 30% 25%, rgba(255,255,255,0.65), rgba(255,255,255,0) 60%)',
                    filter: 'blur(1px)',
                    zIndex: 2
                  }}
                />
                {/* Rotating label layer */}
                <div
                  className="absolute inset-0"
                  style={{
                    transformStyle: 'preserve-3d',
                    zIndex: 10
                  }}
                >
                {[
                  { name: "JavaScript", lat: 0, lon: 0 },
                  { name: "Python", lat: -30, lon: 60 },
                  { name: "HTML5", lat: -30, lon: -60 },
                  { name: "Tailwind CSS", lat: 0, lon: 120 },
                  { name: "PHP", lat: 0, lon: -120 },
                  { name: "Node.js", lat: 30, lon: 60 },
                  { name: "React", lat: 30, lon: -60 },
                  { name: "Next.js", lat: 0, lon: 180 },
                  { name: "Svelte", lat: 60, lon: 0 },
                  { name: "Linux", lat: -60, lon: 0 }
                ].map((skill, index) => (
                  <div
                    key={index}
                    ref={(el) => { labelRefs.current[index] = el; }}
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    <div className="bg-white/95 px-3 py-1 rounded-full shadow-md border border-gray-200 text-sm font-semibold text-gray-800 whitespace-nowrap hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-default" >
                      {skill.name}
                    </div>
                  </div>
                ))}
                </div>
                {/* Top vignette to enhance occlusion near the limb */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    zIndex: 20,
                    background:
                      'radial-gradient(closest-side at 50% 50%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.12) 78%, rgba(0,0,0,0.22) 100%)'
                  }}
                />
              </div>

              <style jsx>{``}</style>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

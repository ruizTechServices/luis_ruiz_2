//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\components\app\landing_page\about.tsx
'use client';
import Image from "next/image";
import { useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";

const Globe3D = dynamic(() => import("./Globe3D"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-48 h-48 rounded-full bg-gray-200/20 animate-pulse" />
    </div>
  ),
});


export default function About() {
  // Labels used by the 3D globe component
  const labels = useMemo(
    () => [
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
    ],
    []
  );
  const DISABLE_DOM_GLOBE = true;
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const spinRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const labelHalfWidths = useRef<number[]>([]);
  const sphereRef = useRef<HTMLDivElement | null>(null);
  const radiusRef = useRef<number>(150);
  const latAngles = useRef<number[]>([-60, -30, 0, 30, 60]).current;
  const lonAngles = useRef<number[]>([-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150]).current;
  const latRingRefs = useRef<Array<HTMLDivElement | null>>([]);
  const lonRingRefs = useRef<Array<HTMLDivElement | null>>([]);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const atmosphereRef = useRef<HTMLDivElement | null>(null);

  // Randomize label positions once (Fibonacci sphere + small jitter) — disabled for Three.js version
  useEffect(() => {
    if (DISABLE_DOM_GLOBE) return;
    const n = labels.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const jitterLat = 10; // degrees
    const jitterLon = 25; // degrees
    const maxLat = 65; // keep labels away from extreme poles
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n; // -1..1
      let lat = Math.asin(y) * (180 / Math.PI);
      let lon = (golden * i) * (180 / Math.PI);
      lat += (Math.random() * 2 - 1) * jitterLat;
      lon += (Math.random() * 2 - 1) * jitterLon;
      lat = Math.max(-maxLat, Math.min(maxLat, lat));
      lon = ((lon + 180) % 360) - 180; // normalize to [-180,180]
      labels[i].lat = lat;
      labels[i].lon = lon;
    }
  }, [DISABLE_DOM_GLOBE, labels]);

  useEffect(() => {
    if (DISABLE_DOM_GLOBE) return;
    const baseTilt = 18 * Math.PI / 180; // base camera tilt around X
    const EPS = 1.0; // inward offset so labels never clip the rim
    let t = 0; // time accumulator for subtle variations

    const project = (latDeg: number, lonDeg: number, spin: number, tiltNow: number, R: number) => {
      const lat = (latDeg * Math.PI) / 180;
      const lon = (lonDeg * Math.PI) / 180 + spin;
      // Sphere to Cartesian
      const x = R * Math.cos(lat) * Math.cos(lon);
      const y = R * Math.sin(lat);
      const z = R * Math.cos(lat) * Math.sin(lon);
      // Apply global tilt around X axis
      const yT = y * Math.cos(tiltNow) - z * Math.sin(tiltNow);
      const zT = y * Math.sin(tiltNow) + z * Math.cos(tiltNow);
      const invLen = 1 / Math.max(1e-6, Math.hypot(x, yT, zT));
      const nx = x * invLen, ny = yT * invLen, nz = zT * invLen; // unit normal
      return { x, y: yT, z: zT, nx, ny, nz };
    };

    const frame = () => {
      t += 1;
      const tiltNow = baseTilt + (3 * Math.PI / 180) * Math.sin(t * 0.01); // slight precession
      const speedNow = 0.004 + 0.002 * Math.sin(t * 0.006); // gentle speed variation
      spinRef.current += speedNow;
      const spin = spinRef.current;
      const R = radiusRef.current;
      const spinDeg = (spin * 180) / Math.PI;
      const tiltDeg = (tiltNow * 180) / Math.PI;

      // Light direction for specular highlight (world coordinate)
      const lightLat = 28;  // degrees
      const lightLon = -40; // degrees
      const pL = project(lightLat, lightLon - spinDeg, spin, tiltNow, R);
      if (highlightRef.current) {
        const size = Math.max(60, R * 0.9);
        highlightRef.current.style.width = `${size}px`;
        highlightRef.current.style.height = `${size}px`;
        highlightRef.current.style.transform = `translate(calc(50% + ${pL.x.toFixed(2)}px - ${size / 2}px), calc(50% + ${pL.y.toFixed(2)}px - ${size / 2}px))`;
        const intensity = Math.max(0, Math.min(1, pL.z / R));
        highlightRef.current.style.opacity = `${0.45 * intensity}`;
      }
      if (atmosphereRef.current) {
        atmosphereRef.current.style.opacity = '0.6';
      }
      labels.forEach((lbl, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const p = project(lbl.lat, lbl.lon, spin, tiltNow, R);
        const px = p.x - EPS * p.nx;
        const py = p.y - EPS * p.ny;
        const pz = p.z - EPS * p.nz;
        el.style.transform = `translate(-50%, -50%) translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, ${pz.toFixed(2)}px)`;
        el.style.zIndex = String(1000 + Math.round(pz));
        // Fade and scale by depth and radial proximity to the limb
        const front = Math.max(0, pz / R); // 0..1 for front hemisphere
        let t = Math.max(0, Math.min(1, (front - 0.2) / 0.8)); // start showing after 20% frontness
        t = t * t; // ease-in for nicer pop-in
        // Limb fade based on screen-space radius plus label width so tips never clip
        const r = Math.min(1, Math.sqrt(px * px + py * py) / R);
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
        // Make labels hug the globe: rotate towards surface tangent (but still readable)
        const yaw = Math.atan2(px, pz); // rotation around Y to face the point
        const pitch = -Math.atan2(py, Math.sqrt(px * px + pz * pz));
        const stick = 0.75; // hug the surface more for a decal feel
        const yawDeg = (yaw * stick * 180) / Math.PI;
        const pitchDeg = (pitch * stick * 180) / Math.PI;
        if (child) {
          child.style.transform = `rotateY(${yawDeg}deg) rotateX(${pitchDeg}deg) scale(${scale.toFixed(3)})`;
        }
        // Reduce drop shadow as we approach the edge to avoid detached shadow artifacts
        const shadowStrength = Math.max(0, Math.min(1, opacity));
        const shadow = shadowStrength > 0
          ? `0 4px 10px rgba(0,0,0,${0.12 * shadowStrength}), 0 2px 4px rgba(0,0,0,${0.08 * shadowStrength})`
          : 'none';
        if (child) child.style.boxShadow = shadow;
      });

      // Update meridian (longitude) rings
      lonAngles.forEach((phi, i) => {
        const ring = lonRingRefs.current[i];
        if (!ring) return;
        ring.style.transform = `translate(-50%, -50%) rotateX(${tiltDeg}deg) rotateY(${(spinDeg + phi).toFixed(2)}deg)`;
        ring.style.opacity = '0.18';
      });
      // Update parallel (latitude) rings (smaller circles offset along Y)
      latAngles.forEach((latDegVal, i) => {
        const ring = latRingRefs.current[i];
        if (!ring) return;
        const rad = (latDegVal * Math.PI) / 180;
        const scale = Math.cos(rad);
        const offsetY = (Math.sin(rad) * R).toFixed(2);
        ring.style.transform = `translate(-50%, -50%) translate3d(0px, ${offsetY}px, 0px) rotateX(${tiltDeg}deg) rotateY(${spinDeg}deg) scale(${scale.toFixed(3)})`;
        ring.style.opacity = '0.12';
      });
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [DISABLE_DOM_GLOBE, labels, latAngles, lonAngles]);

  // Measure sphere radius responsively — disabled for Three.js version
  useEffect(() => {
    if (DISABLE_DOM_GLOBE) return;
    const measure = () => {
      const w = sphereRef.current?.clientWidth ?? 300;
      radiusRef.current = Math.max(60, w / 2);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [DISABLE_DOM_GLOBE]);

  // Measure label widths to improve edge fading — disabled for Three.js version
  useEffect(() => {
    if (DISABLE_DOM_GLOBE) return;
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
  }, [DISABLE_DOM_GLOBE]);
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
              I&apos;m a Bronx-born, bilingual full-stack AI engineer and founder of RuizTechServices LLC (est. 2024). 
              My flagship product 24Hour-AI is a high-performance LLM platform achieving sub-200ms latency, 
              99.9% uptime, and 30% cost optimization while supporting 100+ concurrent users. I specialize in 
              scalable AI infrastructure and enterprise-grade solutions that deliver measurable business value.
            </p>
            
            <blockquote className="text-xl font-semibold text-blue-600 border-l-4 border-blue-500 pl-4">
              &quot;Learn → Build → Ship → Iterate.&quot;
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
              <Globe3D labels={labels} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

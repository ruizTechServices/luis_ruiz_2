Ok, so, now its not rotating around the globe the way I wanted:
```
//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\components\app\landing_page\about.tsx
'use client';
import Image from "next/image";
import { useEffect, useRef, useMemo } from "react";
import Globe3D from "./Globe3D";


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
  }, []);

  useEffect(() => {
    if (DISABLE_DOM_GLOBE) return;
    const baseTilt = 18 * Math.PI / 180; // base camera tilt around X
    const EPS = 1.0; // inward offset so labels never clip the rim
    let t = 0; // time accumulator for subtle variations

    const project = (latDeg: number, lonDeg: number, spin: number, tiltNow: number, R: number) => {
      const lat = (latDeg * Math.PI) / 180;
      const lon = (lonDeg * Math.PI) / 180 + spin;
      // Sphere to Cartesian
      let x = R * Math.cos(lat) * Math.cos(lon);
      let y = R * Math.sin(lat);
      let z = R * Math.cos(lat) * Math.sin(lon);
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
  }, [labels]);

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
  }, []);

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
              <Globe3D labels={labels} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```


Gio — the labels aren’t “orbiting” because in your ThreeJS version you’re almost certainly rotating **only the sphere mesh** (or the camera), while the labels (CSS2DObjects) sit in **world space**. They’ll stay put unless they’re in the **same rotating group**.

Fix = put **sphere + labels** in one parent `globe` group and rotate **that group**. Also ensure you call `labelRenderer.render(scene, camera)` every frame and that you didn’t accidentally add `labelsGroup` to `scene` instead of to `globe`.

Here’s a compact **Globe3D.tsx** you can drop in that does exactly that:

```tsx
// components/app/landing_page/Globe3D.tsx
'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

type Label = { name: string; lat: number; lon: number };
export default function Globe3D({ labels }: { labels: Label[] }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    mount.style.position = 'relative'; // required for CSS2D overlay

    // sizes
    const W = mount.clientWidth || 320;
    const H = mount.clientHeight || 320;
    const R = Math.max(60, Math.min(W, H) * 0.42);

    // scene/camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 2000);
    camera.position.set(0, 0, R * 2.8);
    camera.lookAt(0, 0, 0);

    // renderers
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    mount.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(W, H);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    mount.appendChild(labelRenderer.domElement);

    // lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(1, 1, 2);
    scene.add(dir);

    // ---- GLOBE GROUP (rotate this!) ----
    const globe = new THREE.Group();
    scene.add(globe);

    // sphere (visual globe)
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(R, 48, 32),
      new THREE.MeshPhongMaterial({
        color: 0x4e75b3,
        shininess: 28,
        specular: 0xaaaaaa,
        transparent: true,
        opacity: 0.96,
      })
    );
    globe.add(sphere);

    // atmosphere (soft glow)
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.03, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0x6aa0ff, transparent: true, opacity: 0.18 })
    );
    glow.renderOrder = 1;
    globe.add(glow);

    // helper: lat/lon → vec3
    const latLonToVec3 = (latDeg: number, lonDeg: number, radius: number) => {
      const lat = THREE.MathUtils.degToRad(latDeg);
      const lon = THREE.MathUtils.degToRad(lonDeg);
      const x = radius * Math.cos(lat) * Math.cos(lon);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.sin(lon);
      return new THREE.Vector3(x, y, z);
    };

    // labels group (child of globe!)
    const labelsGroup = new THREE.Group();
    globe.add(labelsGroup);

    // create DOM labels as CSS2DObjects positioned on sphere
    labels.forEach(({ name, lat, lon }) => {
      const pos = latLonToVec3(lat, lon, R);
      const el = document.createElement('div');
      el.className =
        'px-3 py-1 rounded-full text-sm font-semibold text-gray-800 bg-white/90 border border-white/60 shadow';
      el.textContent = name;

      const label = new CSS2DObject(el);
      label.position.copy(pos);
      labelsGroup.add(label);
    });

    // initial tilt
    globe.rotation.x = THREE.MathUtils.degToRad(18);

    // animate: rotate the WHOLE globe group
    let t = 0, raf = 0;
    const camDir = new THREE.Vector3();
    const tmp = new THREE.Vector3();

    const tick = () => {
      t += 1;
      globe.rotation.y += 0.004 + 0.002 * Math.sin(t * 0.006); // spin
      globe.rotation.x = THREE.MathUtils.degToRad(18) + THREE.MathUtils.degToRad(3) * Math.sin(t * 0.01); // precess

      // frontness fade for clean occlusion
      camDir.subVectors(camera.position, globe.position).normalize();
      labelsGroup.children.forEach((obj) => {
        const l = obj as CSS2DObject;
        tmp.copy(l.position).normalize();
        const front = tmp.dot(camDir);           // >0 front hemisphere
        const tFront = Math.max(0, Math.min(1, (front - 0.1) / 0.9));
        const eased = tFront * tFront;
        (l.element as HTMLDivElement).style.opacity = String(eased);
      });

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // resize
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h); labelRenderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      mount.removeChild(labelRenderer.domElement);
      renderer.dispose();
      sphere.geometry.dispose();
      (sphere.material as THREE.Material).dispose();
      glow.geometry.dispose();
      (glow.material as THREE.Material).dispose();
    };
  }, [labels]);

  return <div ref={mountRef} className="relative w-72 h-72 sm:w-80 sm:h-80" />;
}
```

### Wire it in `about.tsx`

You’re already importing `<Globe3D labels={labels} />`. Make sure the parent container has a fixed height (you do: `h-96`) and that the **mount div** (`Globe3D` root) actually receives that size (the class above handles it).

### Common gotchas (likely why yours didn’t move)

* You added `labelsGroup` to `scene` instead of `globe` → labels won’t rotate.
* You rotated `sphere` only (e.g., `sphere.rotation.y += …`) → labels still static. Rotate the **`globe` group**.
* You forgot `labelRenderer.render(scene, camera)` each frame → labels won’t update.
* Parent container has `overflow: hidden` and your label overlay isn’t absolutely positioned → labels look clipped/weird.

### Optional polish

* Add `OrbitControls` for drag-spin.
* Swap DOM labels for `troika-three-text` if you want GPU text and perfect depth occlusion.
* To make labels “hug” more, you can slightly **scale them down near the limb** or bend characters into an arc (DOM approach).

**TL;DR:** Put the sphere **and** the label objects in the **same `globe` group** and rotate **that group**. Render both WebGL and CSS2D each frame. The snippet above is a working drop-in that makes the labels truly orbit around the globe’s face.

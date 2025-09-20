'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

export type GlobeLabel = { name: string; lat: number; lon: number };

interface Globe3DProps {
  labels: GlobeLabel[];
}

export default function Globe3D({ labels }: Globe3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Slight jitter & clamping away from poles for nicer distribution
  const jittered = useMemo(() => {
    const jitterLat = 10;
    const jitterLon = 25;
    const maxLat = 65;
    return labels.map((l) => {
      const lat = THREE.MathUtils.clamp(l.lat + (Math.random() * 2 - 1) * jitterLat, -maxLat, maxLat);
      const lon = l.lon + (Math.random() * 2 - 1) * jitterLon;
      return { ...l, lat, lon };
    });
  }, [labels]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 320;
    const R = Math.max(60, Math.min(width, height) * 0.42);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 2000);
    camera.position.set(0, 0, R * 2.8);

    // Renderers
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    mount.appendChild(labelRenderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(1, 1, 2);
    scene.add(key);

    // Globe group
    const globe = new THREE.Group();
    scene.add(globe);

    // Sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(R, 48, 32),
      new THREE.MeshPhongMaterial({
        color: 0x76a8f1,
        shininess: 25,
        specular: 0xaaaaaa,
        transparent: true,
        opacity: 0.95,
      })
    );
    globe.add(sphere);

    // Atmosphere (soft glow)
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.03, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0x4e86d6, transparent: true, opacity: 0.18 })
    );
    atmosphere.renderOrder = 1;
    globe.add(atmosphere);

    // Helpers
    const latLonToVec3 = (latDeg: number, lonDeg: number, radius: number) => {
      const lat = THREE.MathUtils.degToRad(latDeg);
      const lon = THREE.MathUtils.degToRad(lonDeg);
      const x = radius * Math.cos(lat) * Math.cos(lon);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.sin(lon);
      return new THREE.Vector3(x, y, z);
    };

    // Labels
    const labelsGroup = new THREE.Group();
    globe.add(labelsGroup);

    jittered.forEach((lbl) => {
      const pos = latLonToVec3(lbl.lat, lbl.lon, R);
      // Outer element is positioned by CSS2DRenderer; we rotate/style the inner chip
      const outer = document.createElement('div');
      const chip = document.createElement('div');
      chip.className =
        'px-3 py-1 rounded-full text-sm font-semibold text-gray-800 bg-white/90 border border-white/60 shadow backdrop-blur-sm';
      chip.textContent = lbl.name;
      outer.appendChild(chip);
      const label = new CSS2DObject(outer);
      label.position.copy(pos);
      labelsGroup.add(label);
    });

    // Animation
    globe.rotation.x = THREE.MathUtils.degToRad(18);
    let t = 0;
    const tmp = new THREE.Vector3();
    const camDir = new THREE.Vector3();
    const wp = new THREE.Vector3();
    let raf = 0;

    const animate = () => {
      t += 1;
      globe.rotation.y += 0.004 + 0.002 * Math.sin(t * 0.006);
      globe.rotation.x = THREE.MathUtils.degToRad(18) + THREE.MathUtils.degToRad(3) * Math.sin(t * 0.01);

      // Fade labels by frontness and orient chips tangentially
      camDir.subVectors(camera.position, globe.position).normalize();
      labelsGroup.children.forEach((obj: THREE.Object3D) => {
        const l = obj as CSS2DObject;
        // world-space normal at label point (sphere centered at origin)
        l.getWorldPosition(wp);
        tmp.copy(wp).normalize();
        const frontness = tmp.dot(camDir); // >0 means front hemisphere
        const el = l.element as HTMLDivElement;
        const chip = el.firstElementChild as HTMLDivElement | null;
        const tFront = Math.max(0, Math.min(1, (frontness - 0.08) / 0.92));
        const eased = tFront * tFront;
        if (chip) {
          // scale slightly with frontness; rotate to hug tangent
          const baseScale = 0.85 + 0.2 * eased;
          const yaw = Math.atan2(wp.x, wp.z);
          const pitch = -Math.atan2(wp.y, Math.sqrt(wp.x * wp.x + wp.z * wp.z));
          const stick = 0.85; // 0 = face camera, 1 = fully tangent
          const yawDeg = (yaw * stick * 180) / Math.PI;
          const pitchDeg = (pitch * stick * 180) / Math.PI;
          chip.style.transform = `rotateY(${yawDeg.toFixed(3)}deg) rotateX(${pitchDeg.toFixed(3)}deg) scale(${baseScale.toFixed(3)})`;
          chip.style.transformOrigin = '50% 50%';
          chip.style.opacity = String(eased);
          chip.style.filter = `blur(${(1 - eased) * 0.5}px)`;
          chip.style.boxShadow = eased > 0
            ? `0 4px 10px rgba(0,0,0,${0.12 * eased}), 0 2px 4px rgba(0,0,0,${0.08 * eased})`
            : 'none';
        } else {
          // fallback if no chip child present
          el.style.opacity = String(eased);
        }
      });

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    // Resize
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      mount.removeChild(labelRenderer.domElement);
      renderer.dispose();
      sphere.geometry.dispose();
      (sphere.material as THREE.Material).dispose();
      atmosphere.geometry.dispose();
      (atmosphere.material as THREE.Material).dispose();
    };
  }, [jittered]);

  return <div ref={mountRef} className="relative w-72 h-72 sm:w-80 sm:h-80" />;
}

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Sandbox3DCoreProps {
  currentChapter: number; // 0 to 5 (continuous float)
  scrollY: number;
}

export const Sandbox3DCore: React.FC<Sandbox3DCoreProps> = ({ currentChapter, scrollY }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live refs to avoid closure staleness in requestAnimationFrame
  const chapterRef = useRef(currentChapter);
  chapterRef.current = currentChapter;

  const scrollYRef = useRef(scrollY);
  scrollYRef.current = scrollY;

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number | null = null;

    try {
      // 1. Scene, Camera, Renderer
      const scene = new THREE.Scene();

      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;

      const camera = new THREE.PerspectiveCamera(45, width / Math.max(1, height), 0.1, 100);
      camera.position.set(0, 0, 7.5);

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // 2. Central Radiant Core (Glowing Orb)
      const coreGeo = new THREE.SphereGeometry(0.55, 24, 24);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xff8f2e,
        wireframe: true,
        transparent: true,
        opacity: 0.85,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      scene.add(coreMesh);

      // Inner glowing core
      const innerGeo = new THREE.SphereGeometry(0.32, 16, 16);
      const innerMat = new THREE.MeshBasicMaterial({ color: 0xffb74d });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      coreMesh.add(innerMesh);

      // 3. Orbital Ring Structure (Using LineLoop so vertex count is safe)
      const ringPoints: THREE.Vector3[] = [];
      const ringSegments = 64;
      for (let i = 0; i < ringSegments; i++) {
        const theta = (i / ringSegments) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(Math.cos(theta) * 2.2, Math.sin(theta) * 2.2, 0));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
      const ringMat = new THREE.LineBasicMaterial({
        color: 0x2e45ff,
        transparent: true,
        opacity: 0.45,
      });
      const ringMesh = new THREE.LineLoop(ringGeo, ringMat);
      scene.add(ringMesh);

      // 4. Particle Formations (1,200 points)
      const PARTICLE_COUNT = 1200;

      // Formation 0: Processor Cube Die (Hero)
      const f0 = new Float32Array(PARTICLE_COUNT * 3);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        f0[i3] = (Math.random() - 0.5) * 3.2;
        f0[i3 + 1] = (Math.random() - 0.5) * 3.2;
        f0[i3 + 2] = (Math.random() - 0.5) * 3.2;
      }

      // Formation 1: Dual Spiral Orbit (Admissions)
      const f1 = new Float32Array(PARTICLE_COUNT * 3);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const t = (i / PARTICLE_COUNT) * Math.PI * 8;
        const r = 1.2 + (i / PARTICLE_COUNT) * 1.5;
        const strand = i % 2 === 0 ? 1 : -1;
        f1[i3] = Math.cos(t) * r * strand;
        f1[i3 + 1] = (i / PARTICLE_COUNT - 0.5) * 4.2;
        f1[i3 + 2] = Math.sin(t) * r * strand;
      }

      // Formation 2: Matrix Lattice Grid (Courses)
      const f2 = new Float32Array(PARTICLE_COUNT * 3);
      const side = Math.round(Math.cbrt(PARTICLE_COUNT));
      let idx = 0;
      for (let x = 0; x < side; x++) {
        for (let y = 0; y < side; y++) {
          for (let z = 0; z < side; z++) {
            if (idx >= PARTICLE_COUNT) break;
            const i3 = idx * 3;
            f2[i3] = (x / side - 0.5) * 3.6;
            f2[i3 + 1] = (y / side - 0.5) * 3.6;
            f2[i3 + 2] = (z / side - 0.5) * 3.6;
            idx++;
          }
        }
      }

      // Formation 3: Globe Spherical Shell (Study Abroad)
      const f3 = new Float32Array(PARTICLE_COUNT * 3);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
        const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
        const radius = 2.3;
        f3[i3] = radius * Math.cos(theta) * Math.sin(phi);
        f3[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
        f3[i3 + 2] = radius * Math.cos(phi);
      }

      // Formation 4: Interconnected Network Constellation (Internships)
      const f4 = new Float32Array(PARTICLE_COUNT * 3);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const cluster = i % 5;
        const cx = Math.cos((cluster / 5) * Math.PI * 2) * 1.8;
        const cy = Math.sin((cluster / 5) * Math.PI * 2) * 1.8;
        f4[i3] = cx + (Math.random() - 0.5) * 1.0;
        f4[i3 + 1] = cy + (Math.random() - 0.5) * 1.0;
        f4[i3 + 2] = (Math.random() - 0.5) * 1.2;
      }

      // Formation 5: Radiant Crystalline Diamond (Placements)
      const f5 = new Float32Array(PARTICLE_COUNT * 3);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * 2.5;
        f5[i3] = r * Math.sin(phi) * Math.cos(theta);
        f5[i3 + 1] = r * Math.abs(Math.cos(phi)) * 1.4 - 0.2;
        f5[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      }

      const formations = [f0, f1, f2, f3, f4, f5];
      const currentPositions = new Float32Array(f0);

      // Points BufferGeometry
      const pointsGeo = new THREE.BufferGeometry();
      pointsGeo.setAttribute("position", new THREE.BufferAttribute(currentPositions, 3));

      // Colors
      const colors = new Float32Array(PARTICLE_COUNT * 3);
      const colorA = new THREE.Color(0x2e45ff); // Ultramarine Blue
      const colorB = new THREE.Color(0xff8f2e); // Amber Core
      const colorC = new THREE.Color(0xffffff); // White Sparkle

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const mixed = Math.random() < 0.25 ? colorB : Math.random() < 0.2 ? colorC : colorA;
        colors[i3] = mixed.r;
        colors[i3 + 1] = mixed.g;
        colors[i3 + 2] = mixed.b;
      }
      pointsGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const pointsMat = new THREE.PointsMaterial({
        size: 0.055,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(pointsGeo, pointsMat);
      scene.add(points);

      // Mouse listener
      const onMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        mouseRef.current.targetX = x * 0.45;
        mouseRef.current.targetY = y * 0.45;
      };
      window.addEventListener("mousemove", onMouseMove, { passive: true });

      // Resize listener
      const onResize = () => {
        if (!canvas || !canvas.parentElement) return;
        const newW = canvas.parentElement.clientWidth || window.innerWidth;
        const newH = canvas.parentElement.clientHeight || window.innerHeight;
        camera.aspect = newW / Math.max(1, newH);
        camera.updateProjectionMatrix();
        renderer?.setSize(newW, newH);
      };
      window.addEventListener("resize", onResize);

      // Animation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        // Mouse follow lerp
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

        const liveScroll = scrollYRef.current;
        const liveChapter = chapterRef.current;
        const baseSpin = liveScroll * 0.0018;

        points.rotation.y = elapsed * 0.08 + baseSpin + mouseRef.current.x * 0.4;
        points.rotation.x = Math.sin(elapsed * 0.1) * 0.1 + mouseRef.current.y * 0.3;

        coreMesh.rotation.y = -elapsed * 0.25 - baseSpin;
        coreMesh.rotation.z = Math.cos(elapsed * 0.15) * 0.2;

        ringMesh.rotation.x = 1.1 + Math.sin(elapsed * 0.12) * 0.1;
        ringMesh.rotation.y = elapsed * 0.15 + baseSpin;

        // Continuous morphology interpolation
        const chap = Math.max(0, Math.min(5, liveChapter));
        const idxLow = Math.floor(chap);
        const idxHigh = Math.min(formations.length - 1, idxLow + 1);
        const mix = chap - idxLow;

        const targetA = formations[idxLow];
        const targetB = formations[idxHigh];

        for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
          const target = targetA[i] * (1 - mix) + targetB[i] * mix;
          currentPositions[i] += (target - currentPositions[i]) * 0.08;
        }

        pointsGeo.attributes.position.needsUpdate = true;

        // Camera parallax
        camera.position.x = mouseRef.current.x * 0.8;
        camera.position.y = mouseRef.current.y * 0.8;
        camera.lookAt(0, 0, 0);

        renderer?.render(scene, camera);
      };

      animate();

      return () => {
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        renderer?.dispose();
        pointsGeo.dispose();
        pointsMat.dispose();
        coreGeo.dispose();
        coreMat.dispose();
        innerGeo.dispose();
        innerMat.dispose();
        ringGeo.dispose();
        ringMat.dispose();
      };
    } catch (err) {
      console.warn("Three.js WebGL initialization caught error:", err);
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ pointerEvents: "none" }}
      />
      {/* Ambient background glow fallback */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,143,46,0.15)_0%,rgba(46,69,255,0.08)_45%,transparent_70%)]" />
    </div>
  );
};

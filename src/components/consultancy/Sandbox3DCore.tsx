import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Sandbox3DCoreProps {
  currentChapter: number; // 0 to 5 (continuous float)
  scrollY: number;
}

export const Sandbox3DCore: React.FC<Sandbox3DCoreProps> = ({ currentChapter, scrollY }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const ringMeshRef = useRef<THREE.LineSegments | null>(null);
  const latticeGroupRef = useRef<THREE.Group | null>(null);

  // Targets for morphing
  const formationsRef = useRef<Float32Array[]>([]);
  const currentPositionsRef = useRef<Float32Array | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // 2. Central Radiant Core (Glowing Orb)
    const coreGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xff8f2e,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xffb74d });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreMesh.add(innerMesh);

    // 3. Orbital Ring Structure
    const ringGeo = new THREE.BufferGeometry();
    const ringPoints: number[] = [];
    const ringSegments = 96;
    for (let i = 0; i <= ringSegments; i++) {
      const theta = (i / ringSegments) * Math.PI * 2;
      ringPoints.push(Math.cos(theta) * 2.2, Math.sin(theta) * 2.2, 0);
    }
    ringGeo.setAttribute("position", new THREE.Float32BufferAttribute(ringPoints, 3));
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x2e45ff,
      transparent: true,
      opacity: 0.45,
    });
    const ringMesh = new THREE.LineSegments(ringGeo, ringMat);
    scene.add(ringMesh);
    ringMeshRef.current = ringMesh;

    // 4. Particle Formations (1,800 points)
    const PARTICLE_COUNT = 1800;

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
      f1[i3 + 1] = (i / PARTICLE_COUNT - 0.5) * 4.5;
      f1[i3 + 2] = Math.sin(t) * r * strand;
    }

    // Formation 2: Matrix Lattice Grid (Courses)
    const f2 = new Float32Array(PARTICLE_COUNT * 3);
    const side = Math.cbrt(PARTICLE_COUNT);
    let idx = 0;
    for (let x = 0; x < side; x++) {
      for (let y = 0; y < side; y++) {
        for (let z = 0; z < side; z++) {
          if (idx >= PARTICLE_COUNT) break;
          const i3 = idx * 3;
          f2[i3] = (x / side - 0.5) * 3.8;
          f2[i3 + 1] = (y / side - 0.5) * 3.8;
          f2[i3 + 2] = (z / side - 0.5) * 3.8;
          idx++;
        }
      }
    }

    // Formation 3: Globe Latitude Spherical Shell (Study Abroad)
    const f3 = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
      const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
      const radius = 2.4;
      f3[i3] = radius * Math.cos(theta) * Math.sin(phi);
      f3[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      f3[i3 + 2] = radius * Math.cos(phi);
    }

    // Formation 4: Interconnected Network Constellation (Internships)
    const f4 = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const cluster = i % 5;
      const clusterCenter = [
        Math.cos((cluster / 5) * Math.PI * 2) * 1.8,
        Math.sin((cluster / 5) * Math.PI * 2) * 1.8,
        (Math.random() - 0.5) * 1.2,
      ];
      f4[i3] = clusterCenter[0] + (Math.random() - 0.5) * 1.1;
      f4[i3 + 1] = clusterCenter[1] + (Math.random() - 0.5) * 1.1;
      f4[i3 + 2] = clusterCenter[2] + (Math.random() - 0.5) * 1.1;
    }

    // Formation 5: Radiant Crystalline Diamond (Placements)
    const f5 = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 2.6;
      const sinPhi = Math.sin(phi);
      f5[i3] = r * sinPhi * Math.cos(theta);
      f5[i3 + 1] = r * Math.abs(Math.cos(phi)) * 1.4 - 0.2;
      f5[i3 + 2] = r * sinPhi * Math.sin(theta);
    }

    formationsRef.current = [f0, f1, f2, f3, f4, f5];

    // Current positions buffer initialized to f0
    const currentPositions = new Float32Array(f0);
    currentPositionsRef.current = currentPositions;

    // Buffer Geometry for points
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(currentPositions, 3));

    // Particle Colors (Electric Blue + Amber accent)
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const colorA = new THREE.Color(0x2e45ff); // Ultramarine Blue
    const colorB = new THREE.Color(0xff8f2e); // Amber Glow
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
    pointsRef.current = points;

    // 5. Connecting Network Lines in a Group
    const latticeGroup = new THREE.Group();
    scene.add(latticeGroup);
    latticeGroupRef.current = latticeGroup;

    // Mouse move parallax listener
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = x * 0.45;
      mouseRef.current.targetY = y * 0.45;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Resize listener
    const onResize = () => {
      if (!canvas || !canvas.parentElement || !cameraRef.current || !rendererRef.current) return;
      const newW = canvas.parentElement.clientWidth;
      const newH = canvas.parentElement.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener("resize", onResize);

    // 6. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Rotate scene with scroll and time
      if (coreMeshRef.current && ringMeshRef.current && pointsRef.current) {
        const baseSpin = scrollY * 0.0018;

        pointsRef.current.rotation.y = elapsed * 0.08 + baseSpin + mouseRef.current.x * 0.4;
        pointsRef.current.rotation.x = Math.sin(elapsed * 0.1) * 0.1 + mouseRef.current.y * 0.3;

        coreMeshRef.current.rotation.y = -elapsed * 0.25 - baseSpin;
        coreMeshRef.current.rotation.z = Math.cos(elapsed * 0.15) * 0.2;

        ringMeshRef.current.rotation.x = 1.1 + Math.sin(elapsed * 0.12) * 0.1;
        ringMeshRef.current.rotation.y = elapsed * 0.15 + baseSpin;
      }

      // Continuous morphology interpolation between current and target formation
      if (currentPositionsRef.current && pointsRef.current && formationsRef.current.length > 0) {
        const chap = Math.max(0, Math.min(5, currentChapter));
        const idxLow = Math.floor(chap);
        const idxHigh = Math.min(formationsRef.current.length - 1, idxLow + 1);
        const mix = chap - idxLow;

        const targetA = formationsRef.current[idxLow];
        const targetB = formationsRef.current[idxHigh];
        const current = currentPositionsRef.current;

        for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
          const target = targetA[i] * (1 - mix) + targetB[i] * mix;
          current[i] += (target - current[i]) * 0.08;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Camera parallax drift
      if (cameraRef.current) {
        cameraRef.current.position.x = mouseRef.current.x * 0.8;
        cameraRef.current.position.y = mouseRef.current.y * 0.8;
        cameraRef.current.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      pointsGeo.dispose();
      pointsMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ pointerEvents: "none" }}
    />
  );
};

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface StudentPathCanvas3DProps {
  scrollProgress: number; // 0.0 to 1.0
  activeMilestoneIndex: number; // 0 to 4
  onSelectMilestone?: (index: number) => void;
  className?: string;
  isReducedMotion?: boolean;
}

export const MILESTONES = [
  { id: "course-selection", label: "1. Choose Course", color: 0x2563eb },
  { id: "admissions", label: "2. Get Admission", color: 0x4f46e5 },
  { id: "study-abroad", label: "3. Study Abroad", color: 0x0284c7 },
  { id: "internships", label: "4. Land Internship", color: 0x10b981 },
  { id: "placements", label: "5. Get Placed", color: 0xd97706 },
];

export const StudentPathCanvas3D: React.FC<StudentPathCanvas3DProps> = ({
  scrollProgress,
  activeMilestoneIndex,
  onSelectMilestone,
  className = "w-full h-full",
  isReducedMotion = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;
  const activeIdxRef = useRef(activeMilestoneIndex);
  activeIdxRef.current = activeMilestoneIndex;

  useEffect(() => {
    const container = mountRef.current;
    if (!container || isReducedMotion) return;

    // Safety WebGL check
    try {
      const test = document.createElement("canvas");
      const gl = test.getContext("webgl") || test.getContext("experimental-webgl");
      if (!gl) return;
    } catch {
      return;
    }

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 500;

    // Three.js Scene Setup (Clean, Bright Education App Style)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.02);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(2.8, 3.2, 19);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0xf8fafc, 0);
    container.appendChild(renderer.domElement);

    const disposables: { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] }[] = [];
    const track = <T extends THREE.Object3D>(obj: T): T => {
      if ((obj as any).geometry) disposables.push({ geometry: (obj as any).geometry });
      if ((obj as any).material) disposables.push({ material: (obj as any).material });
      return obj;
    };

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(10, 20, 15);
    scene.add(sunLight);

    const accentLight = new THREE.PointLight(0x2563eb, 2.0, 30);
    accentLight.position.set(0, 4, 10);
    scene.add(accentLight);

    // ─────────────────────────────────────────────────────────────
    // The Winding Career Pathway (Smooth Curve)
    // ─────────────────────────────────────────────────────────────
    const pathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 20),
      new THREE.Vector3(-1.2, 0.2, 14),   // Milestone 0: Choose Course
      new THREE.Vector3(1.2, 0.4, 6),     // Milestone 1: Get Admission
      new THREE.Vector3(-1.4, 0.6, -2),   // Milestone 2: Study Abroad
      new THREE.Vector3(1.0, 0.8, -10),   // Milestone 3: Land Internship
      new THREE.Vector3(0, 1.0, -18),     // Milestone 4: Get Placed
    ]);

    // Road Tube
    const roadGeom = track(new THREE.TubeGeometry(pathCurve, 80, 0.9, 12, false));
    const roadMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.6,
        metalness: 0.1,
      })
    );
    const road = new THREE.Mesh(roadGeom, roadMat);
    road.scale.set(1, 0.2, 1);
    scene.add(road);

    // Center Royal Blue Lane Line
    const centerLineGeom = track(new THREE.TubeGeometry(pathCurve, 80, 0.1, 8, false));
    const centerLineMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        roughness: 0.3,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.5,
      })
    );
    const centerLine = new THREE.Mesh(centerLineGeom, centerLineMat);
    centerLine.position.y = 0.03;
    scene.add(centerLine);

    // ─────────────────────────────────────────────────────────────
    // Milestone Markers (Pillars with Rounded Indicator Heads)
    // ─────────────────────────────────────────────────────────────
    const milestonePoints = [
      new THREE.Vector3(-1.2, 0.2, 14),
      new THREE.Vector3(1.2, 0.4, 6),
      new THREE.Vector3(-1.4, 0.6, -2),
      new THREE.Vector3(1.0, 0.8, -10),
      new THREE.Vector3(0, 1.0, -18),
    ];

    const milestoneMeshes: THREE.Group[] = [];

    milestonePoints.forEach((pt, idx) => {
      const markerGroup = new THREE.Group();
      markerGroup.position.copy(pt);

      // Base Pillar (Clean rounded white cylinder)
      const baseGeom = track(new THREE.CylinderGeometry(0.35, 0.45, 1.4, 16));
      const baseMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.1,
        })
      );
      const baseMesh = new THREE.Mesh(baseGeom, baseMat);
      baseMesh.position.y = 0.7;
      markerGroup.add(baseMesh);

      // Milestone Spherical Orb with Royal Blue / Amber accents
      const orbGeom = track(new THREE.SphereGeometry(0.55, 24, 24));
      const orbMat = track(
        new THREE.MeshStandardMaterial({
          color: idx === 4 ? 0xf59e0b : 0x2563eb,
          emissive: idx === 4 ? 0xd97706 : 0x1d4ed8,
          emissiveIntensity: 0.6,
          roughness: 0.2,
          metalness: 0.4,
        })
      );
      const orbMesh = new THREE.Mesh(orbGeom, orbMat);
      orbMesh.position.y = 1.6;
      markerGroup.add(orbMesh);

      // Outer Pulse Halo Ring
      const ringGeom = track(new THREE.TorusGeometry(0.75, 0.05, 12, 32));
      const ringMat = track(
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.4,
          transparent: true,
          opacity: 0.7,
        })
      );
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 1.6;
      markerGroup.add(ringMesh);

      scene.add(markerGroup);
      milestoneMeshes.push(markerGroup);
    });

    // ─────────────────────────────────────────────────────────────
    // Floating Mentor Avatars (Circular Photo Frames beside Road)
    // ─────────────────────────────────────────────────────────────
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    const textureLoader = new THREE.TextureLoader();
    const avatarUrls = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    ];

    const avatarMeshes: THREE.Mesh[] = [];

    avatarUrls.forEach((url, i) => {
      textureLoader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const frameGeom = track(new THREE.CylinderGeometry(0.65, 0.65, 0.08, 32));
        const frameMat = track(
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.2,
          })
        );
        const frame = new THREE.Mesh(frameGeom, frameMat);
        frame.rotation.x = Math.PI / 2;

        const photoGeom = track(new THREE.CircleGeometry(0.58, 32));
        const photoMat = track(
          new THREE.MeshBasicMaterial({
            map: tex,
          })
        );
        const photo = new THREE.Mesh(photoGeom, photoMat);
        photo.position.z = 0.05;
        frame.add(photo);

        frame.position.set(i === 0 ? 1.6 : i === 1 ? -1.8 : 1.8, 2.2 + i * 0.8, 14 - i * 4);
        avatarGroup.add(frame);
        avatarMeshes.push(frame);
      });
    });

    // ─────────────────────────────────────────────────────────────
    // Animation Loop
    // ─────────────────────────────────────────────────────────────
    let animId: number;
    let currentCamZ = 19;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera progression along the winding path based on scroll
      const targetCamZ = 19 - scrollRef.current * 35;
      currentCamZ += (targetCamZ - currentCamZ) * 0.08;

      camera.position.z = currentCamZ;
      camera.position.y = 3.2 + Math.sin(scrollRef.current * Math.PI * 4) * 0.3;
      camera.position.x = 2.4 + Math.sin(scrollRef.current * Math.PI * 2) * 0.8;
      camera.lookAt(0, 1.0, currentCamZ - 8);

      accentLight.position.z = currentCamZ - 2;

      // Animate Milestone Orbs & Active Pulse
      const activeIdx = activeIdxRef.current;
      milestoneMeshes.forEach((m, idx) => {
        const ring = m.children[2] as THREE.Mesh;
        if (ring) {
          ring.rotation.z = elapsed * 1.5;
        }

        const orb = m.children[1] as THREE.Mesh;
        if (orb) {
          if (idx === activeIdx) {
            orb.scale.setScalar(1.2 + Math.sin(elapsed * 4) * 0.1);
          } else {
            orb.scale.setScalar(1.0);
          }
        }
      });

      // Gently float mentor avatars
      avatarMeshes.forEach((av, i) => {
        av.position.y += Math.sin(elapsed * 2 + i) * 0.003;
        av.rotation.y = Math.sin(elapsed + i) * 0.1;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);

      disposables.forEach((item) => {
        if (item.geometry) item.geometry.dispose();
        if (item.material) {
          if (Array.isArray(item.material)) {
            item.material.forEach((m) => m.dispose());
          } else {
            item.material.dispose();
          }
        }
      });

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isReducedMotion]);

  if (isReducedMotion) {
    // 2D Accessible Progress Stepper Fallback
    return (
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-left">
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-royal-600 text-blue-600">
          Career Roadmap Stepper
        </p>
        <div className="space-y-2">
          {MILESTONES.map((m, i) => (
            <button
              key={m.id}
              onClick={() => onSelectMilestone && onSelectMilestone(i)}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                i === activeMilestoneIndex
                  ? "bg-blue-50 text-blue-700 border border-blue-200 font-bold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{m.label}</span>
              {i === activeMilestoneIndex && <span className="h-2 w-2 rounded-full bg-blue-600" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface AnimeScrollCanvas3DProps {
  scrollProgress: number; // 0.0 to 1.0
  className?: string;
}

export const AnimeScrollCanvas3D: React.FC<AnimeScrollCanvas3DProps> = ({
  scrollProgress,
  className = "fixed inset-0 pointer-events-none z-0",
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Safety check for WebGL
    try {
      const test = document.createElement("canvas");
      const gl = test.getContext("webgl") || test.getContext("experimental-webgl");
      if (!gl) return;
    } catch {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060e, 0.012);

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 1000);
    camera.position.set(0, 2, 40);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Master Group for 3D world
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // ─────────────────────────────────────────────────────────────
    // 1. Perspective Cyber Grid Floor (Infinite Horizon)
    // ─────────────────────────────────────────────────────────────
    const gridHelper = new THREE.GridHelper(300, 80, 0x10b981, 0x064e3b);
    gridHelper.position.y = -7;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.35;
    worldGroup.add(gridHelper);

    // Ceiling inverted subtle grid
    const ceilingGrid = new THREE.GridHelper(300, 80, 0x8b5cf6, 0x1e1b4b);
    ceilingGrid.position.y = 18;
    ceilingGrid.material.transparent = true;
    ceilingGrid.material.opacity = 0.2;
    worldGroup.add(ceilingGrid);

    // ─────────────────────────────────────────────────────────────
    // 2. Stage Waypoint Sculptures in 3D Space
    // ─────────────────────────────────────────────────────────────

    // Stage 1 Sculpture (Z: 22) - Cyber Hologram Nexus Gem
    const gemGroup = new THREE.Group();
    gemGroup.position.set(0, 2, 22);
    worldGroup.add(gemGroup);

    const gemGeom = new THREE.IcosahedronGeometry(4.2, 0);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      emissive: 0x047857,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    const nexusGem = new THREE.Mesh(gemGeom, gemMat);
    gemGroup.add(nexusGem);

    const gemCageGeom = new THREE.IcosahedronGeometry(4.35, 1);
    const gemCageMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const nexusCage = new THREE.Mesh(gemCageGeom, gemCageMat);
    gemGroup.add(nexusCage);

    // Orbiting rings around Nexus
    const ringGeom = new THREE.TorusGeometry(6.5, 0.07, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
    });
    const nexusRing1 = new THREE.Mesh(ringGeom, ringMat);
    nexusRing1.rotation.x = Math.PI / 3;
    gemGroup.add(nexusRing1);

    const nexusRing2 = new THREE.Mesh(ringGeom, ringMat.clone());
    (nexusRing2.material as THREE.MeshStandardMaterial).color.setHex(0x8b5cf6);
    (nexusRing2.material as THREE.MeshStandardMaterial).emissive.setHex(0x7c3aed);
    nexusRing2.rotation.y = Math.PI / 3;
    gemGroup.add(nexusRing2);

    // Stage 2 Sculpture (Z: -15) - 3D Discipline Gyroscope & Floating Crystal Monoliths
    const discGroup = new THREE.Group();
    discGroup.position.set(0, 2, -15);
    worldGroup.add(discGroup);

    const centerCoreGeom = new THREE.SphereGeometry(2.5, 32, 32);
    const centerCoreMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      metalness: 0.9,
      roughness: 0.1,
    });
    const centerCore = new THREE.Mesh(centerCoreGeom, centerCoreMat);
    discGroup.add(centerCore);

    // 5 orbiting discipline satellites
    const satelliteNodes: { mesh: THREE.Mesh; angle: number; radius: number; speed: number; y: number }[] = [];
    const colors = [0x10b981, 0x06b6d4, 0x8b5cf6, 0xf59e0b, 0xec4899];

    colors.forEach((c, i) => {
      const satGeom = new THREE.OctahedronGeometry(1.2, 0);
      const satMat = new THREE.MeshStandardMaterial({
        color: c,
        emissive: c,
        emissiveIntensity: 0.9,
        metalness: 0.8,
        roughness: 0.2,
      });
      const satMesh = new THREE.Mesh(satGeom, satMat);
      discGroup.add(satMesh);
      satelliteNodes.push({
        mesh: satMesh,
        angle: (i / colors.length) * Math.PI * 2,
        radius: 9.5,
        speed: 0.012 + i * 0.002,
        y: (i - 2) * 1.5,
      });
    });

    // Stage 3 Sculpture (Z: -55) - 3D Mentor Portal Gateways
    const mentorsGroup = new THREE.Group();
    mentorsGroup.position.set(0, 2, -55);
    worldGroup.add(mentorsGroup);

    // Two monumental high-tech portal pillars
    const pillarGeom = new THREE.BoxGeometry(0.8, 16, 0.8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
    });
    const leftPillar = new THREE.Mesh(pillarGeom, pillarMat);
    leftPillar.position.set(-14, 0, 0);
    mentorsGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeom, pillarMat);
    rightPillar.position.set(14, 0, 0);
    mentorsGroup.add(rightPillar);

    // Floating beam between pillars
    const beamGeom = new THREE.CylinderGeometry(0.08, 0.08, 28, 16);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.7 });
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.y = 8;
    mentorsGroup.add(beam);

    // Stage 4 Sculpture (Z: -95) - 3D Cyber Security Shield Matrix
    const shieldGroup = new THREE.Group();
    shieldGroup.position.set(0, 2, -95);
    worldGroup.add(shieldGroup);

    const shieldGeom = new THREE.ConeGeometry(4.5, 7, 6);
    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.15,
      transparent: true,
      opacity: 0.8,
      wireframe: true,
    });
    const shieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
    shieldMesh.rotation.x = Math.PI;
    shieldGroup.add(shieldMesh);

    // Outer shield forcefield rings
    const forcefieldGeom = new THREE.TorusGeometry(7.2, 0.06, 16, 100);
    const forcefieldMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.5 });
    const forcefieldRing = new THREE.Mesh(forcefieldGeom, forcefieldMat);
    shieldGroup.add(forcefieldRing);

    // Stage 5 Sculpture (Z: -135) - Final 3D Hyper-Warp Gateway (At Last)
    const warpGroup = new THREE.Group();
    warpGroup.position.set(0, 2, -135);
    worldGroup.add(warpGroup);

    const warpRingGeom = new THREE.TorusGeometry(12, 0.25, 24, 120);
    const warpRingMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.5,
      metalness: 0.9,
      roughness: 0.1,
    });
    const warpRing = new THREE.Mesh(warpRingGeom, warpRingMat);
    warpGroup.add(warpRing);

    const innerWarpGeom = new THREE.TorusGeometry(9.5, 0.15, 20, 100);
    const innerWarpMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true });
    const innerWarpRing = new THREE.Mesh(innerWarpGeom, innerWarpMat);
    warpGroup.add(innerWarpRing);

    // ─────────────────────────────────────────────────────────────
    // 3. Volumetric Hyperspace Particle Field (1,800 Stars)
    // ─────────────────────────────────────────────────────────────
    const particleCount = 1800;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const pColor1 = new THREE.Color(0x10b981);
    const pColor2 = new THREE.Color(0x06b6d4);
    const pColor3 = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 80;
      particlePositions[i + 1] = (Math.random() - 0.5) * 60 + 4;
      // Stretched along the entire depth of the travel path from z = 50 to z = -160
      particlePositions[i + 2] = (Math.random() - 0.5) * 220 - 50;

      const r = Math.random();
      const col = r < 0.45 ? pColor1 : r < 0.8 ? pColor2 : pColor3;
      particleColors[i] = col.r;
      particleColors[i + 1] = col.g;
      particleColors[i + 2] = col.b;
    }

    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeom.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // ─────────────────────────────────────────────────────────────
    // 4. Lights that ride with the camera
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const camLightEmerald = new THREE.PointLight(0x10b981, 5.0, 45);
    scene.add(camLightEmerald);

    const camLightCyan = new THREE.PointLight(0x06b6d4, 4.0, 40);
    scene.add(camLightCyan);

    const camLightViolet = new THREE.PointLight(0x8b5cf6, 4.0, 40);
    scene.add(camLightViolet);

    // ─────────────────────────────────────────────────────────────
    // 5. Parallax Mouse / Pointer Tracking
    // ─────────────────────────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handlePointerMove);

    // Resize handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // ─────────────────────────────────────────────────────────────
    // 6. Animation Loop with Dynamic 3D Camera Travel
    // ─────────────────────────────────────────────────────────────
    let animId: number;
    let currentCamZ = 40;
    let currentProgressLerp = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth lerp scroll progress
      const targetP = scrollRef.current;
      currentProgressLerp += (targetP - currentProgressLerp) * 0.085;

      // Camera travels through 3D space: from Z = 38 (start) down to Z = -135 (end)
      const targetZ = 38 - currentProgressLerp * 168;
      currentCamZ += (targetZ - currentCamZ) * 0.085;
      camera.position.z = currentCamZ;

      // Natural undulating flight curve
      camera.position.y = 2 + Math.sin(currentProgressLerp * Math.PI * 3) * 1.5;
      camera.position.x = Math.sin(currentProgressLerp * Math.PI * 2) * 2.2;

      // Parallax mouse follow
      targetMouseX += (mouseX - targetMouseX) * 0.05;
      targetMouseY += (mouseY - targetMouseY) * 0.05;

      camera.rotation.y = -targetMouseX * 0.12 - Math.sin(currentProgressLerp * Math.PI) * 0.08;
      camera.rotation.x = -targetMouseY * 0.1 + (currentProgressLerp - 0.5) * 0.05;

      // Keep lights centered around current camera position
      camLightEmerald.position.set(camera.position.x + 6, camera.position.y + 4, camera.position.z - 8);
      camLightCyan.position.set(camera.position.x - 6, camera.position.y - 3, camera.position.z - 12);
      camLightViolet.position.set(camera.position.x, camera.position.y + 6, camera.position.z - 15);

      // Animate Sculptures
      // Nexus Gem (Stage 1)
      nexusGem.rotation.x = elapsedTime * 0.4;
      nexusGem.rotation.y = elapsedTime * 0.6;
      nexusCage.rotation.x = elapsedTime * 0.4;
      nexusCage.rotation.y = elapsedTime * 0.6;
      nexusRing1.rotation.z = elapsedTime * 0.5;
      nexusRing2.rotation.x = -elapsedTime * 0.5;

      // Gyroscope & Satellites (Stage 2)
      centerCore.rotation.y = elapsedTime * 0.8;
      satelliteNodes.forEach((node) => {
        node.angle += node.speed;
        node.mesh.position.x = Math.cos(node.angle) * node.radius;
        node.mesh.position.z = Math.sin(node.angle) * node.radius;
        node.mesh.position.y = node.y + Math.sin(elapsedTime * 2 + node.angle) * 0.8;
        node.mesh.rotation.x += 0.03;
        node.mesh.rotation.y += 0.04;
      });

      // Mentor Gateways (Stage 3)
      leftPillar.rotation.y = elapsedTime * 0.2;
      rightPillar.rotation.y = -elapsedTime * 0.2;

      // Security Shield (Stage 4)
      shieldMesh.rotation.y = elapsedTime * 0.4;
      forcefieldRing.rotation.z = elapsedTime * 0.3;
      forcefieldRing.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2;

      // Final Hyper-Warp Gateway (Stage 5)
      warpRing.rotation.z = elapsedTime * 0.6;
      innerWarpRing.rotation.z = -elapsedTime * 0.8;

      // Hyperspace Particle Flight
      const positions = particleGeom.attributes.position.array as Float32Array;
      for (let i = 2; i < particleCount * 3; i += 3) {
        // Move particles toward camera faster when scrolling
        positions[i] += 0.15 + currentProgressLerp * 0.35;
        if (positions[i] > camera.position.z + 10) {
          positions[i] = camera.position.z - 180;
        }
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Endless grid horizon illusion
      gridHelper.position.z = Math.floor(camera.position.z / 20) * 20;
      ceilingGrid.position.z = gridHelper.position.z;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("resize", handleResize);

      try {
        gemGeom.dispose();
        gemMat.dispose();
        gemCageGeom.dispose();
        gemCageMat.dispose();
        ringGeom.dispose();
        ringMat.dispose();
        centerCoreGeom.dispose();
        centerCoreMat.dispose();
        particleGeom.dispose();
        particleMat.dispose();
        warpRingGeom.dispose();
        warpRingMat.dispose();
        innerWarpGeom.dispose();
        innerWarpMat.dispose();
        shieldGeom.dispose();
        shieldMat.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      } catch {
        // Ignored
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`overflow-hidden select-none pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

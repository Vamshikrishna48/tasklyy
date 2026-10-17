import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";

interface SceneProps {
  scrollProgress: number; // 0.0 to 1.0
  className?: string;
  onLoaded?: () => void;
}

export const Scene: React.FC<SceneProps> = ({
  scrollProgress,
  className = "fixed inset-0 pointer-events-none z-0",
  onLoaded,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Safety WebGL check
    try {
      const test = document.createElement("canvas");
      const gl = test.getContext("webgl") || test.getContext("experimental-webgl");
      if (!gl) {
        if (onLoaded) onLoaded();
        return;
      }
    } catch {
      if (onLoaded) onLoaded();
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Three.js Scene Setup (Deep Midnight Navy & Tasskly Atmosphere)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020817, 0.009);

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1000);
    camera.position.set(0, 2.2, 36);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Camera Rig instance for smooth spline navigation
    const cameraRig = new CameraRig(camera);

    // Resource tracking for leak-free disposal
    const disposables: { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] }[] = [];
    const track = <T extends THREE.Object3D>(obj: T): T => {
      if ((obj as any).geometry) disposables.push({ geometry: (obj as any).geometry });
      if ((obj as any).material) disposables.push({ material: (obj as any).material });
      return obj;
    };

    // ─────────────────────────────────────────────────────────────
    // 1. Perspective Horizon Grid Floor & Ceiling
    // ─────────────────────────────────────────────────────────────
    const gridHelper = track(new THREE.GridHelper(450, 110, 0x10b981, 0x0284c7));
    gridHelper.position.y = -8.5;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.32;
    worldGroup.add(gridHelper);

    const ceilingGrid = track(new THREE.GridHelper(450, 110, 0x38bdf8, 0x064e3b));
    ceilingGrid.position.y = 20;
    (ceilingGrid.material as THREE.Material).transparent = true;
    (ceilingGrid.material as THREE.Material).opacity = 0.18;
    worldGroup.add(ceilingGrid);

    // ─────────────────────────────────────────────────────────────
    // 2. STAGE 1 (HERO): 3D Floating Task Card & Workflow Gyroscope (Z: 22)
    // ─────────────────────────────────────────────────────────────
    const heroStage = new THREE.Group();
    heroStage.position.set(0, 1.8, 22);
    worldGroup.add(heroStage);

    // 3D Translucent Task Card Base
    const cardGeom = new THREE.BoxGeometry(7.2, 4.6, 0.35);
    const cardMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      emissive: 0x0369a1,
      emissiveIntensity: 0.45,
      metalness: 0.85,
      roughness: 0.1,
      transmission: 0.75,
      transparent: true,
      opacity: 0.85,
    });
    const taskCardMesh = track(new THREE.Mesh(cardGeom, cardMat));
    taskCardMesh.rotation.x = -0.15;
    taskCardMesh.rotation.y = 0.25;
    heroStage.add(taskCardMesh);

    // Glowing Task Progress Bar on Card
    const barGeom = new THREE.BoxGeometry(5.8, 0.28, 0.4);
    const barMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.5,
      metalness: 0.9,
    });
    const progressBar = track(new THREE.Mesh(barGeom, barMat));
    progressBar.position.set(0, 1.2, 0.05);
    taskCardMesh.add(progressBar);

    // Status Checkbox Badges on Card
    for (let i = 0; i < 3; i++) {
      const rowGeom = new THREE.BoxGeometry(5.2, 0.5, 0.38);
      const rowMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: i === 0 ? 0x10b981 : 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const rowMesh = track(new THREE.Mesh(rowGeom, rowMat));
      rowMesh.position.set(0, 0.2 - i * 0.9, 0.04);
      taskCardMesh.add(rowMesh);
    }

    // Outer Workflow Gyroscope Rings (Tasskly Emerald & Sky Blue)
    const gyroRing1Geom = new THREE.TorusGeometry(6.4, 0.08, 16, 120);
    const gyroRing1Mat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.2,
      metalness: 0.95,
      roughness: 0.15,
    });
    const gyroRing1 = track(new THREE.Mesh(gyroRing1Geom, gyroRing1Mat));
    gyroRing1.rotation.x = Math.PI / 3;
    heroStage.add(gyroRing1);

    const gyroRing2Geom = new THREE.TorusGeometry(7.4, 0.07, 16, 120);
    const gyroRing2Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.1,
      metalness: 0.95,
      roughness: 0.15,
    });
    const gyroRing2 = track(new THREE.Mesh(gyroRing2Geom, gyroRing2Mat));
    gyroRing2.rotation.y = Math.PI / 3.5;
    heroStage.add(gyroRing2);

    // 10 Connected Workflow Nodes
    const networkNodesGroup = new THREE.Group();
    heroStage.add(networkNodesGroup);

    const nodeCount = 10;
    const nodeSpheres: { mesh: THREE.Mesh; angle: number; radius: number; speed: number; y: number }[] = [];
    const nodeGeom = new THREE.SphereGeometry(0.38, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 1.6,
      metalness: 0.85,
    });

    for (let i = 0; i < nodeCount; i++) {
      const nodeMesh = track(new THREE.Mesh(nodeGeom, nodeMat));
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 8.0 + Math.sin(i * 1.5) * 1.8;
      const y = Math.sin(i * 2.2) * 2.8;
      nodeMesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      networkNodesGroup.add(nodeMesh);
      nodeSpheres.push({ mesh: nodeMesh, angle, radius, speed: 0.005 + (i % 3) * 0.003, y });
    }

    // Dynamic Connecting Workflow Splines
    const lineGeom = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    });
    const connectionLines = new THREE.LineSegments(lineGeom, lineMat);
    networkNodesGroup.add(connectionLines);

    // ─────────────────────────────────────────────────────────────
    // 3. STAGE 2 (SERVICES): 6 Spatial Service Hub Cubes (Z: -12)
    // ─────────────────────────────────────────────────────────────
    const servicesStage = new THREE.Group();
    servicesStage.position.set(0, 1.8, -12);
    worldGroup.add(servicesStage);

    const serviceNodes: { mesh: THREE.Mesh; angle: number; radius: number; speed: number; y: number }[] = [];
    const serviceGeom = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const serviceColors = [0x10b981, 0x0ea5e9, 0x38bdf8, 0x14b8a6, 0x6366f1, 0x06b6d4];

    for (let i = 0; i < 6; i++) {
      const sMat = new THREE.MeshStandardMaterial({
        color: serviceColors[i],
        emissive: serviceColors[i],
        emissiveIntensity: 0.85,
        metalness: 0.85,
        roughness: 0.2,
      });
      const sMesh = track(new THREE.Mesh(serviceGeom, sMat));
      const angle = (i / 6) * Math.PI * 2;
      const radius = 7.5;
      const y = Math.sin(i * 1.5) * 2.2;
      sMesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      servicesStage.add(sMesh);
      serviceNodes.push({ mesh: sMesh, angle, radius, speed: 0.006, y });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. STAGE 3 (PROCESS): 4 Glowing Timeline Nodes & Rail (Z: -48)
    // ─────────────────────────────────────────────────────────────
    const processStage = new THREE.Group();
    processStage.position.set(0, 1.8, -48);
    worldGroup.add(processStage);

    const railGeom = new THREE.CylinderGeometry(0.12, 0.12, 26, 16);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x047857,
      emissiveIntensity: 1.2,
      metalness: 0.9,
    });
    const rail = track(new THREE.Mesh(railGeom, railMat));
    rail.rotation.z = Math.PI / 2;
    processStage.add(rail);

    const stepColors = [0x38bdf8, 0x10b981, 0x0ea5e9, 0x34d399];
    const stepNodes: THREE.Mesh[] = [];

    for (let i = 0; i < 4; i++) {
      const x = -10.5 + i * 7;
      const sNodeGeom = new THREE.TorusGeometry(1.4, 0.22, 16, 32);
      const sNodeMat = new THREE.MeshStandardMaterial({
        color: stepColors[i],
        emissive: stepColors[i],
        emissiveIntensity: 1.3,
        metalness: 0.85,
      });
      const sNode = track(new THREE.Mesh(sNodeGeom, sNodeMat));
      sNode.position.set(x, 0, 0);
      processStage.add(sNode);
      stepNodes.push(sNode);

      const coreDotGeom = new THREE.SphereGeometry(0.55, 16, 16);
      const coreDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const coreDot = track(new THREE.Mesh(coreDotGeom, coreDotMat));
      coreDot.position.set(x, 0, 0);
      processStage.add(coreDot);
    }

    // ─────────────────────────────────────────────────────────────
    // 5. STAGE 4 (RESULTS): 3D Metric Hologram Pillars (Z: -90)
    // ─────────────────────────────────────────────────────────────
    const resultsStage = new THREE.Group();
    resultsStage.position.set(0, 1.5, -90);
    worldGroup.add(resultsStage);

    const metricPillars: THREE.Mesh[] = [];
    const metricHeights = [5.5, 7.8, 6.4];

    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 6.5;
      const h = metricHeights[i];
      const pGeom = new THREE.CylinderGeometry(1.2, 1.2, h, 24);
      const pMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: i === 1 ? 0x10b981 : 0x0284c7,
        emissiveIntensity: 0.9,
        metalness: 0.9,
        roughness: 0.2,
        transparent: true,
        opacity: 0.85,
      });
      const pMesh = track(new THREE.Mesh(pGeom, pMat));
      pMesh.position.set(x, h / 2 - 2, 0);
      resultsStage.add(pMesh);
      metricPillars.push(pMesh);

      // Top glowing indicator ring
      const ringGeom = new THREE.TorusGeometry(1.5, 0.12, 16, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const ring = track(new THREE.Mesh(ringGeom, ringMat));
      ring.position.set(x, h - 2, 0);
      ring.rotation.x = Math.PI / 2;
      resultsStage.add(ring);
    }

    // ─────────────────────────────────────────────────────────────
    // 6. STAGE 5 (PRICING): 3 Engagement Pedestals (Z: -140)
    // ─────────────────────────────────────────────────────────────
    const pricingStage = new THREE.Group();
    pricingStage.position.set(0, 1.5, -140);
    worldGroup.add(pricingStage);

    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 8.0;
      const pedGeom = new THREE.CylinderGeometry(2.4, 2.8, 1.2, 32);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: i === 1 ? 0x10b981 : 0x0369a1,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.2,
      });
      const ped = track(new THREE.Mesh(pedGeom, pedMat));
      ped.position.set(x, -0.6, 0);
      pricingStage.add(ped);

      const symbolGeom = new THREE.OctahedronGeometry(1.1, 0);
      const symbolMat = new THREE.MeshStandardMaterial({
        color: i === 1 ? 0xfbbf24 : 0x38bdf8,
        emissive: i === 1 ? 0xd97706 : 0x0284c7,
        emissiveIntensity: 1.2,
        metalness: 0.9,
      });
      const symbol = track(new THREE.Mesh(symbolGeom, symbolMat));
      symbol.position.set(x, 1.8, 0);
      pricingStage.add(symbol);
    }

    // ─────────────────────────────────────────────────────────────
    // 7. STAGE 6 (TESTIMONIALS): Rotating Ring of Cards (Z: -185)
    // ─────────────────────────────────────────────────────────────
    const testimonialsStage = new THREE.Group();
    testimonialsStage.position.set(0, 1.8, -185);
    worldGroup.add(testimonialsStage);

    const testimonialCards: THREE.Mesh[] = [];
    const tCardGeom = new THREE.BoxGeometry(3.6, 2.4, 0.15);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 8.5;
      const tCardMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x10b981,
        emissiveIntensity: 0.5,
        metalness: 0.85,
        roughness: 0.2,
        transparent: true,
        opacity: 0.8,
      });
      const tCard = track(new THREE.Mesh(tCardGeom, tCardMat));
      tCard.position.set(Math.cos(angle) * radius, Math.sin(i * 1.2) * 1.2, Math.sin(angle) * radius);
      tCard.rotation.y = -angle + Math.PI / 2;
      testimonialsStage.add(tCard);
      testimonialCards.push(tCard);
    }

    // ─────────────────────────────────────────────────────────────
    // 8. STAGE 7 (FINAL CTA): Grand Warp Archway (Z: -230)
    // ─────────────────────────────────────────────────────────────
    const gatewayStage = new THREE.Group();
    gatewayStage.position.set(0, 2, -230);
    worldGroup.add(gatewayStage);

    const colGeom = new THREE.CylinderGeometry(1.1, 1.3, 24, 24);
    const colMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x064e3b,
      emissiveIntensity: 0.6,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: true,
    });
    const leftCol = track(new THREE.Mesh(colGeom, colMat));
    leftCol.position.set(-14, 3, 0);
    gatewayStage.add(leftCol);

    const rightCol = track(new THREE.Mesh(colGeom, colMat));
    rightCol.position.set(14, 3, 0);
    gatewayStage.add(rightCol);

    const archBeamGeom = new THREE.BoxGeometry(30, 2.6, 3.0);
    const archBeamMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x047857,
      emissiveIntensity: 0.8,
      metalness: 0.9,
    });
    const archBeam = track(new THREE.Mesh(archBeamGeom, archBeamMat));
    archBeam.position.set(0, 15, 0);
    gatewayStage.add(archBeam);

    const warpRingGeom = new THREE.TorusGeometry(12, 0.26, 24, 120);
    const warpRingMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x10b981,
      emissiveIntensity: 1.5,
      metalness: 0.9,
    });
    const warpRing = track(new THREE.Mesh(warpRingGeom, warpRingMat));
    warpRing.position.y = 3;
    gatewayStage.add(warpRing);

    // ─────────────────────────────────────────────────────────────
    // 9. Volumetric Star Particle Field (2,200 Stars)
    // ─────────────────────────────────────────────────────────────
    const particleCount = 2200;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const pColor1 = new THREE.Color(0x10b981); // Emerald
    const pColor2 = new THREE.Color(0x38bdf8); // Sky Blue
    const pColor3 = new THREE.Color(0x14b8a6); // Teal
    const pColor4 = new THREE.Color(0x0284c7); // Deep Blue

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 95;
      particlePositions[i + 1] = (Math.random() - 0.5) * 70 + 4;
      particlePositions[i + 2] = (Math.random() - 0.5) * 280 - 80;

      const r = Math.random();
      const col = r < 0.35 ? pColor1 : r < 0.65 ? pColor2 : r < 0.85 ? pColor3 : pColor4;
      particleColors[i] = col.r;
      particleColors[i + 1] = col.g;
      particleColors[i + 2] = col.b;
    }

    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeom.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = track(
      new THREE.PointsMaterial({
        size: 0.24,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      })
    );
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // ─────────────────────────────────────────────────────────────
    // 10. Lights Tracking Camera
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const camLightEmerald = new THREE.PointLight(0x10b981, 5.0, 48);
    scene.add(camLightEmerald);

    const camLightSky = new THREE.PointLight(0x38bdf8, 4.5, 45);
    scene.add(camLightSky);

    // ─────────────────────────────────────────────────────────────
    // 11. Mouse & Resize Handlers
    // ─────────────────────────────────────────────────────────────
    const handlePointerMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      cameraRig.updateMouse(normX, normY);
    };
    window.addEventListener("mousemove", handlePointerMove);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Signal loaded
    if (onLoaded) {
      setTimeout(() => onLoaded(), 150);
    }

    // ─────────────────────────────────────────────────────────────
    // 12. Main 60fps Animation Loop
    // ─────────────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update camera position along 3D spline
      cameraRig.setProgress(scrollRef.current);
      cameraRig.update();

      const currentProgress = cameraRig.getProgress();

      // Lights follow camera position
      camLightEmerald.position.set(camera.position.x + 6, camera.position.y + 4, camera.position.z - 8);
      camLightSky.position.set(camera.position.x - 6, camera.position.y - 3, camera.position.z - 12);

      // Hero Task Card & Gyroscope animations
      taskCardMesh.rotation.y = 0.25 + Math.sin(elapsedTime * 0.8) * 0.12;
      taskCardMesh.position.y = Math.sin(elapsedTime * 1.4) * 0.25;
      gyroRing1.rotation.z = elapsedTime * 0.5;
      gyroRing2.rotation.x = -elapsedTime * 0.45;

      // Hero Network Nodes & Spline Connections
      const linePositions: number[] = [];
      nodeSpheres.forEach((node, i) => {
        node.angle += node.speed;
        node.mesh.position.x = Math.cos(node.angle) * node.radius;
        node.mesh.position.z = Math.sin(node.angle) * node.radius;
        node.mesh.position.y = node.y + Math.sin(elapsedTime * 2 + i) * 0.4;

        linePositions.push(0, 0, 0);
        linePositions.push(node.mesh.position.x, node.mesh.position.y, node.mesh.position.z);

        const nextNode = nodeSpheres[(i + 1) % nodeSpheres.length];
        linePositions.push(node.mesh.position.x, node.mesh.position.y, node.mesh.position.z);
        linePositions.push(nextNode.mesh.position.x, nextNode.mesh.position.y, nextNode.mesh.position.z);
      });
      lineGeom.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));

      // Services Cubes rotation
      serviceNodes.forEach((s) => {
        s.angle += s.speed;
        s.mesh.position.x = Math.cos(s.angle) * s.radius;
        s.mesh.position.z = Math.sin(s.angle) * s.radius;
        s.mesh.rotation.x += 0.02;
        s.mesh.rotation.y += 0.025;
      });

      // Process Timeline Nodes
      stepNodes.forEach((sNode, i) => {
        sNode.rotation.y = elapsedTime * 0.8 + i;
      });

      // Testimonial Ring rotation
      testimonialsStage.rotation.y = elapsedTime * 0.25;

      // Warp Archway
      warpRing.rotation.z = elapsedTime * 0.5;

      // Particle Stream
      const positions = particleGeom.attributes.position.array as Float32Array;
      for (let i = 2; i < particleCount * 3; i += 3) {
        positions[i] += 0.16 + currentProgress * 0.4;
        if (positions[i] > camera.position.z + 10) {
          positions[i] = camera.position.z - 220;
        }
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Endless Grid Illusion
      gridHelper.position.z = (camera.position.z % 4) - 2;
      ceilingGrid.position.z = (camera.position.z % 4) - 2;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handlePointerMove);
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
  }, []);

  return <div ref={mountRef} className={className} />;
};

export default Scene;

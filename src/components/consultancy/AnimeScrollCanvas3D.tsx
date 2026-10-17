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

    // ─────────────────────────────────────────────────────────────
    // Scene & Perspective Camera (Deep Midnight Navy Atmosphere)
    // ─────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020817, 0.0095);

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1000);
    camera.position.set(0, 2, 38);

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

    // Resource tracking for clean disposal
    const disposables: { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] }[] = [];
    const track = <T extends THREE.Object3D>(obj: T): T => {
      if ((obj as any).geometry) disposables.push({ geometry: (obj as any).geometry });
      if ((obj as any).material) disposables.push({ material: (obj as any).material });
      return obj;
    };

    // ─────────────────────────────────────────────────────────────
    // 1. Perspective Horizon Grid Floor & Ceiling (Electric Blue & Emerald)
    // ─────────────────────────────────────────────────────────────
    const gridHelper = track(new THREE.GridHelper(400, 100, 0x10b981, 0x0284c7));
    gridHelper.position.y = -8.5;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.32;
    worldGroup.add(gridHelper);

    const ceilingGrid = track(new THREE.GridHelper(400, 100, 0x38bdf8, 0x064e3b));
    ceilingGrid.position.y = 20;
    (ceilingGrid.material as THREE.Material).transparent = true;
    (ceilingGrid.material as THREE.Material).opacity = 0.18;
    worldGroup.add(ceilingGrid);

    // ─────────────────────────────────────────────────────────────
    // 2. HERO CENTERPIECE: Transparent Glass Sphere with Node Nexus (Z: 22)
    // ─────────────────────────────────────────────────────────────
    const heroCenterpiece = new THREE.Group();
    heroCenterpiece.position.set(0, 1.8, 22);
    worldGroup.add(heroCenterpiece);

    // Central Glass Sphere (Physically convincing translucent glass shell)
    const glassSphereGeom = new THREE.SphereGeometry(3.6, 48, 48);
    const glassSphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
      roughness: 0.08,
      transmission: 0.88,
      thickness: 1.2,
      ior: 1.45,
      transparent: true,
      opacity: 0.75,
      reflectivity: 0.9,
    });
    const glassSphere = track(new THREE.Mesh(glassSphereGeom, glassSphereMat));
    heroCenterpiece.add(glassSphere);

    // Outer Glass Wireframe Accent (Electric Blue & Emerald)
    const wireGeom = new THREE.IcosahedronGeometry(3.75, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const wireMesh = track(new THREE.Mesh(wireGeom, wireMat));
    heroCenterpiece.add(wireMesh);

    // Inner Glowing Core (Emerald Energy)
    const innerCoreGeom = new THREE.IcosahedronGeometry(1.8, 1);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.4,
      metalness: 0.9,
      roughness: 0.1,
    });
    const innerCore = track(new THREE.Mesh(innerCoreGeom, innerCoreMat));
    heroCenterpiece.add(innerCore);

    // Gyroscope Orbital Rings (Electric Blue & Emerald)
    const gyroRing1Geom = new THREE.TorusGeometry(5.8, 0.08, 16, 120);
    const gyroRing1Mat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.2,
      metalness: 0.95,
      roughness: 0.15,
    });
    const gyroRing1 = track(new THREE.Mesh(gyroRing1Geom, gyroRing1Mat));
    gyroRing1.rotation.x = Math.PI / 3;
    heroCenterpiece.add(gyroRing1);

    const gyroRing2Geom = new THREE.TorusGeometry(6.6, 0.07, 16, 120);
    const gyroRing2Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.1,
      metalness: 0.95,
      roughness: 0.15,
    });
    const gyroRing2 = track(new THREE.Mesh(gyroRing2Geom, gyroRing2Mat));
    gyroRing2.rotation.y = Math.PI / 3.5;
    heroCenterpiece.add(gyroRing2);

    // 12 Connected Network Nodes (Constellation of Mentorship)
    const networkNodesGroup = new THREE.Group();
    heroCenterpiece.add(networkNodesGroup);

    const nodeCount = 12;
    const nodeSpheres: { mesh: THREE.Mesh; angle: number; radius: number; speed: number; y: number }[] = [];
    const nodeGeom = new THREE.SphereGeometry(0.36, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 1.6,
      metalness: 0.85,
    });

    for (let i = 0; i < nodeCount; i++) {
      const nodeMesh = track(new THREE.Mesh(nodeGeom, nodeMat));
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 7.2 + Math.sin(i * 1.5) * 1.6;
      const y = Math.sin(i * 2.2) * 2.8;
      nodeMesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      networkNodesGroup.add(nodeMesh);
      nodeSpheres.push({ mesh: nodeMesh, angle, radius, speed: 0.005 + (i % 3) * 0.003, y });
    }

    // Dynamic Connecting Beams
    const lineGeom = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    });
    const connectionLines = new THREE.LineSegments(lineGeom, lineMat);
    networkNodesGroup.add(connectionLines);

    // ─────────────────────────────────────────────────────────────
    // 3. WAYPOINT 2: Grand Knowledge Book & Stylus (Z: -22)
    // ─────────────────────────────────────────────────────────────
    const bookStageGroup = new THREE.Group();
    bookStageGroup.position.set(0, 1.8, -22);
    worldGroup.add(bookStageGroup);

    const bookMaster = new THREE.Group();
    bookMaster.rotation.x = 0.35;
    bookStageGroup.add(bookMaster);

    const coverGeom = new THREE.BoxGeometry(5.0, 0.24, 7.2);
    const coverMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      emissive: 0x022c22,
      emissiveIntensity: 0.6,
      metalness: 0.85,
      roughness: 0.2,
    });
    const leftCover = track(new THREE.Mesh(coverGeom, coverMat));
    leftCover.position.set(-2.45, -0.2, 0);
    leftCover.rotation.y = -0.25;
    bookMaster.add(leftCover);

    const rightCover = track(new THREE.Mesh(coverGeom, coverMat));
    rightCover.position.set(2.45, -0.2, 0);
    rightCover.rotation.y = 0.25;
    bookMaster.add(rightCover);

    const pageGeom = new THREE.BoxGeometry(4.7, 0.42, 6.8);
    const pageMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0x10b981,
      emissiveIntensity: 0.3,
      roughness: 0.3,
    });
    const leftPages = track(new THREE.Mesh(pageGeom, pageMat));
    leftPages.position.set(-2.35, 0.05, 0);
    leftPages.rotation.y = -0.25;
    bookMaster.add(leftPages);

    const rightPages = track(new THREE.Mesh(pageGeom, pageMat));
    rightPages.position.set(2.35, 0.05, 0);
    rightPages.rotation.y = 0.25;
    bookMaster.add(rightPages);

    // Floating Golden Stylus
    const penGroup = new THREE.Group();
    penGroup.position.set(1.6, 2.6, 1.0);
    penGroup.rotation.set(-0.5, 0.3, -0.8);
    bookMaster.add(penGroup);

    const penBodyGeom = new THREE.CylinderGeometry(0.2, 0.2, 4.8, 20);
    const penBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.8,
      metalness: 0.9,
    });
    const penBody = track(new THREE.Mesh(penBodyGeom, penBodyMat));
    penGroup.add(penBody);

    const penNibGeom = new THREE.ConeGeometry(0.22, 0.9, 16);
    const penNibMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 1.5,
      metalness: 0.95,
      roughness: 0.1,
    });
    const penNib = track(new THREE.Mesh(penNibGeom, penNibMat));
    penNib.position.y = -2.7;
    penNib.rotation.x = Math.PI;
    penGroup.add(penNib);

    // 8 Orbiting Category Crystals
    const categoryCrystals: { mesh: THREE.Mesh; angle: number; radius: number; speed: number; y: number }[] = [];
    const crystalGeom = new THREE.OctahedronGeometry(0.72, 0);
    const crystalColors = [0x10b981, 0x0ea5e9, 0x38bdf8, 0x14b8a6, 0xfbbf24, 0x6366f1, 0xec4899, 0x06b6d4];

    for (let i = 0; i < 8; i++) {
      const cMat = new THREE.MeshStandardMaterial({
        color: crystalColors[i],
        emissive: crystalColors[i],
        emissiveIntensity: 0.95,
        metalness: 0.85,
        roughness: 0.2,
      });
      const cMesh = track(new THREE.Mesh(crystalGeom, cMat));
      const angle = (i / 8) * Math.PI * 2;
      const radius = 7.0;
      const y = Math.sin(i * 1.2) * 1.8;
      cMesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      bookStageGroup.add(cMesh);
      categoryCrystals.push({ mesh: cMesh, angle, radius, speed: 0.0075, y });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. WAYPOINT 3: 4-Step 3D Process Pipeline (Z: -72)
    // ─────────────────────────────────────────────────────────────
    const processGroup = new THREE.Group();
    processGroup.position.set(0, 1.8, -72);
    worldGroup.add(processGroup);

    const stepColors = [0x38bdf8, 0x10b981, 0x0ea5e9, 0x34d399];
    const stepNodes: THREE.Mesh[] = [];

    const railGeom = new THREE.CylinderGeometry(0.12, 0.12, 24, 16);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x047857,
      emissiveIntensity: 1.0,
      metalness: 0.9,
    });
    const rail = track(new THREE.Mesh(railGeom, railMat));
    rail.rotation.z = Math.PI / 2;
    processGroup.add(rail);

    for (let i = 0; i < 4; i++) {
      const x = -9 + i * 6;
      const sNodeGeom = new THREE.TorusGeometry(1.2, 0.2, 16, 32);
      const sNodeMat = new THREE.MeshStandardMaterial({
        color: stepColors[i],
        emissive: stepColors[i],
        emissiveIntensity: 1.25,
        metalness: 0.85,
      });
      const sNode = track(new THREE.Mesh(sNodeGeom, sNodeMat));
      sNode.position.set(x, 0, 0);
      processGroup.add(sNode);
      stepNodes.push(sNode);

      const coreDotGeom = new THREE.SphereGeometry(0.5, 16, 16);
      const coreDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const coreDot = track(new THREE.Mesh(coreDotGeom, coreDotMat));
      coreDot.position.set(x, 0, 0);
      processGroup.add(coreDot);
    }

    // ─────────────────────────────────────────────────────────────
    // 5. WAYPOINT 4: Hologram Workstation (Z: -120)
    // ─────────────────────────────────────────────────────────────
    const workstationGroup = new THREE.Group();
    workstationGroup.position.set(0, 1.5, -120);
    worldGroup.add(workstationGroup);

    const lapBaseGeom = new THREE.BoxGeometry(10.5, 0.35, 7.4);
    const lapBaseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      metalness: 0.9,
      roughness: 0.2,
    });
    const lapBase = track(new THREE.Mesh(lapBaseGeom, lapBaseMat));
    workstationGroup.add(lapBase);

    const screenLidGroup = new THREE.Group();
    screenLidGroup.position.set(0, 0.18, -3.5);
    screenLidGroup.rotation.x = -Math.PI / 1.75;
    workstationGroup.add(screenLidGroup);

    const lidGeom = new THREE.BoxGeometry(10.5, 7.0, 0.3);
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const screenLid = track(new THREE.Mesh(lidGeom, lidMat));
    screenLid.position.set(0, 3.5, 0);
    screenLidGroup.add(screenLid);

    const displayGeom = new THREE.PlaneGeometry(9.8, 6.3);
    const displayMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.85,
    });
    const display = track(new THREE.Mesh(displayGeom, displayMat));
    display.position.set(0, 3.5, 0.17);
    screenLidGroup.add(display);

    const displayWireGeom = new THREE.PlaneGeometry(9.8, 6.3, 16, 12);
    const displayWireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const displayWire = track(new THREE.Mesh(displayWireGeom, displayWireMat));
    displayWire.position.set(0, 3.5, 0.18);
    screenLidGroup.add(displayWire);

    const mugGroup = new THREE.Group();
    mugGroup.position.set(7.2, 0, 0.5);
    workstationGroup.add(mugGroup);

    const mugCylGeom = new THREE.CylinderGeometry(1.0, 0.85, 2.0, 24);
    const mugCylMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x047857,
      emissiveIntensity: 0.6,
      metalness: 0.85,
      roughness: 0.2,
    });
    const mugCyl = track(new THREE.Mesh(mugCylGeom, mugCylMat));
    mugCyl.position.y = 1.0;
    mugGroup.add(mugCyl);

    // ─────────────────────────────────────────────────────────────
    // 6. WAYPOINT 5: Academic Trophy & Star (Z: -168)
    // ─────────────────────────────────────────────────────────────
    const trophyGroup = new THREE.Group();
    trophyGroup.position.set(0, 1.5, -168);
    worldGroup.add(trophyGroup);

    const pedGeom = new THREE.CylinderGeometry(2.8, 3.2, 1.0, 32);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x064e3b,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.2,
    });
    const pedestal = track(new THREE.Mesh(pedGeom, pedMat));
    trophyGroup.add(pedestal);

    const stemGeom = new THREE.CylinderGeometry(0.7, 1.2, 2.6, 24);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.95,
      metalness: 0.95,
      roughness: 0.15,
    });
    const stem = track(new THREE.Mesh(stemGeom, goldMat));
    stem.position.y = 1.8;
    trophyGroup.add(stem);

    const cupGeom = new THREE.CylinderGeometry(2.8, 1.2, 3.8, 32, 1, true);
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x10b981,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    const chaliceCup = track(new THREE.Mesh(cupGeom, cupMat));
    chaliceCup.position.y = 4.4;
    trophyGroup.add(chaliceCup);

    const starGeom = new THREE.OctahedronGeometry(1.5, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.6,
      metalness: 0.9,
      roughness: 0.1,
    });
    const starMesh = track(new THREE.Mesh(starGeom, starMat));
    starMesh.position.y = 5.2;
    trophyGroup.add(starMesh);

    const awardRingGeom = new THREE.TorusGeometry(6.0, 0.08, 16, 80);
    const awardRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.7,
    });
    const awardRing = track(new THREE.Mesh(awardRingGeom, awardRingMat));
    awardRing.position.y = 4.4;
    awardRing.rotation.x = Math.PI / 3;
    trophyGroup.add(awardRing);

    // ─────────────────────────────────────────────────────────────
    // 7. WAYPOINT 6: Grand Campus Portal Gateway Arch (Z: -215)
    // ─────────────────────────────────────────────────────────────
    const campusArchGroup = new THREE.Group();
    campusArchGroup.position.set(0, 2, -215);
    worldGroup.add(campusArchGroup);

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
    campusArchGroup.add(leftCol);

    const rightCol = track(new THREE.Mesh(colGeom, colMat));
    rightCol.position.set(14, 3, 0);
    campusArchGroup.add(rightCol);

    const beamGeom = new THREE.BoxGeometry(30, 2.6, 3.0);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x047857,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.2,
    });
    const archBeam = track(new THREE.Mesh(beamGeom, beamMat));
    archBeam.position.set(0, 15, 0);
    campusArchGroup.add(archBeam);

    const warpRingGeom = new THREE.TorusGeometry(12, 0.26, 24, 120);
    const warpRingMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x10b981,
      emissiveIntensity: 1.5,
      metalness: 0.9,
      roughness: 0.1,
    });
    const warpRing = track(new THREE.Mesh(warpRingGeom, warpRingMat));
    warpRing.position.y = 3;
    campusArchGroup.add(warpRing);

    const innerWarpGeom = new THREE.TorusGeometry(9.6, 0.15, 20, 100);
    const innerWarpMat = new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true });
    const innerWarpRing = track(new THREE.Mesh(innerWarpGeom, innerWarpMat));
    innerWarpRing.position.y = 3;
    campusArchGroup.add(innerWarpRing);

    // ─────────────────────────────────────────────────────────────
    // 8. Volumetric Blue-Green Star Particle Field (2,200 Stars)
    // ─────────────────────────────────────────────────────────────
    const particleCount = 2200;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const pColor1 = new THREE.Color(0x10b981); // Emerald
    const pColor2 = new THREE.Color(0x38bdf8); // Electric Sky Blue
    const pColor3 = new THREE.Color(0x14b8a6); // Teal
    const pColor4 = new THREE.Color(0x0284c7); // Deep Blue

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 95;
      particlePositions[i + 1] = (Math.random() - 0.5) * 70 + 4;
      particlePositions[i + 2] = (Math.random() - 0.5) * 270 - 80;

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
    // 9. Camera Lighting (Electric Blue & Vivid Emerald)
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const camLightEmerald = new THREE.PointLight(0x10b981, 5.0, 48);
    scene.add(camLightEmerald);

    const camLightSky = new THREE.PointLight(0x38bdf8, 4.5, 45);
    scene.add(camLightSky);

    const camLightGold = new THREE.PointLight(0xfbbf24, 2.5, 30);
    scene.add(camLightGold);

    // ─────────────────────────────────────────────────────────────
    // 10. Pointer Tracking for Cursor Parallax
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

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // ─────────────────────────────────────────────────────────────
    // 11. Coordinated 5-Scene Animation Loop
    // ─────────────────────────────────────────────────────────────
    let animId: number;
    let currentCamZ = 38;
    let currentProgressLerp = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth lerped scroll progress
      const targetP = scrollRef.current;
      currentProgressLerp += (targetP - currentProgressLerp) * 0.085;

      // Camera travels through coordinates Z = 38 down to Z = -215
      const targetZ = 38 - currentProgressLerp * 253;
      currentCamZ += (targetZ - currentCamZ) * 0.085;
      camera.position.z = currentCamZ;

      // Sinusoidal spatial floating
      camera.position.y = 2.0 + Math.sin(currentProgressLerp * Math.PI * 4) * 0.55;
      camera.position.x = Math.sin(currentProgressLerp * Math.PI * 3) * 0.45;

      // Pointer parallax
      targetMouseX += (mouseX - targetMouseX) * 0.05;
      targetMouseY += (mouseY - targetMouseY) * 0.05;

      camera.rotation.y = -targetMouseX * 0.11;
      camera.rotation.x = -targetMouseY * 0.075 + (currentProgressLerp - 0.5) * 0.02;

      // Keep lights centered around camera
      camLightEmerald.position.set(camera.position.x + 6, camera.position.y + 4, camera.position.z - 8);
      camLightSky.position.set(camera.position.x - 6, camera.position.y - 3, camera.position.z - 12);
      camLightGold.position.set(camera.position.x, camera.position.y + 6, camera.position.z - 15);

      // ─────────────────────────────────────────────────────────
      // Scene 01 -> Scene 02 Transition: Glass Sphere Expansion
      // ─────────────────────────────────────────────────────────
      // In Scene 02 (scroll progress ~0.15 to 0.35), the sphere smoothly expands
      const expandProgress = Math.min(Math.max((currentProgressLerp - 0.12) / 0.22, 0), 1);
      const sphereScale = 1.0 + expandProgress * 0.45;
      glassSphere.scale.set(sphereScale, sphereScale, sphereScale);
      glassSphereMat.opacity = Math.max(0.75 - expandProgress * 0.35, 0.4);

      // Central Gyroscope & Centerpiece Rotations
      glassSphere.rotation.y = elapsedTime * 0.25;
      wireMesh.rotation.y = -elapsedTime * 0.3;
      innerCore.rotation.y = elapsedTime * 0.5;
      innerCore.rotation.x = Math.sin(elapsedTime * 0.8) * 0.3;
      gyroRing1.rotation.z = elapsedTime * 0.5;
      gyroRing2.rotation.x = -elapsedTime * 0.45;

      // Connected Network Nodes Orbit & Dynamic Line Splines
      const linePositions: number[] = [];
      nodeSpheres.forEach((node, i) => {
        node.angle += node.speed;
        node.mesh.position.x = Math.cos(node.angle) * node.radius;
        node.mesh.position.z = Math.sin(node.angle) * node.radius;
        node.mesh.position.y = node.y + Math.sin(elapsedTime * 2 + i) * 0.4;

        // Connect node to inner core
        linePositions.push(0, 0, 0);
        linePositions.push(node.mesh.position.x, node.mesh.position.y, node.mesh.position.z);

        // Connect each node to next node
        const nextNode = nodeSpheres[(i + 1) % nodeSpheres.length];
        linePositions.push(node.mesh.position.x, node.mesh.position.y, node.mesh.position.z);
        linePositions.push(nextNode.mesh.position.x, nextNode.mesh.position.y, nextNode.mesh.position.z);
      });
      lineGeom.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));

      // Waypoint 2: Book & Category Crystals
      bookMaster.rotation.y = Math.sin(elapsedTime * 0.6) * 0.2;
      bookStageGroup.position.y = 1.8 + Math.sin(elapsedTime * 1.2) * 0.3;
      penGroup.position.y = 2.6 + Math.sin(elapsedTime * 2.8) * 0.25;
      penGroup.rotation.z = -0.8 + Math.cos(elapsedTime * 2.5) * 0.15;

      categoryCrystals.forEach((crystal) => {
        crystal.angle += crystal.speed;
        crystal.mesh.position.x = Math.cos(crystal.angle) * crystal.radius;
        crystal.mesh.position.z = Math.sin(crystal.angle) * crystal.radius;
        crystal.mesh.position.y = crystal.y + Math.sin(elapsedTime * 2 + crystal.angle) * 0.5;
        crystal.mesh.rotation.x += 0.02;
        crystal.mesh.rotation.y += 0.03;
      });

      // Waypoint 3: Process Pipeline Nodes
      stepNodes.forEach((sNode, i) => {
        sNode.rotation.y = elapsedTime * 0.8 + i;
        sNode.rotation.x = Math.sin(elapsedTime * 1.2 + i) * 0.2;
      });

      // Waypoint 4: Hologram Workstation
      workstationGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.15;
      workstationGroup.position.y = 1.5 + Math.sin(elapsedTime * 1.4) * 0.25;
      mugGroup.position.y = Math.sin(elapsedTime * 2.0) * 0.15;

      // Waypoint 5: Trophy & Star of Excellence
      trophyGroup.rotation.y = elapsedTime * 0.45;
      starMesh.rotation.y = elapsedTime * 1.3;
      starMesh.rotation.x = Math.sin(elapsedTime * 1.6) * 0.3;
      starMesh.position.y = 5.2 + Math.sin(elapsedTime * 2.2) * 0.3;
      awardRing.rotation.z = elapsedTime * 0.5;

      // Waypoint 6: Warp Rings
      warpRing.rotation.z = elapsedTime * 0.5;
      innerWarpRing.rotation.z = -elapsedTime * 0.65;

      // Hyperspace Particles Flight
      const positions = particleGeom.attributes.position.array as Float32Array;
      for (let i = 2; i < particleCount * 3; i += 3) {
        positions[i] += 0.16 + currentProgressLerp * 0.4;
        if (positions[i] > camera.position.z + 10) {
          positions[i] = camera.position.z - 220;
        }
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Grid loop illusion
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

export default AnimeScrollCanvas3D;

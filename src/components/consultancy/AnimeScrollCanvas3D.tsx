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

    // Scene & Camera - Light Blue Cosmic Campus Atmosphere
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020817, 0.012);

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

    // Disposable resources tracker
    const disposables: { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] }[] = [];
    const track = <T extends THREE.Object3D>(obj: T): T => {
      if ((obj as any).geometry) disposables.push({ geometry: (obj as any).geometry });
      if ((obj as any).material) disposables.push({ material: (obj as any).material });
      return obj;
    };

    // ─────────────────────────────────────────────────────────────
    // 1. Perspective Horizon Grid Floor (Light Blue & Cyan Palette)
    // ─────────────────────────────────────────────────────────────
    const gridHelper = track(new THREE.GridHelper(320, 80, 0x38bdf8, 0x0369a1));
    gridHelper.position.y = -7;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.4;
    worldGroup.add(gridHelper);

    // Ceiling subtle sky grid
    const ceilingGrid = track(new THREE.GridHelper(320, 80, 0x0284c7, 0x082f49));
    ceilingGrid.position.y = 18;
    (ceilingGrid.material as THREE.Material).transparent = true;
    (ceilingGrid.material as THREE.Material).opacity = 0.22;
    worldGroup.add(ceilingGrid);

    // Responsive sculpture positioning (right-docked on desktop to keep text unobstructed)
    const isMobile = width < 768;
    const sculptureX = isMobile ? 0 : 5.8;

    // ─────────────────────────────────────────────────────────────
    // 2. Student-Themed 3D Waypoint Sculptures Along Travel Path
    // ─────────────────────────────────────────────────────────────

    // ── STAGE 1 (Z: 22): 3D Graduation Mortarboard Cap & Academic Degree Scroll ──
    const gradGroup = new THREE.Group();
    gradGroup.position.set(sculptureX, 1.8, 22);
    worldGroup.add(gradGroup);

    // Graduation Mortarboard Cap Top
    const capTopGeom = new THREE.BoxGeometry(6.4, 0.22, 6.4);
    const capTopMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x0369a1,
      emissiveIntensity: 0.6,
      metalness: 0.85,
      roughness: 0.2,
    });
    const capTop = track(new THREE.Mesh(capTopGeom, capTopMat));
    capTop.position.y = 1.1;
    capTop.rotation.y = Math.PI / 4;
    gradGroup.add(capTop);

    // Mortarboard Edge Wireframe Highlight (Light Blue)
    const capWireGeom = new THREE.BoxGeometry(6.46, 0.25, 6.46);
    const capWireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const capWire = track(new THREE.Mesh(capWireGeom, capWireMat));
    capWire.position.copy(capTop.position);
    capWire.rotation.copy(capTop.rotation);
    gradGroup.add(capWire);

    // Skull Cap underneath
    const capSkullGeom = new THREE.CylinderGeometry(2.0, 2.3, 1.4, 32);
    const capSkullMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.3,
    });
    const capSkull = track(new THREE.Mesh(capSkullGeom, capSkullMat));
    capSkull.position.y = 0.4;
    gradGroup.add(capSkull);

    // Center Golden Button
    const capBtnGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
    const capBtnMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 1.0,
      metalness: 0.9,
      roughness: 0.1,
    });
    const capBtn = track(new THREE.Mesh(capBtnGeom, capBtnMat));
    capBtn.position.y = 1.3;
    gradGroup.add(capBtn);

    // Hanging Tassel Cord & Brush
    const tasselGroup = new THREE.Group();
    tasselGroup.position.set(0, 1.3, 0);
    gradGroup.add(tasselGroup);

    const tasselCordGeom = new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8);
    const tasselCordMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
    });
    const tasselCord = track(new THREE.Mesh(tasselCordGeom, tasselCordMat));
    tasselCord.position.set(2.2, -1.0, 2.2);
    tasselCord.rotation.z = -Math.PI / 8;
    tasselGroup.add(tasselCord);

    const tasselBrushGeom = new THREE.ConeGeometry(0.35, 1.1, 16);
    const tasselBrushMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.2,
      metalness: 0.8,
      roughness: 0.2,
    });
    const tasselBrush = track(new THREE.Mesh(tasselBrushGeom, tasselBrushMat));
    tasselBrush.position.set(3.0, -2.6, 2.2);
    tasselBrush.rotation.x = Math.PI;
    tasselGroup.add(tasselBrush);

    // Orbiting Academic Degree Diploma Scroll
    const diplomaGroup = new THREE.Group();
    diplomaGroup.position.set(5.5, 0, 0);
    gradGroup.add(diplomaGroup);

    const scrollCylGeom = new THREE.CylinderGeometry(0.7, 0.7, 5.5, 32);
    const scrollCylMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.1,
    });
    const diplomaCyl = track(new THREE.Mesh(scrollCylGeom, scrollCylMat));
    diplomaCyl.rotation.z = Math.PI / 4;
    diplomaGroup.add(diplomaCyl);

    // Ribbon band around scroll
    const ribbonGeom = new THREE.CylinderGeometry(0.76, 0.76, 0.8, 32);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.7,
    });
    const ribbon = track(new THREE.Mesh(ribbonGeom, ribbonMat));
    ribbon.rotation.z = Math.PI / 4;
    diplomaGroup.add(ribbon);

    // Orbiting graduation aura ring (Light Blue)
    const gradAuraGeom = new THREE.TorusGeometry(7.2, 0.08, 16, 100);
    const gradAuraMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
    });
    const gradAuraRing = track(new THREE.Mesh(gradAuraGeom, gradAuraMat));
    gradAuraRing.rotation.x = Math.PI / 3;
    gradGroup.add(gradAuraRing);


    // ── STAGE 2 (Z: -15): Grand Open 3D Study Book & Floating Writing Pen ──
    // (Explicitly replaces the circular coil with student study things!)
    const bookStageGroup = new THREE.Group();
    bookStageGroup.position.set(sculptureX, 1.8, -15);
    worldGroup.add(bookStageGroup);

    const bookMaster = new THREE.Group();
    bookMaster.rotation.x = 0.4;
    bookStageGroup.add(bookMaster);

    // Hardcover Left & Right
    const coverGeom = new THREE.BoxGeometry(4.6, 0.24, 6.8);
    const coverMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      emissive: 0x075985,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });

    const leftCover = track(new THREE.Mesh(coverGeom, coverMat));
    leftCover.position.set(-2.25, -0.2, 0);
    leftCover.rotation.y = -0.25;
    bookMaster.add(leftCover);

    const rightCover = track(new THREE.Mesh(coverGeom, coverMat));
    rightCover.position.set(2.25, -0.2, 0);
    rightCover.rotation.y = 0.25;
    bookMaster.add(rightCover);

    // Spine
    const spineGeom = new THREE.CylinderGeometry(0.35, 0.35, 6.8, 16);
    const spineMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
    const spine = track(new THREE.Mesh(spineGeom, spineMat));
    spine.rotation.x = Math.PI / 2;
    spine.position.set(0, -0.28, 0);
    bookMaster.add(spine);

    // Open Book Pages (Ivory White with glowing light blue edges)
    const pageGeom = new THREE.BoxGeometry(4.3, 0.4, 6.4);
    const pageMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.25,
      roughness: 0.3,
    });

    const leftPages = track(new THREE.Mesh(pageGeom, pageMat));
    leftPages.position.set(-2.15, 0.05, 0);
    leftPages.rotation.y = -0.25;
    bookMaster.add(leftPages);

    const rightPages = track(new THREE.Mesh(pageGeom, pageMat));
    rightPages.position.set(2.15, 0.05, 0);
    rightPages.rotation.y = 0.25;
    bookMaster.add(rightPages);

    // Glowing Text lines simulated by fine wireframe
    const textWireGeom = new THREE.BoxGeometry(4.32, 0.42, 6.42);
    const textWireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const leftTextWire = track(new THREE.Mesh(textWireGeom, textWireMat));
    leftTextWire.position.copy(leftPages.position);
    leftTextWire.rotation.copy(leftPages.rotation);
    bookMaster.add(leftTextWire);

    const rightTextWire = track(new THREE.Mesh(textWireGeom, textWireMat));
    rightTextWire.position.copy(rightPages.position);
    rightTextWire.rotation.copy(rightPages.rotation);
    bookMaster.add(rightTextWire);

    // Floating Golden Stylus / Fountain Pen hovering over book
    const penGroup = new THREE.Group();
    penGroup.position.set(1.5, 2.5, 1.0);
    penGroup.rotation.set(-0.5, 0.3, -0.8);
    bookMaster.add(penGroup);

    const penBodyGeom = new THREE.CylinderGeometry(0.2, 0.2, 4.6, 20);
    const penBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.7,
      metalness: 0.9,
      roughness: 0.15,
    });
    const penBody = track(new THREE.Mesh(penBodyGeom, penBodyMat));
    penGroup.add(penBody);

    const penNibGeom = new THREE.ConeGeometry(0.22, 0.9, 16);
    const penNibMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.5,
      metalness: 0.95,
      roughness: 0.1,
    });
    const penNib = track(new THREE.Mesh(penNibGeom, penNibMat));
    penNib.position.y = -2.7;
    penGroup.add(penNib);

    // Orbiting Student Subject Badges (Math, Code, Science, A+ Grade)
    const subjectSatellites: { mesh: THREE.Mesh; angle: number; radius: number; speed: number; y: number }[] = [];
    const subjectColors = [0x38bdf8, 0x0ea5e9, 0xfbbf24, 0x60a5fa];

    subjectColors.forEach((col, idx) => {
      const cubeGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const cubeMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.9,
        metalness: 0.8,
        roughness: 0.2,
      });
      const cubeMesh = track(new THREE.Mesh(cubeGeom, cubeMat));
      bookStageGroup.add(cubeMesh);

      subjectSatellites.push({
        mesh: cubeMesh,
        angle: (idx / subjectColors.length) * Math.PI * 2,
        radius: 8.5,
        speed: 0.014 + idx * 0.003,
        y: (idx - 1.5) * 1.6,
      });
    });


    // ── STAGE 3 (Z: -55): 3D Student Laptop & Coding Workstation ──
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(sculptureX, 1.5, -55);
    worldGroup.add(laptopGroup);

    // Laptop Base / Keyboard Chassis
    const baseGeom = new THREE.BoxGeometry(9.6, 0.35, 6.6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x0369a1,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.2,
    });
    const laptopBase = track(new THREE.Mesh(baseGeom, baseMat));
    laptopGroup.add(laptopBase);

    // Trackpad
    const trackpadGeom = new THREE.BoxGeometry(2.6, 0.38, 1.8);
    const trackpadMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.95,
      roughness: 0.1,
    });
    const trackpad = track(new THREE.Mesh(trackpadGeom, trackpadMat));
    trackpad.position.set(0, 0.02, 1.8);
    laptopGroup.add(trackpad);

    // Keyboard keys area (glowing light blue key matrix)
    const kbGeom = new THREE.BoxGeometry(8.4, 0.38, 3.4);
    const kbMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      wireframe: true,
    });
    const kbMesh = track(new THREE.Mesh(kbGeom, kbMat));
    kbMesh.position.set(0, 0.02, -1.0);
    laptopGroup.add(kbMesh);

    // Laptop Screen Lid (Open at 110 degrees)
    const screenLidGroup = new THREE.Group();
    screenLidGroup.position.set(0, 0.18, -3.2);
    screenLidGroup.rotation.x = -Math.PI / 1.75; // tilted open
    laptopGroup.add(screenLidGroup);

    const lidGeom = new THREE.BoxGeometry(9.6, 6.4, 0.28);
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const screenLid = track(new THREE.Mesh(lidGeom, lidMat));
    screenLid.position.set(0, 3.2, 0);
    screenLidGroup.add(screenLid);

    // Emissive Light-Blue Display
    const displayGeom = new THREE.PlaneGeometry(8.9, 5.7);
    const displayMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
    });
    const display = track(new THREE.Mesh(displayGeom, displayMat));
    display.position.set(0, 3.2, 0.16);
    screenLidGroup.add(display);

    // Code Matrix Lines on Screen
    const displayWireGeom = new THREE.PlaneGeometry(8.9, 5.7, 18, 12);
    const displayWireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const displayWire = track(new THREE.Mesh(displayWireGeom, displayWireMat));
    displayWire.position.set(0, 3.2, 0.17);
    screenLidGroup.add(displayWire);

    // Floating Study Coffee Mug on the side
    const mugGroup = new THREE.Group();
    mugGroup.position.set(6.8, 0, 0.5);
    laptopGroup.add(mugGroup);

    const mugCylGeom = new THREE.CylinderGeometry(1.0, 0.85, 2.0, 24);
    const mugCylMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      metalness: 0.85,
      roughness: 0.2,
    });
    const mugCyl = track(new THREE.Mesh(mugCylGeom, mugCylMat));
    mugCyl.position.y = 1.0;
    mugGroup.add(mugCyl);

    const mugHandleGeom = new THREE.TorusGeometry(0.55, 0.12, 12, 24);
    const mugHandleMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });
    const mugHandle = track(new THREE.Mesh(mugHandleGeom, mugHandleMat));
    mugHandle.position.set(1.0, 1.0, 0);
    mugGroup.add(mugHandle);


    // ── STAGE 4 (Z: -95): 3D Academic Trophy of Excellence & Floating Star ──
    const trophyGroup = new THREE.Group();
    trophyGroup.position.set(sculptureX, 1.5, -95);
    worldGroup.add(trophyGroup);

    // Trophy Base Pedestal
    const pedGeom = new THREE.CylinderGeometry(2.6, 3.0, 1.0, 32);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x0369a1,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.2,
    });
    const pedestal = track(new THREE.Mesh(pedGeom, pedMat));
    trophyGroup.add(pedestal);

    // Trophy Stem
    const stemGeom = new THREE.CylinderGeometry(0.65, 1.1, 2.6, 24);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.9,
      metalness: 0.95,
      roughness: 0.15,
    });
    const stem = track(new THREE.Mesh(stemGeom, goldMat));
    stem.position.y = 1.8;
    trophyGroup.add(stem);

    // Trophy Chalice Cup (Light Blue + Gold Emissive)
    const cupGeom = new THREE.CylinderGeometry(2.7, 1.1, 3.6, 32, 1, true);
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85,
      metalness: 0.9,
      roughness: 0.15,
      side: THREE.DoubleSide,
    });
    const cup = track(new THREE.Mesh(cupGeom, cupMat));
    cup.position.y = 4.4;
    trophyGroup.add(cup);

    // Trophy Handles (Left and Right Torus)
    const handleGeom = new THREE.TorusGeometry(1.2, 0.18, 16, 32);
    const leftHandle = track(new THREE.Mesh(handleGeom, goldMat));
    leftHandle.position.set(-2.5, 4.4, 0);
    trophyGroup.add(leftHandle);

    const rightHandle = track(new THREE.Mesh(handleGeom, goldMat));
    rightHandle.position.set(2.5, 4.4, 0);
    trophyGroup.add(rightHandle);

    // Floating 3D Star of Excellence inside Cup
    const starGeom = new THREE.OctahedronGeometry(1.4, 0);
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

    // Orbiting Award Rings (Light Blue & Cyan)
    const awardRingGeom = new THREE.TorusGeometry(5.8, 0.08, 16, 80);
    const awardRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
    });
    const awardRing1 = track(new THREE.Mesh(awardRingGeom, awardRingMat));
    awardRing1.position.y = 4.2;
    awardRing1.rotation.x = Math.PI / 3;
    trophyGroup.add(awardRing1);


    // ── STAGE 5 (Z: -135): Grand Campus Portal Gateway Arch (At Last) ──
    const campusArchGroup = new THREE.Group();
    campusArchGroup.position.set(isMobile ? 0 : 3.8, 2, -135);
    worldGroup.add(campusArchGroup);

    // Twin Fluted Columns
    const colGeom = new THREE.CylinderGeometry(1.0, 1.2, 22, 24);
    const colMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      emissive: 0x075985,
      emissiveIntensity: 0.5,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: true,
    });

    const leftCol = track(new THREE.Mesh(colGeom, colMat));
    leftCol.position.set(-13, 3, 0);
    campusArchGroup.add(leftCol);

    const rightCol = track(new THREE.Mesh(colGeom, colMat));
    rightCol.position.set(13, 3, 0);
    campusArchGroup.add(rightCol);

    // Archway Header Beam (Pediment)
    const beamGeom = new THREE.BoxGeometry(28, 2.4, 2.8);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      metalness: 0.9,
      roughness: 0.2,
    });
    const archBeam = track(new THREE.Mesh(beamGeom, beamMat));
    archBeam.position.set(0, 14, 0);
    campusArchGroup.add(archBeam);

    // Grand Portal Gate Ring in Center (Light Blue)
    const warpRingGeom = new THREE.TorusGeometry(11, 0.25, 24, 120);
    const warpRingMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5,
      metalness: 0.9,
      roughness: 0.1,
    });
    const warpRing = track(new THREE.Mesh(warpRingGeom, warpRingMat));
    warpRing.position.y = 3;
    campusArchGroup.add(warpRing);

    const innerWarpGeom = new THREE.TorusGeometry(8.8, 0.14, 20, 100);
    const innerWarpMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, wireframe: true });
    const innerWarpRing = track(new THREE.Mesh(innerWarpGeom, innerWarpMat));
    innerWarpRing.position.y = 3;
    campusArchGroup.add(innerWarpRing);


    // ─────────────────────────────────────────────────────────────
    // 3. Volumetric Hyperspace Particle Field (1,800 Stars - Light Blue)
    // ─────────────────────────────────────────────────────────────
    const particleCount = 1800;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const pColor1 = new THREE.Color(0x38bdf8); // Sky blue
    const pColor2 = new THREE.Color(0x0ea5e9); // Vibrant light blue
    const pColor3 = new THREE.Color(0x7dd3fc); // Soft sky cyan

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 80;
      particlePositions[i + 1] = (Math.random() - 0.5) * 60 + 4;
      particlePositions[i + 2] = (Math.random() - 0.5) * 220 - 50;

      const r = Math.random();
      const col = r < 0.5 ? pColor1 : r < 0.85 ? pColor2 : pColor3;
      particleColors[i] = col.r;
      particleColors[i + 1] = col.g;
      particleColors[i + 2] = col.b;
    }

    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeom.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = track(new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    }));
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // ─────────────────────────────────────────────────────────────
    // 4. Lights That Ride With the Camera (Light Blue & Cyan Glow)
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const camLightSky = new THREE.PointLight(0x38bdf8, 5.0, 48);
    scene.add(camLightSky);

    const camLightCyan = new THREE.PointLight(0x0ea5e9, 4.5, 42);
    scene.add(camLightCyan);

    const camLightGold = new THREE.PointLight(0xfbbf24, 2.5, 30);
    scene.add(camLightGold);

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

      // Smooth camera position - left-offset on desktop to frame 3D sculptures on right
      camera.position.y = 2 + Math.sin(currentProgressLerp * Math.PI * 3) * 1.0;
      camera.position.x = isMobile ? 0 : -2.0 + Math.sin(currentProgressLerp * Math.PI * 2) * 0.8;

      // Parallax mouse follow & slight inward angle to frame 3D sculptures
      targetMouseX += (mouseX - targetMouseX) * 0.05;
      targetMouseY += (mouseY - targetMouseY) * 0.05;

      camera.rotation.y = -targetMouseX * 0.12 - Math.sin(currentProgressLerp * Math.PI) * 0.08 + (isMobile ? 0 : 0.06);
      camera.rotation.x = -targetMouseY * 0.1 + (currentProgressLerp - 0.5) * 0.04;

      // Keep lights centered around current camera position
      camLightSky.position.set(camera.position.x + 6, camera.position.y + 4, camera.position.z - 8);
      camLightCyan.position.set(camera.position.x - 6, camera.position.y - 3, camera.position.z - 12);
      camLightGold.position.set(camera.position.x, camera.position.y + 6, camera.position.z - 15);

      // ─────────────────────────────────────────────────────────
      // Animate Student Sculptures
      // ─────────────────────────────────────────────────────────

      // Stage 1: Graduation Cap & Diploma
      gradGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.15;
      gradGroup.position.y = 2 + Math.sin(elapsedTime * 1.5) * 0.4;
      diplomaGroup.rotation.y = elapsedTime * 0.7;
      diplomaGroup.position.y = Math.sin(elapsedTime * 2.0) * 0.3;
      gradAuraRing.rotation.z = elapsedTime * 0.5;

      // Stage 2: Open Study Book & Floating Stylus
      bookMaster.rotation.y = Math.sin(elapsedTime * 0.6) * 0.2;
      bookStageGroup.position.y = 1.8 + Math.sin(elapsedTime * 1.2) * 0.35;
      penGroup.position.y = 2.5 + Math.sin(elapsedTime * 3.0) * 0.25;
      penGroup.rotation.z = -0.8 + Math.cos(elapsedTime * 2.5) * 0.15;

      subjectSatellites.forEach((sat) => {
        sat.angle += sat.speed;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
        sat.mesh.position.z = Math.sin(sat.angle) * sat.radius;
        sat.mesh.position.y = sat.y + Math.sin(elapsedTime * 2 + sat.angle) * 0.6;
        sat.mesh.rotation.x += 0.02;
        sat.mesh.rotation.y += 0.03;
      });

      // Stage 3: Laptop & Workstation
      laptopGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.18;
      laptopGroup.position.y = 1.5 + Math.sin(elapsedTime * 1.4) * 0.3;
      mugGroup.position.y = Math.sin(elapsedTime * 2.2) * 0.2;

      // Stage 4: Trophy & Star of Excellence
      trophyGroup.rotation.y = elapsedTime * 0.5;
      starMesh.rotation.y = elapsedTime * 1.4;
      starMesh.rotation.x = Math.sin(elapsedTime * 1.8) * 0.3;
      starMesh.position.y = 5.2 + Math.sin(elapsedTime * 2.5) * 0.35;
      awardRing1.rotation.z = elapsedTime * 0.6;

      // Stage 5: Campus Portal Arch
      warpRing.rotation.z = elapsedTime * 0.5;
      innerWarpRing.rotation.z = -elapsedTime * 0.7;

      // Hyperspace Particle Flight
      const positions = particleGeom.attributes.position.array as Float32Array;
      for (let i = 2; i < particleCount * 3; i += 3) {
        positions[i] += 0.15 + currentProgressLerp * 0.35;
        if (positions[i] > camera.position.z + 10) {
          positions[i] = camera.position.z - 180;
        }
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Endless horizon grid illusion
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
        disposables.forEach((item) => {
          item.geometry?.dispose();
          if (item.material) {
            if (Array.isArray(item.material)) {
              item.material.forEach((m) => m.dispose());
            } else {
              item.material.dispose();
            }
          }
        });
        particleGeom.dispose();
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

export default AnimeScrollCanvas3D;

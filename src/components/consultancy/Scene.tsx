import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";

interface SceneProps {
  scrollProgress: number; // 0.0 to 1.0
  className?: string;
  onLoaded?: () => void;
  isDark?: boolean;
}

export const Scene: React.FC<SceneProps> = ({
  scrollProgress,
  className = "fixed inset-0 pointer-events-none z-0",
  onLoaded,
  isDark = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Safety WebGL support check
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

    // Three.js Scene Setup (Academic Campus Ambience)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x030a1c : 0xf0f4fd, 0.008);

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1000);
    camera.position.set(0, 2.2, 40);

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

    // Camera Rig instance for smooth 9-stop spline flight
    const cameraRig = new CameraRig(camera);

    // Track disposables for leak-free unmount
    const disposables: { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] }[] = [];
    const track = <T extends THREE.Object3D>(obj: T): T => {
      if ((obj as any).geometry) disposables.push({ geometry: (obj as any).geometry });
      if ((obj as any).material) disposables.push({ material: (obj as any).material });
      return obj;
    };

    // ─────────────────────────────────────────────────────────────
    // Lighting Setup: Soft, Rounded, Academic Warmth
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    dirLight.position.set(25, 40, 30);
    scene.add(dirLight);

    // Camera-following accent lights (Tasskly Emerald, Sky Blue, Warm Amber)
    const lightEmerald = new THREE.PointLight(0x10b981, 2.2, 45);
    const lightSky = new THREE.PointLight(0x38bdf8, 2.4, 50);
    const lightAmber = new THREE.PointLight(0xf59e0b, 1.8, 40);
    scene.add(lightEmerald);
    scene.add(lightSky);
    scene.add(lightAmber);

    // ─────────────────────────────────────────────────────────────
    // Campus Ground & Winding Stone Path / Grid
    // ─────────────────────────────────────────────────────────────
    const groundGrid = track(
      new THREE.GridHelper(500, 100, isDark ? 0x10b981 : 0x0284c7, isDark ? 0x0f172a : 0xbfdbfe)
    );
    groundGrid.position.y = -8.2;
    (groundGrid.material as THREE.Material).transparent = true;
    (groundGrid.material as THREE.Material).opacity = isDark ? 0.28 : 0.45;
    worldGroup.add(groundGrid);

    // Curved Winding Campus Road
    const roadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -7.8, 55),
      new THREE.Vector3(-3, -7.8, 25),
      new THREE.Vector3(3.5, -7.8, -10),
      new THREE.Vector3(-2.5, -7.8, -55),
      new THREE.Vector3(2.5, -7.8, -100),
      new THREE.Vector3(-3.0, -7.8, -150),
      new THREE.Vector3(2.0, -7.8, -200),
      new THREE.Vector3(-1.0, -7.8, -250),
      new THREE.Vector3(0, -7.8, -310),
    ]);
    const roadGeom = track(new THREE.TubeGeometry(roadCurve, 120, 2.2, 12, false));
    const roadMat = track(
      new THREE.MeshStandardMaterial({
        color: isDark ? 0x091428 : 0xdbeafe,
        roughness: 0.8,
        metalness: 0.1,
      })
    );
    const roadMesh = new THREE.Mesh(roadGeom, roadMat);
    roadMesh.scale.set(1, 0.12, 1);
    worldGroup.add(roadMesh);

    // ─────────────────────────────────────────────────────────────
    // Helper: Build a Procedural Graduation Cap (Mortarboard)
    // ─────────────────────────────────────────────────────────────
    const createGraduationCap = (scale = 1.0, capColor = 0x0f172a, tasselColor = 0xf59e0b) => {
      const group = new THREE.Group();

      // Top square board
      const boardGeom = track(new THREE.BoxGeometry(2.4 * scale, 0.12 * scale, 2.4 * scale));
      const boardMat = track(
        new THREE.MeshStandardMaterial({
          color: capColor,
          roughness: 0.4,
          metalness: 0.2,
        })
      );
      const board = new THREE.Mesh(boardGeom, boardMat);
      board.position.y = 0.5 * scale;
      group.add(board);

      // Skull cap base (cylinder)
      const capBaseGeom = track(new THREE.CylinderGeometry(0.8 * scale, 0.95 * scale, 0.6 * scale, 16));
      const capBase = new THREE.Mesh(capBaseGeom, boardMat);
      group.add(capBase);

      // Center gold button
      const buttonGeom = track(new THREE.CylinderGeometry(0.12 * scale, 0.12 * scale, 0.14 * scale, 12));
      const goldMat = track(
        new THREE.MeshStandardMaterial({
          color: tasselColor,
          metalness: 0.85,
          roughness: 0.2,
          emissive: tasselColor,
          emissiveIntensity: 0.3,
        })
      );
      const button = new THREE.Mesh(buttonGeom, goldMat);
      button.position.y = 0.6 * scale;
      group.add(button);

      // Hanging tassel cord & fringe
      const tasselCordCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.6 * scale, 0),
        new THREE.Vector3(0.6 * scale, 0.55 * scale, 0.4 * scale),
        new THREE.Vector3(1.3 * scale, 0.2 * scale, 0.8 * scale),
        new THREE.Vector3(1.35 * scale, -0.4 * scale, 0.85 * scale),
      ]);
      const tasselGeom = track(new THREE.TubeGeometry(tasselCordCurve, 16, 0.04 * scale, 8, false));
      const tassel = new THREE.Mesh(tasselGeom, goldMat);
      group.add(tassel);

      return group;
    };

    // ─────────────────────────────────────────────────────────────
    // Helper: Build a Procedural Hardcover Book
    // ─────────────────────────────────────────────────────────────
    const createBook = (width = 2.0, height = 2.6, thickness = 0.45, coverColor = 0x10b981) => {
      const bookGroup = new THREE.Group();

      // Cover (Front, Back & Spine)
      const coverMat = track(
        new THREE.MeshStandardMaterial({
          color: coverColor,
          roughness: 0.35,
          metalness: 0.3,
        })
      );
      const coverGeom = track(new THREE.BoxGeometry(width, height, thickness));
      const cover = new THREE.Mesh(coverGeom, coverMat);
      bookGroup.add(cover);

      // Inner white pages
      const pagesGeom = track(new THREE.BoxGeometry(width - 0.15, height - 0.2, thickness - 0.08));
      const pagesMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.9,
        })
      );
      const pages = new THREE.Mesh(pagesGeom, pagesMat);
      pages.position.x = 0.05;
      bookGroup.add(pages);

      // Gold title line on spine
      const stripeGeom = track(new THREE.BoxGeometry(0.04, height * 0.7, thickness + 0.02));
      const stripeMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.9,
          roughness: 0.2,
        })
      );
      const stripe = new THREE.Mesh(stripeGeom, stripeMat);
      stripe.position.x = -width / 2;
      bookGroup.add(stripe);

      return bookGroup;
    };

    // ─────────────────────────────────────────────────────────────
    // Helper: Build Classical University Building with Columns
    // ─────────────────────────────────────────────────────────────
    const createUniversityBuilding = () => {
      const building = new THREE.Group();

      // Base pedestal steps (3 layers)
      for (let i = 0; i < 3; i++) {
        const stepGeom = track(new THREE.BoxGeometry(14 - i * 0.8, 0.5, 9 - i * 0.6));
        const stepMat = track(
          new THREE.MeshStandardMaterial({
            color: isDark ? 0x111c38 : 0xe2e8f0,
            roughness: 0.6,
          })
        );
        const step = new THREE.Mesh(stepGeom, stepMat);
        step.position.y = i * 0.5;
        building.add(step);
      }

      // Main Hall Back Wall
      const wallGeom = track(new THREE.BoxGeometry(11.5, 6.2, 5.5));
      const wallMat = track(
        new THREE.MeshStandardMaterial({
          color: isDark ? 0x0c1527 : 0xf1f5f9,
          roughness: 0.5,
          metalness: 0.1,
        })
      );
      const wall = new THREE.Mesh(wallGeom, wallMat);
      wall.position.set(0, 4.6, -1.2);
      building.add(wall);

      // Glowing Grand Entrance Portal (Archway)
      const archGeom = track(new THREE.CylinderGeometry(1.6, 1.6, 3.8, 16));
      const archMat = track(
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 1.2,
          roughness: 0.3,
        })
      );
      const arch = new THREE.Mesh(archGeom, archMat);
      arch.position.set(0, 3.5, 1.6);
      building.add(arch);

      // 6 Classical Columns (Portico)
      const columnPositions = [-4.5, -2.7, -0.9, 0.9, 2.7, 4.5];
      columnPositions.forEach((xPos) => {
        const colGeom = track(new THREE.CylinderGeometry(0.38, 0.42, 6.0, 16));
        const colMat = track(
          new THREE.MeshStandardMaterial({
            color: isDark ? 0x1e293b : 0xffffff,
            roughness: 0.3,
            metalness: 0.15,
          })
        );
        const column = new THREE.Mesh(colGeom, colMat);
        column.position.set(xPos, 4.5, 2.2);
        building.add(column);

        // Column capital / base rings
        const capRingGeom = track(new THREE.BoxGeometry(1.0, 0.3, 1.0));
        const capRing = new THREE.Mesh(capRingGeom, colMat);
        capRing.position.set(xPos, 7.5, 2.2);
        building.add(capRing);
      });

      // Entablature (Horizontal Beam over Columns)
      const entablatureGeom = track(new THREE.BoxGeometry(12.5, 0.8, 5.0));
      const entMat = track(
        new THREE.MeshStandardMaterial({
          color: isDark ? 0x1a2642 : 0xe2e8f0,
          roughness: 0.4,
        })
      );
      const entablature = new THREE.Mesh(entablatureGeom, entMat);
      entablature.position.set(0, 7.8, 1.0);
      building.add(entablature);

      // Triangular Pediment Roof
      const pedimentGeom = track(new THREE.ConeGeometry(7.0, 2.6, 4));
      const pedimentMat = track(
        new THREE.MeshStandardMaterial({
          color: isDark ? 0x10b981 : 0x0284c7,
          emissive: 0x064e3b,
          emissiveIntensity: 0.4,
          roughness: 0.3,
        })
      );
      const pediment = new THREE.Mesh(pedimentGeom, pedimentMat);
      pediment.rotation.y = Math.PI / 4;
      pediment.position.set(0, 9.5, 1.0);
      pediment.scale.set(1.15, 1, 0.5);
      building.add(pediment);

      // Classical Clock / Crest on Pediment
      const clockGeom = track(new THREE.CylinderGeometry(0.7, 0.7, 0.2, 24));
      const clockMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 0.6,
          metalness: 0.8,
        })
      );
      const clock = new THREE.Mesh(clockGeom, clockMat);
      clock.rotation.x = Math.PI / 2;
      clock.position.set(0, 9.2, 2.4);
      building.add(clock);

      return building;
    };

    // ─────────────────────────────────────────────────────────────
    // Helper: Build Stylized Clock Tower
    // ─────────────────────────────────────────────────────────────
    const createClockTower = () => {
      const tower = new THREE.Group();

      // Shaft
      const shaftGeom = track(new THREE.BoxGeometry(3.6, 16, 3.6));
      const shaftMat = track(
        new THREE.MeshStandardMaterial({
          color: isDark ? 0x0f1c36 : 0xe0e7ff,
          roughness: 0.5,
        })
      );
      const shaft = new THREE.Mesh(shaftGeom, shaftMat);
      shaft.position.y = 8;
      tower.add(shaft);

      // Clock faces (4 dials)
      for (let i = 0; i < 4; i++) {
        const dialGeom = track(new THREE.CylinderGeometry(1.1, 1.1, 0.15, 24));
        const dialMat = track(
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.5,
          })
        );
        const dial = new THREE.Mesh(dialGeom, dialMat);
        dial.rotation.x = Math.PI / 2;
        dial.rotation.z = (i * Math.PI) / 2;
        dial.position.set(
          i === 0 ? 0 : i === 1 ? 1.85 : i === 2 ? 0 : -1.85,
          13.5,
          i === 0 ? 1.85 : i === 1 ? 0 : i === 2 ? -1.85 : 0
        );
        tower.add(dial);
      }

      // Pointed Spire Roof
      const spireGeom = track(new THREE.ConeGeometry(2.4, 6.0, 4));
      const spireMat = track(
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x047857,
          emissiveIntensity: 0.4,
          roughness: 0.2,
        })
      );
      const spire = new THREE.Mesh(spireGeom, spireMat);
      spire.rotation.y = Math.PI / 4;
      spire.position.y = 19;
      tower.add(spire);

      return tower;
    };

    // ─────────────────────────────────────────────────────────────
    // Helper: Build Floating Academic Task Card
    // ─────────────────────────────────────────────────────────────
    const createTaskCard = (label: string, colorHex: number) => {
      const card = new THREE.Group();
      const baseGeom = track(new THREE.BoxGeometry(3.4, 2.2, 0.12));
      const baseMat = track(
        new THREE.MeshPhysicalMaterial({
          color: isDark ? 0x081329 : 0xffffff,
          roughness: 0.2,
          metalness: 0.1,
          transmission: 0.7,
          transparent: true,
          opacity: 0.88,
        })
      );
      const base = new THREE.Mesh(baseGeom, baseMat);
      card.add(base);

      // Header Tag
      const tagGeom = track(new THREE.BoxGeometry(1.6, 0.35, 0.16));
      const tagMat = track(
        new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: 0.8,
        })
      );
      const tag = new THREE.Mesh(tagGeom, tagMat);
      tag.position.set(-0.7, 0.65, 0.04);
      card.add(tag);

      // Checkbox lines
      for (let j = 0; j < 2; j++) {
        const lineGeom = track(new THREE.BoxGeometry(2.6, 0.2, 0.15));
        const lineMat = track(
          new THREE.MeshStandardMaterial({
            color: isDark ? 0x1e293b : 0xe2e8f0,
            roughness: 0.4,
          })
        );
        const line = new THREE.Mesh(lineGeom, lineMat);
        line.position.set(0, 0.1 - j * 0.45, 0.03);
        card.add(line);
      }

      return card;
    };

    // ─────────────────────────────────────────────────────────────
    // STAGE 1: HERO CENTERPIECE (Main Campus Gate & Grand Library)
    // ─────────────────────────────────────────────────────────────
    const heroStage = new THREE.Group();
    heroStage.position.set(5.5, 0.5, 26);
    worldGroup.add(heroStage);

    // Grand University Building
    const heroBuilding = createUniversityBuilding();
    heroBuilding.scale.set(0.85, 0.85, 0.85);
    heroBuilding.position.set(0, -2.5, 0);
    heroBuilding.rotation.y = -0.35;
    heroStage.add(heroBuilding);

    // Large floating graduation cap above building
    const heroCap = createGraduationCap(1.4, 0x0b1329, 0xf59e0b);
    heroCap.position.set(-1.5, 8.2, 2.5);
    heroCap.rotation.set(-0.25, 0.4, 0.15);
    heroStage.add(heroCap);

    // Orbiting hardcover books around Hero
    const orbitingBooks: { mesh: THREE.Group; radius: number; speed: number; angle: number; y: number }[] = [];
    const bookColors = [0x10b981, 0x38bdf8, 0xf59e0b, 0xf43f5e, 0x8b5cf6];
    for (let i = 0; i < 5; i++) {
      const bMesh = createBook(1.6, 2.2, 0.35, bookColors[i % bookColors.length]);
      heroStage.add(bMesh);
      orbitingBooks.push({
        mesh: bMesh,
        radius: 6.8 + (i % 2) * 1.5,
        speed: 0.008 + (i % 3) * 0.003,
        angle: (i * Math.PI * 2) / 5,
        y: 2.5 + Math.sin(i) * 2.5,
      });
    }

    // Orbiting Floating Task Cards around Hero
    const orbitingCards: { mesh: THREE.Group; radius: number; speed: number; angle: number; y: number }[] = [];
    const cardLabels = ["Exam Prep", "Hackathon", "Internship"];
    const cardColors = [0x10b981, 0x38bdf8, 0xf59e0b];
    for (let i = 0; i < 3; i++) {
      const card = createTaskCard(cardLabels[i], cardColors[i]);
      heroStage.add(card);
      orbitingCards.push({
        mesh: card,
        radius: 8.5 + i * 1.2,
        speed: -0.006 - i * 0.002,
        angle: (i * Math.PI * 2) / 3 + 1.0,
        y: 4.0 - i * 1.5,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 2: WHO WE HELP (Campus Quad & Student Commons)
    // ─────────────────────────────────────────────────────────────
    const quadStage = new THREE.Group();
    quadStage.position.set(-6.5, 0.5, 12);
    worldGroup.add(quadStage);

    // Clock tower at the Quad
    const quadTower = createClockTower();
    quadTower.scale.set(0.65, 0.65, 0.65);
    quadTower.position.set(-3.5, -4.5, -6);
    quadStage.add(quadTower);

    // Floating Notebook & Pencils
    const quadBook = createBook(2.2, 3.0, 0.5, 0x38bdf8);
    quadBook.rotation.set(0.3, -0.4, 0.2);
    quadBook.position.set(0, 2.0, 0);
    quadStage.add(quadBook);

    // Floating Pencil
    const pencilGeom = track(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 8));
    const pencilMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.3,
      })
    );
    const pencil = new THREE.Mesh(pencilGeom, pencilMat);
    pencil.position.set(2.2, 1.8, 1.2);
    pencil.rotation.set(0.6, 0.2, 0.8);
    quadStage.add(pencil);

    // ─────────────────────────────────────────────────────────────
    // STAGE 3: SERVICES (Central Library & Department Archives)
    // ─────────────────────────────────────────────────────────────
    const libraryStage = new THREE.Group();
    libraryStage.position.set(6.0, 1.2, -24);
    worldGroup.add(libraryStage);

    // Circular Stack of Academic Tomes / Books
    for (let k = 0; k < 6; k++) {
      const stackBook = createBook(2.4 - k * 0.15, 3.2 - k * 0.15, 0.45, bookColors[k % bookColors.length]);
      stackBook.rotation.x = Math.PI / 2;
      stackBook.rotation.z = (k * Math.PI) / 6;
      stackBook.position.set(0, -1.5 + k * 0.55, 0);
      libraryStage.add(stackBook);
    }

    // Glowing Knowledge Aura Ring
    const auraGeom = track(new THREE.TorusGeometry(4.2, 0.08, 16, 80));
    const auraMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.4,
      })
    );
    const auraRing = new THREE.Mesh(auraGeom, auraMat);
    auraRing.rotation.x = Math.PI / 2.5;
    auraRing.position.y = 1.0;
    libraryStage.add(auraRing);

    // ─────────────────────────────────────────────────────────────
    // STAGE 4: PROCESS (Academic Path Milestone Archways)
    // ─────────────────────────────────────────────────────────────
    const processStage = new THREE.Group();
    processStage.position.set(-4.5, 0.8, -65);
    worldGroup.add(processStage);

    // 4 Milestone Landmarks along the process road
    const milestones: THREE.Group[] = [];
    const milestoneColors = [0x10b981, 0x38bdf8, 0xf59e0b, 0xec4899];
    for (let m = 0; m < 4; m++) {
      const mGroup = new THREE.Group();
      mGroup.position.set(m % 2 === 0 ? -3.0 : 3.0, 0, -m * 8);

      // Milestone Column
      const mColGeom = track(new THREE.CylinderGeometry(0.5, 0.6, 4.5, 16));
      const mColMat = track(
        new THREE.MeshStandardMaterial({
          color: isDark ? 0x111c38 : 0xe0e7ff,
          roughness: 0.4,
        })
      );
      const mCol = new THREE.Mesh(mColGeom, mColMat);
      mGroup.add(mCol);

      // Glowing Diamond Lantern on top
      const diamondGeom = track(new THREE.OctahedronGeometry(0.85, 0));
      const diamondMat = track(
        new THREE.MeshStandardMaterial({
          color: milestoneColors[m],
          emissive: milestoneColors[m],
          emissiveIntensity: 1.2,
          roughness: 0.15,
        })
      );
      const diamond = new THREE.Mesh(diamondGeom, diamondMat);
      diamond.position.y = 3.2;
      mGroup.add(diamond);

      milestones.push(mGroup);
      processStage.add(mGroup);
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 5: RESULTS (Research Lab & Project Data Pillars)
    // ─────────────────────────────────────────────────────────────
    const labStage = new THREE.Group();
    labStage.position.set(5.5, 0.8, -112);
    worldGroup.add(labStage);

    // 3 Metric Trophy Pillars with Floating Golden Laurels & Badges
    for (let p = 0; p < 3; p++) {
      const pGroup = new THREE.Group();
      pGroup.position.set((p - 1) * 3.8, 0, 0);

      const pillarGeom = track(new THREE.CylinderGeometry(1.2, 1.4, 3.5 + p * 1.0, 16));
      const pillarMat = track(
        new THREE.MeshStandardMaterial({
          color: isDark ? 0x0f172a : 0xf1f5f9,
          roughness: 0.3,
          metalness: 0.3,
        })
      );
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pGroup.add(pillar);

      // Floating Achievement Sphere / Star
      const starGeom = track(new THREE.DodecahedronGeometry(0.95));
      const starMat = track(
        new THREE.MeshStandardMaterial({
          color: p === 0 ? 0x10b981 : p === 1 ? 0x38bdf8 : 0xf59e0b,
          emissive: p === 0 ? 0x059669 : p === 1 ? 0x0284c7 : 0xd97706,
          emissiveIntensity: 1.3,
          metalness: 0.9,
          roughness: 0.1,
        })
      );
      const star = new THREE.Mesh(starGeom, starMat);
      star.position.y = 2.8 + p * 0.5;
      pGroup.add(star);

      labStage.add(pGroup);
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 6: ENGAGEMENT PLANS (Innovation Center Pedestals)
    // ─────────────────────────────────────────────────────────────
    const plansStage = new THREE.Group();
    plansStage.position.set(-4.5, 0.5, -162);
    worldGroup.add(plansStage);

    // 3 Tier Pedestals with Floating Laurels
    for (let t = 0; t < 3; t++) {
      const isMiddle = t === 1;
      const pedestalGeom = track(new THREE.BoxGeometry(3.0, isMiddle ? 3.6 : 2.6, 3.0));
      const pedestalMat = track(
        new THREE.MeshStandardMaterial({
          color: isMiddle ? (isDark ? 0x064e3b : 0xd1fae5) : (isDark ? 0x0b1329 : 0xf1f5f9),
          roughness: 0.4,
        })
      );
      const ped = new THREE.Mesh(pedestalGeom, pedestalMat);
      ped.position.set((t - 1) * 4.2, 0, 0);
      plansStage.add(ped);

      if (isMiddle) {
        // Floating Crown / Crest above Most Popular Plan
        const crownCap = createGraduationCap(0.9, 0x10b981, 0xf59e0b);
        crownCap.position.set(0, 3.2, 0);
        plansStage.add(crownCap);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 7: TESTIMONIALS (Alumni Amphitheater Ring)
    // ─────────────────────────────────────────────────────────────
    const storiesStage = new THREE.Group();
    storiesStage.position.set(0, 1.0, -212);
    worldGroup.add(storiesStage);

    // Rotating Ring of floating academic cards & cap icons
    const ringCardsCount = 6;
    const ringRadius = 7.2;
    for (let r = 0; r < ringCardsCount; r++) {
      const ringAngle = (r * Math.PI * 2) / ringCardsCount;
      const ringCard = createTaskCard(`Story ${r + 1}`, bookColors[r % bookColors.length]);
      ringCard.position.set(Math.cos(ringAngle) * ringRadius, Math.sin(r) * 0.8, Math.sin(ringAngle) * ringRadius);
      ringCard.rotation.y = -ringAngle + Math.PI / 2;
      storiesStage.add(ringCard);
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 8: PARTNER COLLEGES BOULEVARD
    // ─────────────────────────────────────────────────────────────
    const partnersStage = new THREE.Group();
    partnersStage.position.set(0, 0, -256);
    worldGroup.add(partnersStage);

    // Boulevard Avenue Gateway Pillars
    for (let b = 0; b < 2; b++) {
      const bSide = b === 0 ? -7.0 : 7.0;
      const pTower = createClockTower();
      pTower.scale.set(0.5, 0.5, 0.5);
      pTower.position.set(bSide, -4.0, 0);
      partnersStage.add(pTower);
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 9: GRADUATION STAGE & CONVOCATION HALL (Final CTA)
    // ─────────────────────────────────────────────────────────────
    const gradStage = new THREE.Group();
    gradStage.position.set(0, 1.2, -300);
    worldGroup.add(gradStage);

    // Monumental Convocation Archway
    const archPortalGeom = track(new THREE.TorusGeometry(8.5, 0.45, 16, 64));
    const archPortalMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 1.4,
        roughness: 0.1,
      })
    );
    const archPortal = new THREE.Mesh(archPortalGeom, archPortalMat);
    archPortal.rotation.x = Math.PI / 2;
    archPortal.position.y = 1.0;
    gradStage.add(archPortal);

    // Grand Floating Graduation Cap (Centerpiece behind form)
    const grandCap = createGraduationCap(2.8, 0x0b1329, 0xf59e0b);
    grandCap.position.set(0, 4.5, -4.0);
    grandCap.rotation.set(-0.2, 0.35, 0.1);
    gradStage.add(grandCap);

    // Diploma Scroll with Gold Ribbon
    const scrollGeom = track(new THREE.CylinderGeometry(0.35, 0.35, 3.2, 16));
    const scrollMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.6,
      })
    );
    const diplomaScroll = new THREE.Mesh(scrollGeom, scrollMat);
    diplomaScroll.rotation.z = Math.PI / 3;
    diplomaScroll.position.set(3.2, 2.0, -1.0);
    gradStage.add(diplomaScroll);

    // Gold ribbon ring on diploma
    const ribbonGeom = track(new THREE.CylinderGeometry(0.4, 0.4, 0.4, 16));
    const ribbonMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.8,
        metalness: 0.9,
      })
    );
    const ribbon = new THREE.Mesh(ribbonGeom, ribbonMat);
    diplomaScroll.add(ribbon);

    // ─────────────────────────────────────────────────────────────
    // Atmospheric Sparkles & Academic Starfield Particles
    // ─────────────────────────────────────────────────────────────
    const particleCount = 2000;
    const particleGeom = track(new THREE.BufferGeometry());
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const cEmerald = new THREE.Color(0x10b981);
    const cSky = new THREE.Color(0x38bdf8);
    const cAmber = new THREE.Color(0xf59e0b);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 60;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      particlePositions[i * 3 + 2] = 50 - Math.random() * 370;

      const pickColor = Math.random() > 0.6 ? cEmerald : Math.random() > 0.3 ? cSky : cAmber;
      particleColors[i * 3] = pickColor.r;
      particleColors[i * 3 + 1] = pickColor.g;
      particleColors[i * 3 + 2] = pickColor.b;
    }

    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeom.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = track(
      new THREE.PointsMaterial({
        size: 0.28,
        vertexColors: true,
        transparent: true,
        opacity: isDark ? 0.75 : 0.55,
      })
    );
    const particles = new THREE.Points(particleGeom, particleMat);
    worldGroup.add(particles);

    if (onLoaded) onLoaded();

    // ─────────────────────────────────────────────────────────────
    // Mouse Parallax & Window Resize Listeners
    // ─────────────────────────────────────────────────────────────
    const handlePointerMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      cameraRig.updateMouse(normX, normY);
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize);

    // ─────────────────────────────────────────────────────────────
    // Continuous Render Loop
    // ─────────────────────────────────────────────────────────────
    let animId: number;
    const clockTimer = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clockTimer.getElapsedTime();

      // Update camera flight
      cameraRig.setProgress(scrollRef.current);
      cameraRig.update();

      const currentProgress = cameraRig.getProgress();

      // Lights follow camera position
      lightEmerald.position.set(camera.position.x + 5, camera.position.y + 4, camera.position.z - 6);
      lightSky.position.set(camera.position.x - 5, camera.position.y - 3, camera.position.z - 10);
      lightAmber.position.set(camera.position.x + 2, camera.position.y + 6, camera.position.z - 14);

      // Hero animations
      heroCap.rotation.y = 0.4 + Math.sin(elapsedTime * 0.8) * 0.15;
      heroCap.position.y = 8.2 + Math.sin(elapsedTime * 1.2) * 0.35;

      orbitingBooks.forEach((b) => {
        b.angle += b.speed;
        b.mesh.position.x = Math.cos(b.angle) * b.radius;
        b.mesh.position.z = Math.sin(b.angle) * b.radius;
        b.mesh.position.y = b.y + Math.sin(elapsedTime * 1.5 + b.angle) * 0.4;
        b.mesh.rotation.y = -b.angle + Math.PI / 2;
        b.mesh.rotation.x = Math.sin(elapsedTime + b.angle) * 0.2;
      });

      orbitingCards.forEach((c) => {
        c.angle += c.speed;
        c.mesh.position.x = Math.cos(c.angle) * c.radius;
        c.mesh.position.z = Math.sin(c.angle) * c.radius;
        c.mesh.position.y = c.y + Math.sin(elapsedTime * 1.8 + c.angle) * 0.3;
        c.mesh.rotation.y = -c.angle;
      });

      // Quad stage animations
      quadBook.rotation.y = -0.4 + Math.sin(elapsedTime * 0.9) * 0.2;
      pencil.rotation.z = 0.8 + Math.sin(elapsedTime * 1.4) * 0.25;

      // Library stack animation
      auraRing.rotation.z = elapsedTime * 0.4;

      // Process milestones pulsation
      milestones.forEach((m, idx) => {
        const d = m.children[1];
        if (d) {
          d.rotation.y = elapsedTime * 1.2 + idx;
          d.rotation.x = elapsedTime * 0.6 + idx;
        }
      });

      // Stories ring rotation
      storiesStage.rotation.y = elapsedTime * 0.22;

      // Final Convocation Arch & Cap
      archPortal.rotation.z = elapsedTime * 0.35;
      grandCap.rotation.y = 0.35 + Math.sin(elapsedTime * 0.7) * 0.18;
      diplomaScroll.rotation.y = elapsedTime * 0.8;

      // Particle stream forward illusion
      const positions = particleGeom.attributes.position.array as Float32Array;
      for (let i = 2; i < particleCount * 3; i += 3) {
        positions[i] += 0.14 + currentProgress * 0.3;
        if (positions[i] > camera.position.z + 10) {
          positions[i] = camera.position.z - 280;
        }
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Endless Ground Grid Illusion
      groundGrid.position.z = (camera.position.z % 5) - 2.5;

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
  }, [isDark]);

  return <div ref={mountRef} className={className} />;
};

export default Scene;

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Consultancy3DCanvasProps {
  className?: string;
  intensity?: number;
}

export const Consultancy3DCanvas: React.FC<Consultancy3DCanvasProps> = ({
  className = "absolute inset-0 pointer-events-none",
  intensity = 1.0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability safely
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) return;
    } catch {
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070913, 0.015);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Group for mouse parallax
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. Central 3D Multifaceted Crystal Gem
    const gemGeometry = new THREE.IcosahedronGeometry(3.6, 0);
    const gemMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      emissive: 0x064e3b,
      emissiveIntensity: 0.6 * intensity,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
      transparent: true,
      opacity: 0.75,
    });
    const gem = new THREE.Mesh(gemGeometry, gemMaterial);
    masterGroup.add(gem);

    // Wireframe overlay for high-tech holographic look
    const wireframeGeometry = new THREE.IcosahedronGeometry(3.64, 1);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.45 * intensity,
    });
    const gemWireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    masterGroup.add(gemWireframe);

    // 2. Gyroscopic Orbiting Rings
    const ringGroup = new THREE.Group();
    masterGroup.add(ringGroup);

    const createRing = (radius: number, tube: number, color: number, rx: number, ry: number) => {
      const ringGeom = new THREE.TorusGeometry(radius, tube, 16, 100);
      const ringMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.4 * intensity,
        roughness: 0.3,
        metalness: 0.9,
        transparent: true,
        opacity: 0.65,
      });
      const mesh = new THREE.Mesh(ringGeom, ringMat);
      mesh.rotation.x = rx;
      mesh.rotation.y = ry;
      ringGroup.add(mesh);
      return mesh;
    };

    const ring1 = createRing(5.6, 0.05, 0x06b6d4, Math.PI / 3, 0);
    const ring2 = createRing(6.8, 0.04, 0x8b5cf6, -Math.PI / 4, Math.PI / 6);
    const ring3 = createRing(8.0, 0.03, 0x10b981, Math.PI / 6, -Math.PI / 4);

    // 3. Floating Consultancy Discipline Nodes
    const nodesGroup = new THREE.Group();
    masterGroup.add(nodesGroup);

    const nodeColors = [0x10b981, 0x06b6d4, 0x8b5cf6, 0xf59e0b, 0xec4899];
    const nodeMeshes: { mesh: THREE.Mesh; angle: number; speed: number; radius: number; yOffset: number }[] = [];

    nodeColors.forEach((color, i) => {
      const geom = new THREE.OctahedronGeometry(0.55, 0);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8 * intensity,
        metalness: 0.7,
        roughness: 0.2,
      });
      const mesh = new THREE.Mesh(geom, mat);
      nodesGroup.add(mesh);
      nodeMeshes.push({
        mesh,
        angle: (i / nodeColors.length) * Math.PI * 2,
        speed: 0.008 + i * 0.003,
        radius: 9.5 + (i % 2) * 1.5,
        yOffset: (i - 2) * 1.2,
      });
    });

    // 4. Background Starfield / Particle Constellation
    const particleCount = 750;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const baseColor1 = new THREE.Color(0x10b981); // Emerald
    const baseColor2 = new THREE.Color(0x06b6d4); // Cyan
    const baseColor3 = new THREE.Color(0x8b5cf6); // Purple

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 65;
      positions[i + 1] = (Math.random() - 0.5) * 65;
      positions[i + 2] = (Math.random() - 0.5) * 50 - 5;

      const pick = Math.random();
      const col = pick < 0.45 ? baseColor1 : pick < 0.8 ? baseColor2 : baseColor3;
      particleColors[i] = col.r;
      particleColors[i + 1] = col.g;
      particleColors[i + 2] = col.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.7 * intensity,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0x10b981, 4.5 * intensity, 40);
    light1.position.set(10, 10, 10);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x8b5cf6, 4.0 * intensity, 40);
    light2.position.set(-10, -8, 12);
    scene.add(light2);

    const light3 = new THREE.PointLight(0x06b6d4, 3.5 * intensity, 35);
    light3.position.set(0, 12, -8);
    scene.add(light3);

    // Mouse Tracking Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouseX = (clientX / (rect.width || 1) - 0.5) * 2;
      mouseY = (clientY / (rect.height || 1) - 0.5) * 2;
    };

    window.addEventListener("mousemove", handlePointerMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera/group parallax damping
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      masterGroup.rotation.y = targetX * 0.35 + elapsedTime * 0.08;
      masterGroup.rotation.x = -targetY * 0.25;

      // Rotate central gem
      gem.rotation.x = elapsedTime * 0.3;
      gem.rotation.y = elapsedTime * 0.45;
      gemWireframe.rotation.x = elapsedTime * 0.3;
      gemWireframe.rotation.y = elapsedTime * 0.45;

      // Rotate gyroscopic rings
      ring1.rotation.z = elapsedTime * 0.25;
      ring2.rotation.x = -elapsedTime * 0.35;
      ring3.rotation.y = elapsedTime * 0.3;

      // Orbit floating discipline nodes
      nodeMeshes.forEach((node) => {
        node.angle += node.speed;
        node.mesh.position.x = Math.cos(node.angle) * node.radius;
        node.mesh.position.z = Math.sin(node.angle) * node.radius;
        node.mesh.position.y = node.yOffset + Math.sin(elapsedTime * 1.5 + node.angle) * 0.6;
        node.mesh.rotation.x += 0.02;
        node.mesh.rotation.y += 0.03;
      });

      // Slowly rotate particle field
      particles.rotation.y = elapsedTime * 0.025;
      particles.rotation.x = Math.sin(elapsedTime * 0.015) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("resize", handleResize);

      // Clean up Three.js resources
      try {
        gemGeometry.dispose();
        gemMaterial.dispose();
        wireframeGeometry.dispose();
        wireframeMaterial.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      } catch {
        // Ignored
      }
    };
  }, [intensity]);

  return (
    <div
      ref={mountRef}
      className={`overflow-hidden select-none pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

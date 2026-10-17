# Tasskly 3D Consultancy Architecture

A production-grade, scroll-driven 3D experience built for Tasskly's Consultancy marketplace. Powered by Three.js, React, Tailwind CSS, and Framer Motion.

---

## 1. Directory Structure

```
src/
├── components/
│   └── consultancy/
│       ├── CameraRig.tsx              # Spline camera navigation, waypoints & mouse parallax
│       ├── Scene.tsx                  # Persistent Three.js scene, lighting, 3D stages & particles
│       ├── Card3D.tsx                 # Reusable 3D tilt & specular glare card container
│       ├── ConsultationForm.tsx       # Booking form (6 fields, validation, API & local fallback)
│       ├── sections/
│       │   ├── HeroSection.tsx        # Section 1: Hero with headline, badges & CTAs
│       │   ├── ServicesSection.tsx    # Section 2: 6 services with 3D tilt/flip cards
│       │   ├── ProcessSection.tsx     # Section 3: 4-step Discover, Analyze, Implement, Optimize timeline
│       │   ├── ResultsSection.tsx     # Section 4: 3 metric cards with animated counters & bars
│       │   ├── PricingSection.tsx     # Section 5: 3 engagement models (Starter, Team, Enterprise)
│       │   ├── TestimonialsSection.tsx# Section 6: 3D interactive testimonials carousel
│       │   ├── BookingSection.tsx     # Section 7: Final CTA & booking form container
│       │   └── FooterSection.tsx      # Section 8: Tasskly platform footer
│       └── README.md                  # This guide
└── pages/
    └── Consultancy.tsx                # Page controller, dot navigation & scroll progress
```

---

## 2. Adjusting the 3D Camera Path

Camera flight positions and angles are defined in [`src/components/consultancy/CameraRig.tsx`](./CameraRig.tsx) within the `waypoints` array:

```typescript
private waypoints = [
  { z: 36,   y: 2.2, x: 0,    rotY: 0,     rotX: -0.02 }, // Stage 1: Hero
  { z: 12,   y: 1.8, x: -1.2, rotY: 0.08,  rotX: 0     }, // Stage 2: Services
  { z: -28,  y: 2.4, x: 1.2,  rotY: -0.06, rotX: -0.03 }, // Stage 3: Process
  { z: -75,  y: 1.6, x: -0.8, rotY: 0.05,  rotX: 0.02  }, // Stage 4: Results
  { z: -125, y: 2.0, x: 0.8,  rotY: -0.04, rotX: -0.02 }, // Stage 5: Pricing
  { z: -175, y: 1.8, x: 0,    rotY: 0,     rotX: 0     }, // Stage 6: Testimonials
  { z: -220, y: 2.2, x: 0,    rotY: 0,     rotX: 0.02  }, // Stage 7: Final CTA
];
```

- **`z`**: Controls camera distance along the track. Lower negative numbers move further into the scene.
- **`y`**: Camera height elevation.
- **`x`**: Horizontal pan offset.
- **`rotY` / `rotX`**: Subtle orientation angles (in radians).
- **Interpolation**: Camera coordinates are computed using smooth cubic Hermite interpolation with lerp damping (`0.085`).

---

## 3. Swapping or Modifying 3D Objects & Materials

All 3D objects are created and animated in [`src/components/consultancy/Scene.tsx`](./Scene.tsx):

- **Hero 3D Task Card & Gyroscope** (`heroStage` at `Z: 22`):
  Uses `MeshPhysicalMaterial` with glass transmission (`transmission: 0.75`), roughness (`0.1`), and emissive glow.
- **Services Cubes** (`serviceNodes` around `Z: 0` to `-10`):
  Cubes rotating on independent orbits around the camera trajectory.
- **Process Rail Nodes** (`stepNodes` from `Z: -32` to `-50`):
  Glowing emerald and sky octahedrons connected by a pulsing central spline conduit.
- **Results Data Pillars** (`dataPillars` at `Z: -80`):
  Extruded cylinders representing quantitative metrics with glowing halos.
- **Pricing Pedestals** (`pricingPillars` at `Z: -130`):
  Floating pedestals with crown and gemstone geometries.
- **Testimonial Ring** (`testimonialsStage` at `Z: -178`):
  Rotating ring of translucent cards with orbital nodes.
- **Starfield Particles**:
  2,200 particle buffer geometry streaming past the camera.

To import an external `.gltf` / `.glb` model instead of procedural Three.js primitives:
```typescript
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const loader = new GLTFLoader();
loader.load("/models/custom-model.glb", (gltf) => {
  heroStage.add(gltf.scene);
});
```

---

## 4. Updating Copy, Services & Metrics

- **Hero Copy**: Edit `HeroSection.tsx` (`headline`, `subheading`, badges).
- **Consultancy Services**: Edit `SERVICES_DATA` array in `ServicesSection.tsx`.
- **Process Steps**: Edit `PROCESS_STEPS` array in `ProcessSection.tsx`.
- **Results & Metrics**: Edit `METRICS_DATA` array in `ResultsSection.tsx`.
- **Pricing Tiers**: Edit `PRICING_TIERS` array in `PricingSection.tsx`.
- **Testimonials**: Edit `TESTIMONIALS_DATA` array in `TestimonialsSection.tsx`.
- **Form Endpoints**: Edit `handleSubmit` in `ConsultationForm.tsx` (targets `/api/consultancy-requests`, with fallback to Supabase table `consultancy_requests` and `localStorage`).

---

## 5. Performance & Accessibility (WCAG AA)

- **Dark Theme Palette**: Midnight Navy (`#020617` / `#040e24`), Emerald Green (`#10b981`), Electric Sky Blue (`#38bdf8`), Soft White (`#f8fafc`).
- **High Contrast**: Meets WCAG AA standards with minimum contrast ratio > 4.5:1 against glassmorphic panels.
- **Prefers Reduced Motion**: Automatic media query detection + user toggle button in header. Disables 3D canvas and simplifies animations.
- **WebGL Fallback**: Proactively detects WebGL context; displays clean 2D layout if unsupported.
- **Resource Disposal**: Geometry and material instances are tracked and systematically disposed of on unmount to eliminate memory leaks.

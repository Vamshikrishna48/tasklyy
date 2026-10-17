# Tasskly Campus 3D Consultancy Architecture

A production-grade, scroll-driven 3D campus experience built for Tasskly's university and student consultancy portal. Powered by Three.js, React, Tailwind CSS, and Framer Motion.

---

## 1. Directory Structure

```
src/
├── components/
│   └── consultancy/
│       ├── CameraRig.tsx               # 9-stop campus spline camera flight path
│       ├── Scene.tsx                   # Three.js 3D campus world (university building, caps, books, clock tower)
│       ├── Card3D.tsx                  # 3D interactive tilt & specular glare card container
│       ├── ConsultationForm.tsx        # Campus consultation form (Name, Email, Role, College, Dept, Message)
│       ├── sections/
│       │   ├── HeroSection.tsx         # Stop 1: Main Gate (Hero with headline, trust stats, CTAs)
│       │   ├── WhoWeHelpSection.tsx    # Stop 2: Campus Quad (Students, Clubs & Societies, Colleges)
│       │   ├── ServicesSection.tsx     # Stop 3: Central Library (6 academic services in 3x2 grid)
│       │   ├── ProcessSection.tsx      # Stop 4: Academic Path (4 milestone stops along the road)
│       │   ├── ResultsSection.tsx      # Stop 5: Project Lab (Split layout with 3 stacked metric cards & avatars)
│       │   ├── PricingSection.tsx      # Stop 6: Innovation Center (Student Starter, Club Plan, Campus Partnership)
│       │   ├── TestimonialsSection.tsx # Stop 7: Alumni Amphitheater (3D carousel ring of student/college stories)
│       │   ├── PartnersSection.tsx     # Stop 8: Partners Boulevard (Infinite marquee of 60+ partner campuses)
│       │   ├── BookingSection.tsx      # Stop 9: Graduation Stage (Two-column layout with glass form)
│       │   └── FooterSection.tsx       # Campus skyline illustration & 4-column footer
│       └── README.md                   # This guide
└── pages/
    └── Consultancy.tsx                 # Page controller with theme toggle, dot nav, and scroll progress
```

---

## 2. Campus Journey Stops & Camera Path

The camera travels smoothly through 9 campus stops defined in [`src/components/consultancy/CameraRig.tsx`](./CameraRig.tsx):

```typescript
private waypoints = [
  { z: 40,   y: 2.2, x: 0,    rotY: 0,     rotX: -0.02 }, // Stop 1: Main Gate (Hero)
  { z: 18,   y: 1.8, x: -1.2, rotY: 0.08,  rotX: 0     }, // Stop 2: Campus Quad (Who we help)
  { z: -18,  y: 2.4, x: 1.4,  rotY: -0.07, rotX: -0.02 }, // Stop 3: Central Library (Services)
  { z: -58,  y: 1.9, x: -1.0, rotY: 0.06,  rotX: 0.02  }, // Stop 4: Academic Path (Process)
  { z: -105, y: 2.3, x: 1.1,  rotY: -0.05, rotX: -0.02 }, // Stop 5: Research Lab (Results)
  { z: -155, y: 1.7, x: -0.9, rotY: 0.05,  rotX: 0.01  }, // Stop 6: Innovation Center (Plans)
  { z: -205, y: 2.0, x: 0.8,  rotY: -0.04, rotX: 0     }, // Stop 7: Alumni Amphitheater (Stories)
  { z: -250, y: 1.8, x: -0.6, rotY: 0.03,  rotX: 0.01  }, // Stop 8: Partners Boulevard
  { z: -295, y: 2.2, x: 0,    rotY: 0,     rotX: 0.02  }, // Stop 9: Graduation Stage (Final CTA)
];
```

Coordinates interpolate smoothly with cubic Hermite curves and lerp damping (`0.085`).

---

## 3. 3D Procedural Campus Assets ([`Scene.tsx`](./Scene.tsx))

- **Classical University Building**: 3-step plinth, 6 Corinthian-inspired columns, entablature, pediment, and glowing entrance portal.
- **Graduation Caps (Mortarboards)**: Skull cap, square mortarboard, gold button, and dynamic swinging tassel.
- **Hardcover Books & Pages**: Colorful covers (emerald, sky blue, amber, coral) with gold spine detailing and white page blocks.
- **Campus Clock Tower**: Multi-dial clock tower with pointed spire roof.
- **Academic Road**: Curved tube mesh winding continuously along the camera track.
- **Diploma Scroll**: Cylindrical rolled parchment with gold ribbon.
- **Starfield Sparkles**: 2,000 dual-colored particles streaming in depth.

---

## 4. Theme System (Academic Light & Cinematic Dark)

Toggle between:
- **Bright Academic Mode**: Soft sky-blue and warm off-white panels, indigo text, and vivid emerald/amber accents.
- **Cinematic Dark Mode**: Midnight navy (`#020617`), glowing emerald `#10b981`, and electric sky blue `#38bdf8`.

Both modes meet **WCAG AA contrast standards** (> 4.5:1 ratio).

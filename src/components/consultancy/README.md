# Tasskly Mentorship Consultancy Architecture

A production-grade, conversion-optimized 1-on-1 mentorship platform built for students, school leavers, and university alumni.

---

## 1. Directory Structure

```
src/
├── components/
│   └── consultancy/
│       ├── StudentPathCanvas3D.tsx     # 3D Winding Career Path with 5 milestone markers & floating mentor avatars
│       ├── BookingPanel.tsx            # Reusable booking panel (Day strip, time slots, Google Calendar sync)
│       ├── MentorCard.tsx              # 3D tilt mentor card with verified badge & amber next available pill
│       ├── data/
│       │   └── mentorsData.ts          # Verified mentors, categories, reviews, and FAQ dataset
│       ├── sections/
│       │   ├── NavbarSection.tsx       # Fixed navbar with links & reduce-motion toggle
│       │   ├── HeroSection.tsx         # Search bar, 5 category chips, trust row, and 3D path
│       │   ├── ChooseGoalSection.tsx   # 5 cards in a row for Course, Admissions, Abroad, Internships, Placements
│       │   ├── MarketplaceSection.tsx  # Filter bar & 3-across mentor card grid
│       │   ├── FeaturedMentorSection.tsx # Featured mentor spotlight with video thumbnail & timeline
│       │   ├── HowBookingWorksSection.tsx # 3 numbered steps with 3D flip card
│       │   ├── BookingSection.tsx      # Standalone booking panel section
│       │   ├── StudentStoriesSection.tsx # 3 before-and-after story cards
│       │   ├── BecomeMentorSection.tsx # 3 mentor benefits & application dialog modal
│       │   ├── FaqSection.tsx          # 5 interactive student accordions
│       │   ├── FinalCtaSection.tsx     # Full-width action block with reassurance guarantee
│       │   └── FooterSection.tsx       # Simple light 3-column footer with socials
│       └── README.md                   # This documentation
└── pages/
    └── Consultancy.tsx                 # Master page with scroll progress & mobile sticky action bar
```

---

## 2. "Your Path, One Conversation Away" 3D Concept

A single continuous 3D winding road with 5 career milestone markers:
1. **Choose Course** (`milestoneIndex: 0`)
2. **Get Admission** (`milestoneIndex: 1`)
3. **Study Abroad** (`milestoneIndex: 2`)
4. **Land Internship** (`milestoneIndex: 3`)
5. **Get Placed** (`milestoneIndex: 4`)

- As the user scrolls, the camera travels along the path and highlights the active milestone.
- Real mentor portraits float gently alongside the pathway.
- Fully accessible with a **Reduce Motion** button that transitions to a sleek 2D progress stepper.

---

## 3. Visual System

- **Palette**: White base (`#ffffff`), soft light-blue (`#f0f7ff`) and cream (`#f8fafc`) sections, royal blue primary (`#2563eb`), warm amber highlight (`#f59e0b` / `#d97706`), dark navy text (`#0f172a`).
- **Real Photos**: Verified portraits in rounded frames (no cartoon clip-art, no neon glow).
- **Mobile First**: Sticky bottom action bar (`Find a mentor`), swipeable category cards, and responsive tap targets.

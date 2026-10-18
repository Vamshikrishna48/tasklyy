# 🚀 Tasskly — Student Freelance Marketplace & 1-on-1 Mentorship Platform

<p align="center">
  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="Tasskly Banner" width="100%" style="border-radius: 12px; max-height: 380px; object-fit: cover;" />
</p>

<p align="center">
  <strong>Empowering students to monetize skills, build portfolios, and connect with verified mentors through a 3D-driven campus ecosystem.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

---

## 📖 What is Tasskly?

**Tasskly** is an all-in-one digital platform purpose-built for college and university students, school leavers, and ambitious young professionals. It bridges the critical transition between academic studies, real-world earnings, and career acceleration by providing two core pillars in one seamless application:

1. **The Student Freelance Gig Marketplace** — A secure space where students get hired for micro-jobs, software engineering, UI/UX design, academic research, video editing, and peer tutoring. All payments are protected by a tamper-proof **Escrow guarantee**.
2. **1-on-1 Mentorship & 3D Career Path (`/consultancy`)** — A high-impact mentorship portal where students book personalized 1-on-1 video sessions with verified seniors, alumni, and industry engineers who have already achieved the goals they are aiming for: *College Admissions, Course Selection, Study Abroad, Tech Internships, and Campus Placements*.

---

## ✨ Key Features & Modules

### 🎯 1. 1-on-1 Student Mentorship & 3D Milestone Path (`/consultancy`)
- **"Your Path, One Conversation Away"**: A continuous, scroll-driven 3D winding road with 5 milestone markers:
  1. 📘 **Choose Course** — Degree selection, branch changes, and curriculum strategy.
  2. 🏛️ **Get Admission** — Entrance exams, SOP reviews, and college shortlisting.
  3. ✈️ **Study Abroad** — GRE/IELTS prep, US/UK/EU university applications, visa guidance.
  4. 💼 **Land Internship** — Resume reviews, open-source contributions, and cold emailing.
  5. 🎓 **Get Placed** — Coding interviews, system design, mock HR rounds, and salary negotiation.
- **Interactive 3D Scene**: Built using `@react-three/fiber` and `@react-three/drei` with realistic mentor avatar orbits, ambient lighting, and smooth scroll synchronization.
- **Accessibility & Motion Control**: Includes an accessible **Reduce Motion** switch that toggles between the 3D canvas and a high-contrast 2D milestone progress stepper.
- **Verified Mentor Profiles**: Real photos, credentials, current companies/universities, rating metrics, and transparent pricing in Indian Rupees (₹).
- **Direct Booking Engine**:
  - 7-day horizontal date strip with instant morning/afternoon/evening slots.
  - One-click Google Calendar sync (`.ics` / Google Calendar link generation).
  - Instant Google Meet conference link generation upon confirmation.

### 💼 2. Student Freelance Marketplace (`/jobs` & `/post-job`)
- **Micro-Tasks & Long-Term Gigs**: Browse tasks by category, skills, budget, and deadlines.
- **Task Posting with Live Budgeting**: Students and campus teams can post jobs with attachment uploads, requirements, and required deliverables.
- **Application & Bidding Flow**: Student freelancers pitch their approach, portfolio proofs, and delivery estimates.

### 🛡️ 3. Safe Escrow & Milestone Payments
- **Zero Risk Guarantee**: Client funds are deposited into Escrow before a student begins working.
- **Deliverable Inspection**: Freelancers upload completed work directly to the dashboard. The client reviews the output before Escrow funds are released.
- **Dispute Resolution & Ledger**: Admin oversight ensures transparent resolution and automated ledger tracking.

### 🏆 4. Student Leveling & Progression System (`/dashboard/levels`)
- Tiered reputation ladder (**Bronze → Silver → Gold → Platinum → Diamond**).
- Level progression is unlocked through completed gigs, positive reviews, on-time submissions, and client satisfaction scores.
- Unlocks lower commission fees, higher visibility in search, and verified top-rated badges.

### 📱 5. Mobile-First & Cross-Platform (Capacitor Ready)
- Fully responsive on iOS and Android viewports.
- Integrated Capacitor configuration (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`) for packaging as a native mobile application.
- Mobile bottom sheets, gesture navigation, and native splash screens.

### 🤖 6. AI Assistant & In-App Communication
- Built-in AI Chatbot (`AIChatBot.tsx`) assisting students with job proposal writing, task scoping, and platform navigation.
- Real-time client-to-freelancer messaging with file previews and status indicators.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/) | High-speed SPA with fast hot module replacement |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict type safety, clean interfaces, and maintainability |
| **3D Rendering** | [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei) | WebGL 3D career milestone canvas, spline camera motion |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) | Accessible, customizable headless primitives |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) | Responsive design, glassmorphism, fluid typography |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Smooth UI entrances, micro-interactions, spring physics |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent SVG icon set |
| **Database & Auth** | [Supabase](https://supabase.com/) | PostgreSQL, user authentication, storage buckets, RLS |
| **State & Fetching** | [TanStack React Query](https://tanstack.com/query) | Server state management and caching |
| **Mobile Runtime** | [Capacitor](https://capacitorjs.com/) | Native runtime bridge for Android & iOS |

---

## 📂 Project Directory Structure

```
study-skills-market-main/
├── src/
│   ├── components/
│   │   ├── consultancy/                 # 1-on-1 Mentorship & 3D Roadmap Module
│   │   │   ├── StudentPathCanvas3D.tsx  # 3D Winding Career Path with 5 milestones
│   │   │   ├── BookingPanel.tsx         # Reusable booking panel & calendar sync
│   │   │   ├── MentorCard.tsx           # 3D tilt mentor card with verified badges
│   │   │   ├── data/
│   │   │   │   └── mentorsData.ts       # Verified mentors, categories, reviews dataset
│   │   │   └── sections/                # 12 Modular landing sections
│   │   │       ├── NavbarSection.tsx    # Sticky header with motion toggle
│   │   │       ├── HeroSection.tsx      # Headline, category chips, 3D path
│   │   │       ├── ChooseGoalSection.tsx# 5 Goal selection cards
│   │   │       ├── MarketplaceSection.tsx # Filterable mentor catalog
│   │   │       ├── BookingSection.tsx   # Standalone booking panel
│   │   │       └── ...
│   │   ├── ui/                          # shadcn/ui components (Button, Dialog, Sheet, etc.)
│   │   ├── Navbar.tsx                   # Global navigation with active routes & mobile drawer
│   │   ├── DashboardSidebar.tsx         # Collapsible dashboard sidebar
│   │   ├── AIChatBot.tsx                # Embedded AI assistant
│   │   └── MagicBento.tsx               # Interactive bento grid showcase
│   ├── pages/
│   │   ├── Index.tsx                    # Landing homepage
│   │   ├── Consultancy.tsx              # Master 1-on-1 Mentorship page
│   │   ├── BrowseJobs.tsx               # Gig marketplace search & filters
│   │   ├── JobDetail.tsx                # Single task inspection & proposal submission
│   │   ├── PostJob.tsx                  # Client task creation flow
│   │   ├── Internships.tsx              # Student internship directory
│   │   ├── Auth.tsx                     # Login, Registration & OTP verification
│   │   └── dashboard/                   # Student & Client dashboard views
│   │       ├── DashboardOverview.tsx    # Metrics, earnings, quick actions & mentorship banner
│   │       ├── MyJobs.tsx               # Active and completed contracts
│   │       ├── Earnings.tsx             # Wallet, payouts, and transaction history
│   │       ├── Levels.tsx               # Gamified reputation status
│   │       └── Portfolio.tsx            # Student showcase
│   ├── context/
│   │   └── AppContext.tsx               # Global authentication, job state & user profile
│   ├── lib/
│   │   └── supabase.ts                  # Supabase client configuration
│   ├── App.tsx                          # App routing and theme providers
│   └── main.tsx                         # Entry point
├── public/                              # Static public assets
├── package.json                         # Project dependencies and build scripts
├── tailwind.config.ts                   # Tailwind theme design tokens
├── vite.config.ts                       # Vite configuration
└── README.md                            # Project documentation
```

---

## ⚡ Quick Start & Local Setup

Follow these steps to run Tasskly locally on your development machine:

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher) or **pnpm** / **yarn**
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/Vamshikrishna48/tasklyy.git
cd tasklyy
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:8080` (or the port indicated in your terminal) to explore Tasskly!

### 6. Build for Production
To create an optimized production bundle:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 🧭 Navigation Routes Overview

| Route | Description |
|---|---|
| `/` | **Home**: Brand hero, verified student counts, campus network globe, and key pillars |
| `/consultancy` | **1-on-1 Mentorship**: 3D career milestone road, verified mentor directory, and instant booking |
| `/jobs` | **Browse Jobs**: Searchable marketplace of student gigs, tasks, and assignments |
| `/post-job` | **Post a Task**: Create a new task with budget, description, and escrow deposit |
| `/internships` | **Internships**: Curated student internship and placement opportunities |
| `/dashboard` | **Student Dashboard**: Overview of earnings, active gigs, escrow status, and quick shortcuts |
| `/dashboard/levels` | **My Level**: Reputation ladder and progression badges |
| `/auth` | **Authentication**: Sign in / Sign up with OTP verification |

---

## 🤝 Community & Support

- **Inquiries & Partnerships**: [support@tasskly.com](mailto:support@tasskly.com)
- **WhatsApp Support**: +91 9640008684
- **Feedback & Issues**: Please open an issue on the [GitHub Issues](https://github.com/Vamshikrishna48/tasklyy/issues) tab.

---

<p align="center">
  Made with ❤️ for students, future leaders, and campus builders everywhere.
</p>

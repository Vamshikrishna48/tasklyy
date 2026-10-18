export interface Mentor {
  id: string;
  name: string;
  role: string;
  companyOrCollege: string;
  avatar: string;
  coverImage?: string;
  category: "admissions" | "course-selection" | "study-abroad" | "internships" | "placements";
  categoryLabel: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  sessionCount: number;
  price: number; // 0 for Free Intro
  priceLabel: string;
  nextAvailable: string; // e.g. "Today 6 PM"
  bio: string;
  experienceYears: number;
  languages: string[];
  videoThumbnail?: string;
  journeyTimeline?: { year: string; title: string; subtitle: string }[];
  featured?: boolean;
}

export interface GoalCategory {
  id: "admissions" | "course-selection" | "study-abroad" | "internships" | "placements";
  title: string;
  promise: string;
  photo: string;
  milestoneIndex: number;
  mentorCount: number;
  badgeColor: string;
}

export const GOAL_CATEGORIES: GoalCategory[] = [
  {
    id: "course-selection",
    title: "Course Selection",
    promise: "Pick the right major and stream based on real career outcomes, not guesswork.",
    photo: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    milestoneIndex: 0,
    mentorCount: 94,
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "admissions",
    title: "College Admissions",
    promise: "Crack entrance exams, ace cutoffs, and choose between tier-1 and tier-2 colleges.",
    photo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80",
    milestoneIndex: 1,
    mentorCount: 142,
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    id: "study-abroad",
    title: "Study Abroad",
    promise: "Get your SOP, GRE/IELTS, and university applications reviewed by admitted alumni.",
    photo: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&auto=format&fit=crop&q=80",
    milestoneIndex: 2,
    mentorCount: 118,
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    id: "internships",
    title: "Land Internship",
    promise: "Build a resume recruiters read, learn off-campus outreach, and clear tech rounds.",
    photo: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
    milestoneIndex: 3,
    mentorCount: 186,
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "placements",
    title: "Campus Placements",
    promise: "System design drills, mock coding rounds, and negotiation tactics for top dream offers.",
    photo: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
    milestoneIndex: 4,
    mentorCount: 165,
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
];

export const MENTORS_DATA: Mentor[] = [
  {
    id: "mentor-aarav",
    name: "Aarav Sharma",
    role: "Software Engineer II",
    companyOrCollege: "Google (Ex-IIT Delhi)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    category: "placements",
    categoryLabel: "Placements",
    tags: ["System Design", "LeetCode Sprints", "FAANG Offers"],
    rating: 4.96,
    reviewCount: 78,
    sessionCount: 210,
    price: 0,
    priceLabel: "Free intro",
    nextAvailable: "Today 6:00 PM",
    bio: "Graduated with 3 day-one placement offers. Mentored 120+ students from tier-2 and tier-3 colleges into top engineering and cloud roles.",
    experienceYears: 4,
    languages: ["English", "Hindi"],
    featured: true,
    videoThumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    journeyTimeline: [
      { year: "2019", title: "Joined IIT Delhi", subtitle: "B.Tech Computer Science" },
      { year: "2021", title: "Summer SWE Intern", subtitle: "Google Bangalore" },
      { year: "2023", title: "Full-Time SWE", subtitle: "Google Cloud Platform" },
      { year: "2024", title: "Promoted to SWE II", subtitle: "Interview Bar Raiser" },
    ],
  },
  {
    id: "mentor-tanya",
    name: "Tanya Kapoor",
    role: "MS Computer Science Scholar",
    companyOrCollege: "Carnegie Mellon (Ex-BITS Pilani)",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    category: "study-abroad",
    categoryLabel: "Study Abroad",
    tags: ["CMU / Stanford", "SOP Reviews", "GRE 332 Guide"],
    rating: 4.98,
    reviewCount: 64,
    sessionCount: 185,
    price: 499,
    priceLabel: "₹499 / 45 mins",
    nextAvailable: "Today 7:30 PM",
    bio: "Secured admits to CMU, Columbia, and UIUC with scholarship funding. I review your research papers, statement of purpose, and professor cold-emails.",
    experienceYears: 3,
    languages: ["English", "Hindi"],
    journeyTimeline: [
      { year: "2020", title: "Graduated BITS Pilani", subtitle: "9.2 CGPA with 2 IEEE papers" },
      { year: "2022", title: "Admitted to CMU SCS", subtitle: "Graduate Research Assistant" },
      { year: "2024", title: "Incoming ML Engineer", subtitle: "Meta AI, Menlo Park" },
    ],
  },
  {
    id: "mentor-rohit",
    name: "Rohit Verma",
    role: "Senior Product Manager",
    companyOrCollege: "Microsoft (Ex-IIM Ahmedabad)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    category: "internships",
    categoryLabel: "Internships",
    tags: ["PM Case Studies", "Off-Campus Sprints", "Resume Audit"],
    rating: 4.92,
    reviewCount: 92,
    sessionCount: 310,
    price: 399,
    priceLabel: "₹399 / 45 mins",
    nextAvailable: "Tomorrow 5:00 PM",
    bio: "Converted an off-campus internship into a full-time APM role. Reviewed over 800 resumes and conducted 100+ product case interview rounds.",
    experienceYears: 6,
    languages: ["English", "Hindi"],
  },
  {
    id: "mentor-shreya",
    name: "Dr. Shreya Mukherjee",
    role: "Admissions Consultant & Senior Researcher",
    companyOrCollege: "Oxford University Alum",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    category: "admissions",
    categoryLabel: "College Admissions",
    tags: ["Ivy & Oxbridge", "Scholarships", "Profile Building"],
    rating: 5.0,
    reviewCount: 41,
    sessionCount: 140,
    price: 599,
    priceLabel: "₹599 / 45 mins",
    nextAvailable: "Today 8:00 PM",
    bio: "Rhodes Scholar alumna helping students map college choices, navigate entrance exams, and polish application essays for global universities.",
    experienceYears: 7,
    languages: ["English", "Bengali"],
  },
  {
    id: "mentor-kartik",
    name: "Kartik Nair",
    role: "Academic Counselor & CS Mentor",
    companyOrCollege: "IIT Madras (Gold Medalist)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    category: "course-selection",
    categoryLabel: "Course Selection",
    tags: ["Branch Change", "CSE vs ECE", "Future Career Paths"],
    rating: 4.89,
    reviewCount: 53,
    sessionCount: 160,
    price: 0,
    priceLabel: "Free intro",
    nextAvailable: "Today 9:00 PM",
    bio: "Confused between Computer Science, Data Science, or Electronics? I break down real course difficulty, curriculum overlap, and 5-year salary trajectories.",
    experienceYears: 4,
    languages: ["English", "Malayalam", "Hindi"],
  },
  {
    id: "mentor-neha",
    name: "Neha Sundaram",
    role: "Frontend Engineer & Mentor",
    companyOrCollege: "Uber (Ex-NIT Trichy)",
    avatar: "https://images.unsplash.com/photo-1534751516642-a1714f5262c5?w=400&auto=format&fit=crop&q=80",
    category: "internships",
    categoryLabel: "Internships",
    tags: ["React & WebDev", "GitHub Portfolio", "Mock Interviews"],
    rating: 4.95,
    reviewCount: 68,
    sessionCount: 225,
    price: 299,
    priceLabel: "₹299 / 45 mins",
    nextAvailable: "Tomorrow 6:30 PM",
    bio: "Helped 60+ tier-3 engineering students build GitHub portfolio projects that landed paid summer internships at product companies.",
    experienceYears: 3,
    languages: ["English", "Tamil", "Hindi"],
  },
  {
    id: "mentor-vikram",
    name: "Vikram Rathore",
    role: "Quant Analyst & Campus Bar Raiser",
    companyOrCollege: "Goldman Sachs (Ex-IIT Bombay)",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
    category: "placements",
    categoryLabel: "Placements",
    tags: ["High Finance", "Math Puzzles", "Resume Roasting"],
    rating: 4.97,
    reviewCount: 88,
    sessionCount: 270,
    price: 499,
    priceLabel: "₹499 / 45 mins",
    nextAvailable: "Today 7:00 PM",
    bio: "Cracked day-one placement for quant finance with 45 LPA CTC. Mock technical rounds with rubric-grade probability and algorithmic puzzles.",
    experienceYears: 5,
    languages: ["English", "Hindi"],
  },
  {
    id: "mentor-ananya",
    name: "Ananya Deshmukh",
    role: "Graduate Scholar",
    companyOrCollege: "TU Munich (Ex-COEP Pune)",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    category: "study-abroad",
    categoryLabel: "Study Abroad",
    tags: ["Germany / EU", "Zero Tuition Fees", "Visa & APS"],
    rating: 4.94,
    reviewCount: 49,
    sessionCount: 155,
    price: 0,
    priceLabel: "Free intro",
    nextAvailable: "Tomorrow 4:00 PM",
    bio: "Studying in Germany on public university zero-tuition fees. Guiding students on APS certification, German blocked accounts, and English-taught programs.",
    experienceYears: 3,
    languages: ["English", "Marathi", "German"],
  },
  {
    id: "mentor-dev",
    name: "Dev Singhania",
    role: "Founder & Career Strategist",
    companyOrCollege: "St. Stephen's College Alum",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    category: "admissions",
    categoryLabel: "College Admissions",
    tags: ["CUET Prep", "Top DU Colleges", "Economics / BBA"],
    rating: 4.88,
    reviewCount: 39,
    sessionCount: 130,
    price: 299,
    priceLabel: "₹299 / 45 mins",
    nextAvailable: "Today 8:30 PM",
    bio: "99.8th percentile in university entrance tests. Helping high school graduates map college cutoffs and build compelling extracurricular profiles.",
    experienceYears: 4,
    languages: ["English", "Hindi"],
  },
];

export const STUDENT_STORIES_DATA = [
  {
    id: "story-1",
    name: "Karan Joshi",
    college: "Now at IIT Roorkee",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
    before: "Confused between Mechanical at Tier-1 vs CS at Tier-3 college",
    after: "Booked Kartik Nair, chose Data Science, and maintained a 9.2 GPA",
    quote: "Talking to an IIT senior for 45 minutes saved me from making a 4-year mistake. He explained what real recruiters care about.",
    mentorName: "Kartik Nair",
  },
  {
    id: "story-2",
    name: "Sneha Pillai",
    college: "Now Software Intern at Microsoft",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    before: "Rejected from 18 off-campus applications without a single interview call",
    after: "Revamped resume with Rohit Verma, got 3 interview calls in 2 weeks",
    quote: "Rohit pointed out formatting mistakes in my resume within 5 minutes. The very next week, I had two interview invitations.",
    mentorName: "Rohit Verma",
  },
  {
    id: "story-3",
    name: "Tanmay Bansal",
    college: "Admitted to Carnegie Mellon (MS CS)",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    before: "Struggling with SOP drafts and unsure if 318 GRE was enough for US admits",
    after: "Reviewed SOP with Tanya Kapoor, received admits with scholarship from CMU & Columbia",
    quote: "Tanya went line by line through my statement of purpose. Having someone currently at CMU critique your work is invaluable.",
    mentorName: "Tanya Kapoor",
  },
];

export const FAQ_DATA = [
  {
    question: "How are mentors verified?",
    answer: "Every mentor must submit official proof of their current college enrollment, degree, or working company email address. Our team conducts a 1-on-1 vetting call and verifies LinkedIn credentials before anyone can take a session.",
  },
  {
    question: "What if I'm not satisfied with my session?",
    answer: "We offer a 100% money-back guarantee. If your mentor was late, unprepared, or your questions were not addressed, notify us within 24 hours and we will issue an immediate refund or book you with another mentor for free.",
  },
  {
    question: "Is the first session free?",
    answer: "Many mentors offer a complimentary 15-minute 'Free Intro' session to understand your goals and ensure they are the right fit before scheduling a deep-dive paid consultation.",
  },
  {
    question: "How long is a session?",
    answer: "Standard 1-on-1 mentorship sessions are 45 minutes long. Free intro sessions are 15 minutes. All sessions take place over high-quality Google Meet with video and screen sharing.",
  },
  {
    question: "Is my personal information private?",
    answer: "Yes, completely. Your contact details, phone number, and conversation notes are strictly confidential and never sold to third-party colleges or marketing agencies.",
  },
];

export interface Mentor {
  id: string;
  name: string;
  role: string;
  companyOrCollege: string;
  avatar: string;
  coverImage?: string;
  category: "admissions" | "course-selection" | "study-abroad" | "college" | "seat" | "internships" | "placements";
  categoryLabel: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  sessionCount: number;
  price: number; // Flat ₹500
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
  id: "admissions" | "course-selection" | "study-abroad" | "college" | "seat" | "internships" | "placements";
  title: string;
  promise: string;
  photo: string;
  milestoneIndex: number;
  mentorCount: number;
  badgeColor: string;
}

export const GOAL_CATEGORIES: GoalCategory[] = [
  {
    id: "admissions",
    title: "College Admissions",
    promise: "Crack entrance exams, ace cutoffs, and choose between tier-1 and tier-2 colleges.",
    photo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80",
    milestoneIndex: 0,
    mentorCount: 142,
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    id: "course-selection",
    title: "Course Selection",
    promise: "Pick the right major and stream based on real career outcomes, not guesswork.",
    photo: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    milestoneIndex: 1,
    mentorCount: 94,
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
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
    id: "college",
    title: "College Comparison",
    promise: "Unfiltered truths on tier-1 vs tier-2 colleges, hostels, clubs, and campus culture.",
    photo: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
    milestoneIndex: 3,
    mentorCount: 156,
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "seat",
    title: "Seat Allotment",
    promise: "JoSAA, CET & state counseling choice-filling, branch sliding, and spot rounds.",
    photo: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
    milestoneIndex: 4,
    mentorCount: 172,
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
];

export const MENTORS_DATA: Mentor[] = [
  {
    id: "arjun-sharma",
    name: "Arjun Sharma",
    role: "Senior Engineering Alum & JoSAA Counselor",
    companyOrCollege: "IIT Delhi (Ex-Google L4)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    category: "seat",
    categoryLabel: "Seat & College",
    tags: ["JoSAA Choice-Filling", "IIT Delhi Reality", "Branch Sliding"],
    rating: 4.98,
    reviewCount: 142,
    sessionCount: 420,
    price: 500,
    priceLabel: "₹500 / session",
    nextAvailable: "Today 6:00 PM",
    bio: "Ranked in top 500 JEE Advanced. Mentored 300+ students through JoSAA & state counseling rounds to secure their ideal branch and college.",
    experienceYears: 4,
    languages: ["English", "Hindi"],
    featured: true,
    journeyTimeline: [
      { year: "2019", title: "Joined IIT Delhi", subtitle: "B.Tech Computer Science" },
      { year: "2021", title: "Summer SWE Intern", subtitle: "Google Bangalore" },
      { year: "2023", title: "Full-Time SWE", subtitle: "Google Cloud Platform" },
      { year: "2024", title: "Promoted to SWE II", subtitle: "Interview Bar Raiser" },
    ],
  },
  {
    id: "sarah-jenkins",
    name: "Sarah Jenkins",
    role: "Graduate Researcher & Admissions Fellow",
    companyOrCollege: "Stanford University (MS CS)",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    category: "study-abroad",
    categoryLabel: "Study Abroad",
    tags: ["Stanford MS CS", "Ivy League SOP", "Tuition Waivers"],
    rating: 4.99,
    reviewCount: 98,
    sessionCount: 310,
    price: 500,
    priceLabel: "₹500 / session",
    nextAvailable: "Today 7:30 PM",
    bio: "Secured admits to Stanford, CMU, and MIT with graduate research assistantships. I review your SOP line-by-line and help target professors.",
    experienceYears: 3,
    languages: ["English", "Spanish"],
    featured: true,
  },
  {
    id: "priya-patel",
    name: "Priya Patel",
    role: "Management Consultant & Admissions Lead",
    companyOrCollege: "IIM Ahmedabad (Ex-McKinsey)",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    category: "admissions",
    categoryLabel: "B-School & Seat Matrix",
    tags: ["IIM Ahmedabad", "CAT 99.9%", "Seat Matrix Strategy"],
    rating: 4.97,
    reviewCount: 112,
    sessionCount: 380,
    price: 500,
    priceLabel: "₹500 / session",
    nextAvailable: "Tomorrow 5:00 PM",
    bio: "99.9th percentile in CAT. Specializes in MBA applications, spot rounds, merit quota optimization, and interviews for premier institutes.",
    experienceYears: 5,
    languages: ["English", "Hindi", "Gujarati"],
    featured: true,
  },
  {
    id: "david-kim",
    name: "David Kim",
    role: "Principal AI Engineer",
    companyOrCollege: "Microsoft AI (Tech Alum)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    category: "course-selection",
    categoryLabel: "Course & Engineering",
    tags: ["CS vs AI/ML", "Branch Sliding", "Microsoft"],
    rating: 4.95,
    reviewCount: 86,
    sessionCount: 290,
    price: 500,
    priceLabel: "₹500 / session",
    nextAvailable: "Today 8:00 PM",
    bio: "Helps students understand whether specialized AI/ML degrees are worth it versus foundational Computer Science, and how branch sliding works in practice.",
    experienceYears: 6,
    languages: ["English", "Korean"],
  },
  {
    id: "ananya-sengupta",
    name: "Ananya Sengupta",
    role: "Senior Dual-Degree Scholar",
    companyOrCollege: "BITS Pilani (Hyderabad)",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    category: "college",
    categoryLabel: "College & Dual Degree",
    tags: ["BITS Pilani", "Dual Degree", "Campus Realities"],
    rating: 4.96,
    reviewCount: 74,
    sessionCount: 240,
    price: 500,
    priceLabel: "₹500 / session",
    nextAvailable: "Tomorrow 6:30 PM",
    bio: "Unfiltered truths about BITS dual degrees, autonomous vs state universities, grading curves, and on-campus infrastructure.",
    experienceYears: 3,
    languages: ["English", "Hindi", "Bengali"],
  },
  {
    id: "rohan-nair",
    name: "Rohan Nair",
    role: "Research Assistant & Visa Fellow",
    companyOrCollege: "Carnegie Mellon (Ex-NIT)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    category: "study-abroad",
    categoryLabel: "Study Abroad & Hostels",
    tags: ["Carnegie Mellon", "F-1 Mock Visa", "Hostel & Clubs"],
    rating: 4.94,
    reviewCount: 91,
    sessionCount: 310,
    price: 500,
    priceLabel: "₹500 / session",
    nextAvailable: "Today 9:00 PM",
    bio: "Transitioned from an NIT hostel to CMU. Conducts F-1 mock visa interviews and shares the exact cultural shift students must prepare for.",
    experienceYears: 4,
    languages: ["English", "Malayalam", "Hindi"],
  },
  {
    id: "elena-rostova",
    name: "Elena Rostova",
    role: "Doctoral Fellow & DAAD Scholar",
    companyOrCollege: "ETH Zurich (Ex-TU Munich)",
    avatar: "https://images.unsplash.com/photo-1534751516642-a1714f5262c5?w=400&auto=format&fit=crop&q=80",
    category: "study-abroad",
    categoryLabel: "Study Abroad",
    tags: ["ETH Zurich", "Full Scholarships", "EU Visas"],
    rating: 4.98,
    reviewCount: 52,
    sessionCount: 190,
    price: 500,
    priceLabel: "₹500 / session",
    nextAvailable: "Tomorrow 4:00 PM",
    bio: "Studying in Europe with zero tuition fees. Advises on DAAD scholarships, German blocked accounts, and English-taught Master's programs.",
    experienceYears: 4,
    languages: ["English", "German", "Russian"],
  },
  {
    id: "marcus-vance",
    name: "Marcus Vance",
    role: "Senior Systems Engineer",
    companyOrCollege: "Uber Tech (Ex-Georgia Tech)",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
    category: "course-selection",
    categoryLabel: "Engineering Transition",
    tags: ["Non-CS to Tech", "System Design", "Uber"],
    rating: 4.93,
    reviewCount: 67,
    sessionCount: 215,
    price: 500,
    priceLabel: "₹500 / session",
    nextAvailable: "Today 8:30 PM",
    bio: "Switched from Mechanical Engineering to high-throughput backend engineering. Advises students on self-taught paths and bridge degrees.",
    experienceYears: 5,
    languages: ["English"],
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
    price: 500,
    priceLabel: "₹500 / session",
    nextAvailable: "Today 7:30 PM",
    bio: "Secured admits to CMU, Columbia, and UIUC with scholarship funding. Reviews research papers, SOPs, and professor cold-emails.",
    experienceYears: 3,
    languages: ["English", "Hindi"],
  },
  {
    id: "mentor-rohit",
    name: "Rohit Verma",
    role: "Senior Product Manager",
    companyOrCollege: "Microsoft (Ex-IIM Ahmedabad)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    category: "admissions",
    categoryLabel: "Product & Strategy",
    tags: ["PM Case Studies", "Career Roadmaps", "Resume Audit"],
    rating: 4.92,
    reviewCount: 92,
    sessionCount: 310,
    price: 500,
    priceLabel: "₹500 / session",
    nextAvailable: "Tomorrow 5:00 PM",
    bio: "Reviewed over 800 student profiles and resumes. Guides students on breaking into product management and tech consulting.",
    experienceYears: 6,
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
    after: "Booked Arjun Sharma, finalized choice-filling strategy, and secured desired seat",
    quote: "Talking to an IIT senior for 45 minutes saved me from making a 4-year mistake. He explained what real recruiters care about.",
    mentorName: "Arjun Sharma",
  },
  {
    id: "story-2",
    name: "Sneha Pillai",
    college: "Now at BITS Pilani (Computer Science)",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    before: "Unsure about dual-degree branch sliding chances and campus facilities",
    after: "Consulted Ananya Sengupta, understood the actual grading matrix, and planned courses",
    quote: "Ananya gave me the ground reality of campus life, hostel facilities, and how the dual degree cutoff actually works.",
    mentorName: "Ananya Sengupta",
  },
  {
    id: "story-3",
    name: "Tanmay Bansal",
    college: "Admitted to Carnegie Mellon (MS CS)",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    before: "Struggling with SOP drafts and unsure if 318 GRE was enough for US admits",
    after: "Reviewed SOP with Sarah Jenkins, received admits with scholarship from CMU & Columbia",
    quote: "Sarah went line by line through my statement of purpose. Having someone currently at Stanford critique your work is invaluable.",
    mentorName: "Sarah Jenkins",
  },
];

export const FAQ_DATA = [
  {
    question: "What is the fee for a 1-on-1 consultancy session?",
    answer: "Every 1-on-1 consultancy session is a flat ₹500 for a dedicated 45-minute consultation with a verified senior, alumnus, or industry expert. No hidden charges or surge pricing.",
  },
  {
    question: "When is my session officially confirmed?",
    answer: "After you pay ₹500, you will receive an immediate confirmation email with your booking request and payment receipt. Note that your session is confirmed when and only when the member/mentor approves your slot. Once approved, the Google Meet link is immediately activated.",
  },
  {
    question: "What happens if the member/mentor rejects my booking request?",
    answer: "If the mentor rejects your booking request or is unable to accommodate your selected time slot, your entire ₹500 payment is automatically refunded to your original payment method within 2 to 3 hours.",
  },
  {
    question: "How are mentors verified?",
    answer: "Every mentor must submit official proof of their university enrollment, degree certificate, or corporate email credentials. Our team validates their identity and LinkedIn profile before they can accept sessions.",
  },
  {
    question: "How do I join the session once approved?",
    answer: "As soon as the mentor approves your request, you will receive a calendar invite with a private Google Meet room link. You will also get a reminder notification 30 minutes before your scheduled call.",
  },
];

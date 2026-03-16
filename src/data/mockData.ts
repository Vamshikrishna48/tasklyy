export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  postedBy: {
    name: string;
    avatar: string;
    rating: number;
    campus?: string;
  };
  bidsCount: number;
  status: "open" | "in_progress" | "completed" | "payment_pending" | "deleted";
  createdAt: string;
  skills: string[];
  
  // New Features
  paymentType?: "money" | "skill";
  skillExchangeDetails?: string;
  isQuickTask?: boolean;
  campusOnly?: boolean;
  campusName?: string;
  isUrgent?: boolean;
  urgentTime?: string;
  isTeamTask?: boolean;
  teamRoles?: string[];
  isMentoring?: boolean;
  rescueMode?: boolean;

  // File attachments (hidden from other users until payment)
  attachedFiles?: AttachedFile[];
  // Accepted bidder info
  acceptedBidderId?: string;
  acceptedBidderName?: string;
  // Payment deadline timestamp (2 min from acceptance)
  paymentDeadline?: number;
  // Whether files are unlocked for accepted bidder
  filesUnlocked?: boolean;
  // Submitted work file
  submittedWork?: AttachedFile;
  // Specific task instructions (locked until payment)
  instructions?: string;
}

export interface AttachedFile {
  name: string;
  size: number;
  type: string;
  // Base64 data URL for demo (in production this would be a server URL)
  dataUrl: string;
}

export interface Bid {
  id: string;
  jobId: string;
  bidder: {
    name: string;
    avatar: string;
    rating: number;
    completedJobs: number;
    campus?: string;
    skillScores?: Record<string, number>;
  };
  amount: number;
  message: string;
  deliveryDays: number;
  createdAt: string;
}

export const categories = [
  { name: "Poster Design", icon: "🎨" },
  { name: "Coding Help", icon: "💻" },
  { name: "Assignment Help", icon: "📝" },
  { name: "Video Editing", icon: "🎬" },
  { name: "Writing", icon: "✍️" },
  { name: "Tutoring", icon: "📚" },
  { name: "Data Entry", icon: "📊" },
  { name: "Social Media", icon: "📱" },
  { name: "Presentation", icon: "📑" },
];

export const mockJobs: Job[] = [
  {
    id: "mock-job-1",
    title: "Design a poster for college cultural fest",
    description: "We need a vibrant A3-sized poster for our annual cultural fest 'Zephyr 2026'. The poster should include event name, date, venue, and highlight performances. Use bold colors and modern typography.",
    category: "Poster Design",
    budget: 800,
    deadline: "2026-03-25",
    postedBy: { name: "Arjun Mehta", avatar: "AM", rating: 4.7, campus: "IIT Delhi" },
    bidsCount: 2,
    status: "open",
    createdAt: "2026-03-12",
    skills: ["Figma", "Photoshop", "Canva"],
    attachedFiles: [
      { name: "fest_brief.pdf", size: 45000, type: "application/pdf", dataUrl: "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago=" },
    ],
  },
  {
    id: "mock-job-2",
    title: "Build a React portfolio website",
    description: "I need a personal portfolio website built with React and Tailwind CSS. Should have sections for About, Projects, Skills, and Contact. Must be responsive and deploy-ready.",
    category: "Coding Help",
    budget: 1500,
    deadline: "2026-03-28",
    postedBy: { name: "Priya Sharma", avatar: "PS", rating: 4.9, campus: "BITS Pilani" },
    bidsCount: 5,
    status: "open",
    createdAt: "2026-03-10",
    skills: ["React", "Tailwind CSS", "JavaScript"],
    attachedFiles: [
      { name: "portfolio_wireframe.png", size: 120000, type: "image/png", dataUrl: "data:image/png;base64,iVBORw0KGgoAAAA=" },
      { name: "requirements.pdf", size: 32000, type: "application/pdf", dataUrl: "data:application/pdf;base64,JVBERi0xLjQK=" },
    ],
  },
  {
    id: "mock-job-3",
    title: "Solve 20 calculus problems with step-by-step solutions",
    description: "Need detailed step-by-step solutions for 20 calculus problems covering integration, differentiation, and limits. Must include explanations for each step.",
    category: "Assignment Help",
    budget: 300,
    deadline: "2026-03-18",
    postedBy: { name: "Rahul Verma", avatar: "RV", rating: 4.5, campus: "NIT Trichy" },
    bidsCount: 1,
    status: "open",
    createdAt: "2026-03-14",
    skills: ["Mathematics", "Calculus"],
    isQuickTask: true,
    attachedFiles: [
      { name: "calculus_problems.pdf", size: 85000, type: "application/pdf", dataUrl: "data:application/pdf;base64,JVBERi0xLjMK=" },
    ],
  },
  {
    id: "mock-job-4",
    title: "Edit a 5-minute YouTube video with transitions",
    description: "I have raw footage for a tech review video. Need professional editing with smooth transitions, background music, lower thirds, and subtitles. Deliver in 1080p MP4.",
    category: "Video Editing",
    budget: 1200,
    deadline: "2026-03-22",
    postedBy: { name: "Sneha Patel", avatar: "SP", rating: 4.8, campus: "VIT Vellore" },
    bidsCount: 3,
    status: "open",
    createdAt: "2026-03-11",
    skills: ["Premiere Pro", "After Effects"],
  },
  {
    id: "mock-job-5",
    title: "Create a pitch deck for startup idea",
    description: "Need a professional 15-slide pitch deck for an EdTech startup. Should cover problem, solution, market size, business model, team, and financials. Modern design with charts.",
    category: "Presentation",
    budget: 600,
    deadline: "2026-03-20",
    postedBy: { name: "Karthik Raj", avatar: "KR", rating: 4.6, campus: "IIM Bangalore" },
    bidsCount: 0,
    status: "open",
    createdAt: "2026-03-13",
    skills: ["PowerPoint", "Google Slides", "Canva"],
    attachedFiles: [
      { name: "startup_details.docx", size: 65000, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", dataUrl: "data:application/octet-stream;base64,UEsDBBQ=" },
    ],
  },
];

export const mockBids: Bid[] = [];

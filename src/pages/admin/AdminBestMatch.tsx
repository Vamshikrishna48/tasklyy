import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Sparkles, Lock, Unlock, Calendar, Users, Briefcase, 
  MapPin, CheckCircle, Clock, AlertTriangle, Star, Search, Plus, Trash2, Send
} from "lucide-react";
import { format, differenceInDays, addMonths, isAfter } from "date-fns";

// Static premium mock internships from Internships.tsx
const mockInternships = [
  {
    id: "int-1",
    title: "Software Engineer Intern",
    company: "TechSprint Systems",
    location: "Remote",
    stipend: "₹15,000 / month",
    duration: "3 Months",
    skills: ["React", "TypeScript", "Node.js", "JavaScript", "HTML", "CSS"],
    description: "Work on developing user-facing features, building robust API integrations, and collaborating with our core product team."
  },
  {
    id: "int-2",
    title: "UI/UX Designer Intern",
    company: "DesignFlo Studios",
    location: "Remote",
    stipend: "₹10,000 / month",
    duration: "2 Months",
    skills: ["Figma", "Wireframing", "Prototyping", "Design", "UI/UX"],
    description: "Design high-fidelity user flows, construct beautiful components, and conduct wireframing tests for our next-gen mobile application."
  },
  {
    id: "int-3",
    title: "Data Analyst Intern",
    company: "FinGrow Analytics",
    location: "Hybrid (Bangalore)",
    stipend: "₹18,000 / month",
    duration: "6 Months",
    skills: ["Python", "SQL", "Excel", "PowerBI", "Database"],
    description: "Extract intelligence from database pools, design operational dashboards, and present performance metrics to key stakeholders."
  },
  {
    id: "int-4",
    title: "Social Media Marketing Intern",
    company: "Zenith Brands",
    location: "Remote",
    stipend: "₹8,000 / month",
    duration: "3 Months",
    skills: ["SEO", "Content Strategy", "Canva", "Marketing", "Social Media"],
    description: "Help expand our digital footprint by creating organic campaigns, managing copy drafts, and scheduling newsletters."
  }
];

// Mapping job categories to typical skills for auto-inference
const categorySkillsMap: Record<string, string[]> = {
  "Poster Design": ["Design", "Figma", "Canva", "UI/UX"],
  "Coding Help": ["Coding", "React", "TypeScript", "Node.js", "Python", "SQL", "JavaScript"],
  "Assignment Help": ["Writing", "Tutoring", "Research", "Excel"],
  "Video Editing": ["Video Editing", "Premiere", "After Effects"],
  "Writing": ["Writing", "Copywriting", "SEO", "Content Strategy"],
  "Tutoring": ["Tutoring", "Teaching", "Math", "Science"],
  "Data Entry": ["Excel", "Data Entry", "Database"],
  "Social Media": ["Social Media", "Marketing", "Canva", "Instagram"],
  "Presentation": ["PowerPoint", "Presentation", "Design", "Figma"],
};

export default function AdminBestMatch() {
  const [launchDateStr, setLaunchDateStr] = useState(() => {
    return localStorage.getItem("tasskly_app_launch_date") || "2025-12-01";
  });

  const [students, setStudents] = useState<any[]>([]);
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const launchDate = new Date(launchDateStr);
  const unlockDate = addMonths(launchDate, 6);
  const currentDate = new Date();
  const isLocked = isAfter(unlockDate, currentDate);
  const daysRemaining = differenceInDays(unlockDate, currentDate);

  // Load students & jobs
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch profiles that are workers
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select(`
          *,
          jobs_working:jobs!jobs_worker_id_fkey(id, title, status, budget, category, skills, created_at)
        `);

      if (pError) throw pError;

      // Filter to workers (exclude admins/posters unless they have working history)
      const workerProfiles = (profiles || []).filter((p: any) => p.role !== 'admin');
      setStudents(workerProfiles);

      // 2. Fetch all open jobs
      const { data: jobs, error: jError } = await supabase
        .from("jobs")
        .select("*, poster:profiles!jobs_poster_id_fkey(full_name)")
        .eq("status", "open");

      if (jError) throw jError;
      setDbJobs(jobs || []);

      if (workerProfiles.length > 0) {
        setSelectedStudentId(workerProfiles[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching match data:", err);
      toast.error("Failed to load matching engine details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLocked) {
      loadData();
    }
  }, [isLocked]);

  // Load custom skills when selected student changes
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  useEffect(() => {
    if (selectedStudentId) {
      const saved = localStorage.getItem(`tasskly_custom_skills_${selectedStudentId}`);
      if (saved) {
        setCustomSkills(JSON.parse(saved));
      } else {
        setCustomSkills([]);
      }
    }
  }, [selectedStudentId]);

  const handleSaveLaunchDate = (val: string) => {
    setLaunchDateStr(val);
    localStorage.setItem("tasskly_app_launch_date", val);
    toast.success("Launch date updated! Lock status recalculated.");
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const clean = newSkill.trim();
    if (customSkills.some(s => s.toLowerCase() === clean.toLowerCase())) {
      toast.warning("Skill already exists!");
      return;
    }
    const updated = [...customSkills, clean];
    setCustomSkills(updated);
    localStorage.setItem(`tasskly_custom_skills_${selectedStudentId}`, JSON.stringify(updated));
    setNewSkill("");
    toast.success(`Skill "${clean}" added!`);
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    const updated = customSkills.filter(s => s !== skillToDelete);
    setCustomSkills(updated);
    localStorage.setItem(`tasskly_custom_skills_${selectedStudentId}`, JSON.stringify(updated));
    toast.info("Skill removed.");
  };

  // Helper: Infer skills based on completed jobs / categories worked on
  const getInferredSkills = (student: any) => {
    if (!student || !student.jobs_working) return [];
    const skillsSet = new Set<string>();
    
    // Auto add skills based on job categories the student completed or is working on
    student.jobs_working.forEach((j: any) => {
      const catSkills = categorySkillsMap[j.category] || [];
      catSkills.forEach(s => skillsSet.add(s));
      // Add explicit job skills if any
      if (j.skills && Array.isArray(j.skills)) {
        j.skills.forEach((s: string) => skillsSet.add(s));
      }
    });

    return Array.from(skillsSet);
  };

  // Combine inferred skills and admin-defined custom skills
  const getCombinedSkills = (student: any) => {
    if (!student) return [];
    const inferred = getInferredSkills(student);
    const combined = new Set([...inferred, ...customSkills]);
    return Array.from(combined);
  };

  // Calculate Match Score
  const calculateMatch = (student: any, item: { title: string; category: string; budget?: number; stipend?: string; skills: string[] }) => {
    if (!student) return 0;
    const studentSkills = getCombinedSkills(student).map(s => s.toLowerCase());
    const requiredSkills = (item.skills || []).map(s => s.toLowerCase());

    let skillScore = 0;
    if (requiredSkills.length > 0) {
      const matchCount = requiredSkills.filter(rs => studentSkills.some(ss => ss === rs || ss.includes(rs) || rs.includes(ss))).length;
      skillScore = (matchCount / requiredSkills.length) * 60; // 60 points max
    } else {
      skillScore = 30; // base points if no skills specified
    }

    // Category Affinity (based on previous completed jobs)
    let categoryScore = 10;
    const previousCategories = (student.jobs_working || []).map((j: any) => j.category);
    if (previousCategories.includes(item.category)) {
      categoryScore = 20; // 20 points if student worked on this category before
    }

    // Level Compatibility
    let levelScore = 10;
    const studentLevel = student.level || 1;
    const budgetVal = item.budget || (item.stipend ? parseInt(item.stipend.replace(/[^0-9]/g, "")) : 0);
    
    if (budgetVal > 5000 && studentLevel === 3) {
      levelScore = 20;
    } else if (budgetVal >= 1500 && budgetVal <= 5000 && studentLevel >= 2) {
      levelScore = 20;
    } else if (budgetVal < 1500 && studentLevel === 1) {
      levelScore = 20;
    }

    // Rating Modifier
    const ratingScore = 10; // baseline

    const total = Math.min(100, Math.round(skillScore + categoryScore + levelScore + ratingScore));
    return total;
  };

  const handleRecommend = (itemName: string, studentName: string) => {
    toast.success(`Recommended "${itemName}" to student "${studentName}" successfully! 🚀`);
  };

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render Locked State Screen
  if (isLocked) {
    return (
      <div className="p-6 min-h-[85vh] flex flex-col justify-between space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Best Match</h1>
          <p className="text-muted-foreground text-sm">
            Admin-only recommendation dashboard to match students with the best opportunities.
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-6 py-8">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
              <Lock className="h-10 w-10 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">
              6M
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-black text-2xl text-foreground">Feature Locked</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              The "Best Match" student recommender will unlock automatically **6 months after the official platform launch**.
            </p>
          </div>

          <Card className="w-full bg-slate-50 border-slate-200">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-left text-xs">
                <div>
                  <p className="text-muted-foreground font-semibold">Launch Date</p>
                  <p className="font-bold text-foreground text-sm">{format(launchDate, "dd MMM yyyy")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Unlocks On</p>
                  <p className="font-bold text-foreground text-sm">{format(unlockDate, "dd MMM yyyy")}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-700">Days Remaining</span>
                  <span className="text-foreground">{daysRemaining > 0 ? `${daysRemaining} days` : "Unlocking soon..."}</span>
                </div>
                <Progress value={Math.max(10, Math.min(100, (180 - daysRemaining) / 1.8))} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Config Card for Demo/Testing */}
          <Card className="w-full border-dashed border-primary/45 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-1.5 justify-center text-primary text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Testing Mode: Adjust Launch Date
              </div>
              <p className="text-[10px] text-muted-foreground">
                Set the launch date back at least 6 months to unlock the Matching dashboard immediately.
              </p>
              <div className="flex gap-2 max-w-xs mx-auto">
                <Input 
                  type="date" 
                  value={launchDateStr} 
                  onChange={(e) => handleSaveLaunchDate(e.target.value)} 
                  className="h-8 text-xs"
                />
                <Button size="sm" variant="hero" className="h-8 text-xs font-black shrink-0" onClick={() => handleSaveLaunchDate("2025-11-01")}>
                  Force Unlock
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Combine DB jobs and Static Internships
  const mappedDbJobs = dbJobs.map(j => ({
    id: j.id,
    title: j.title,
    company: j.poster?.full_name || "Platform Client",
    location: j.campus_only ? `${j.campus_name || "Campus"} Only` : "Remote / Open",
    budget: Number(j.budget),
    skills: j.skills || [],
    category: j.category,
    description: j.description
  }));

  const studentCombinedSkills = selectedStudent ? getCombinedSkills(selectedStudent) : [];

  const matchedJobs = mappedDbJobs
    .map(j => ({ ...j, score: calculateMatch(selectedStudent, j) }))
    .sort((a, b) => b.score - a.score);

  const matchedInternships = mockInternships
    .map(i => ({ ...i, score: calculateMatch(selectedStudent, i) }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-foreground">Best Match</h1>
            <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200 uppercase tracking-widest font-black text-[9px] gap-1">
              <Unlock className="h-2.5 w-2.5" /> Active ( Launch Date &gt; 6M )
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Show students the jobs or internships that fit them most.
          </p>
        </div>

        {/* Adjust launch date directly in panel */}
        <div className="flex items-center gap-2 border bg-muted/40 p-2 rounded-xl text-xs">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-muted-foreground">Launch Config:</span>
          <Input 
            type="date" 
            value={launchDateStr} 
            onChange={(e) => handleSaveLaunchDate(e.target.value)} 
            className="h-7 w-28 text-[11px] bg-background border-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Student Selection */}
        <div className="space-y-4">
          <Card className="shadow-card border-slate-100">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Select Student
              </CardTitle>
              <CardDescription className="text-xs">
                Choose a student to view matched listings.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Search students..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-xs h-9 bg-muted/30"
                />
              </div>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-6">No students found.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {filteredStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        selectedStudentId === student.id 
                          ? "bg-primary/10 border-primary/20 text-primary font-bold shadow-sm"
                          : "hover:bg-muted/40 border-transparent text-foreground"
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          selectedStudentId === student.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        }`}>
                          {student.full_name?.charAt(0) || "U"}
                        </div>
                        <div className="truncate">
                          <p className="font-bold truncate">{student.full_name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{student.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="px-1 py-0 h-4 text-[9px] uppercase font-black shrink-0 bg-muted/80 text-foreground">
                        Lvl {student.level || 1}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Student Details Card */}
          {selectedStudent && (
            <Card className="shadow-card border-none bg-slate-50">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/15 text-primary font-black flex items-center justify-center">
                    {selectedStudent.full_name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{selectedStudent.full_name}</h3>
                    <p className="text-[10px] text-muted-foreground">{selectedStudent.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] py-3 border-y border-slate-200/80">
                  <div>
                    <span className="text-muted-foreground block font-medium">Clearance Level</span>
                    <Badge className="bg-indigo-600 text-white font-black py-0 h-4 mt-0.5 text-[8px] uppercase">
                      Lvl {selectedStudent.level || 1}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Completed Jobs</span>
                    <span className="font-bold text-foreground text-xs mt-0.5 block">
                      {selectedStudent.jobs_working?.filter((j: any) => j.status === 'completed').length || 0} tasks
                    </span>
                  </div>
                </div>

                {/* Combined Skill Tags */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Skills Inventory</Label>
                  <div className="flex flex-wrap gap-1">
                    {studentCombinedSkills.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground italic">No skills listed yet. Add some below.</span>
                    ) : (
                      studentCombinedSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-[10px] py-0 h-5 border border-slate-200/80 bg-white gap-1 font-semibold text-slate-700">
                          {skill}
                          {customSkills.includes(skill) && (
                            <button onClick={() => handleDeleteSkill(skill)} className="hover:text-red-500 font-bold ml-0.5">
                              ×
                            </button>
                          )}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Custom Skill Form */}
                <form onSubmit={handleAddSkill} className="flex gap-1.5 pt-1">
                  <Input 
                    placeholder="Add student skill..." 
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="h-8 text-xs bg-white border-slate-200"
                  />
                  <Button type="submit" size="sm" className="h-8 px-2.5" variant="outline">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Matched Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="jobs" className="w-full">
            <div className="flex justify-between items-center bg-muted/30 border p-1 rounded-xl">
              <TabsList className="bg-transparent border-0 h-9 p-0 gap-1">
                <TabsTrigger value="jobs" className="h-7 text-xs font-bold px-3 py-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Briefcase className="h-3.5 w-3.5 mr-1" />
                  Student Marketplace Jobs ({matchedJobs.length})
                </TabsTrigger>
                <TabsTrigger value="internships" className="h-7 text-xs font-bold px-3 py-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Premium Internships ({matchedInternships.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Jobs Match Tab */}
            <TabsContent value="jobs" className="mt-4 focus-visible:outline-none">
              {matchedJobs.length === 0 ? (
                <Card className="border-dashed py-12 text-center">
                  <CardContent className="space-y-2">
                    <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                    <h4 className="font-semibold text-sm">No open jobs available</h4>
                    <p className="text-xs text-muted-foreground">Check back once students post new jobs on the marketplace.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {matchedJobs.map(job => (
                    <Card key={job.id} className="shadow-card border-none bg-card hover:shadow-md transition-shadow relative overflow-hidden">
                      {/* Match percentage score ribbon */}
                      <div className="absolute right-0 top-0 h-14 w-14">
                        <div className={`absolute top-0 right-0 h-full w-full flex items-center justify-center font-black text-xs text-white ${
                          job.score >= 80 ? "bg-green-600" :
                          job.score >= 50 ? "bg-amber-500" :
                          "bg-slate-400"
                        }`} style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}>
                          <span className="absolute top-1.5 right-1.5 text-[9px] font-black">{job.score}%</span>
                        </div>
                      </div>

                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start pr-10">
                          <div>
                            <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-wider mb-1">
                              {job.category}
                            </Badge>
                            <CardTitle className="text-sm font-bold text-foreground">{job.title}</CardTitle>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Posted by {job.company}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-1 py-1">
                          {job.skills.length === 0 ? (
                            <Badge variant="outline" className="text-[9px] bg-slate-50 font-semibold">No direct skills required</Badge>
                          ) : (
                            job.skills.map((skill: string) => {
                              const hasSkill = studentCombinedSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase());
                              return (
                                <Badge 
                                  key={skill} 
                                  variant="outline" 
                                  className={`text-[9px] font-semibold ${
                                    hasSkill 
                                      ? "bg-green-50 text-green-700 border-green-200" 
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {skill}
                                </Badge>
                              );
                            })
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <div className="flex gap-4 text-[10px] text-muted-foreground font-semibold">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground/60" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-0.5 text-foreground font-black">
                              ₹{job.budget.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <Button 
                            size="sm" 
                            variant="hero" 
                            className="h-8 text-xs font-bold gap-1 px-3"
                            onClick={() => handleRecommend(job.title, selectedStudent?.full_name)}
                          >
                            <Send className="h-3 w-3" /> Recommend
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Internships Match Tab */}
            <TabsContent value="internships" className="mt-4 focus-visible:outline-none">
              <div className="space-y-4">
                {matchedInternships.map(internship => (
                  <Card key={internship.id} className="shadow-card border-none bg-card hover:shadow-md transition-shadow relative overflow-hidden">
                    {/* Match percentage score ribbon */}
                    <div className="absolute right-0 top-0 h-14 w-14">
                      <div className={`absolute top-0 right-0 h-full w-full flex items-center justify-center font-black text-xs text-white ${
                        internship.score >= 80 ? "bg-green-600" :
                        internship.score >= 50 ? "bg-amber-500" :
                        "bg-slate-400"
                      }`} style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}>
                        <span className="absolute top-1.5 right-1.5 text-[9px] font-black">{internship.score}%</span>
                      </div>
                    </div>

                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start pr-10">
                        <div>
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider mb-1 bg-indigo-50 border-indigo-200 text-indigo-700">
                            Internship
                          </Badge>
                          <CardTitle className="text-sm font-bold text-foreground">{internship.title}</CardTitle>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{internship.company}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {internship.description}
                      </p>

                      <div className="flex flex-wrap gap-1 py-1">
                        {internship.skills.map((skill: string) => {
                          const hasSkill = studentCombinedSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase());
                          return (
                            <Badge 
                              key={skill} 
                              variant="outline" 
                              className={`text-[9px] font-semibold ${
                                hasSkill 
                                  ? "bg-green-50 text-green-700 border-green-200" 
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {skill}
                            </Badge>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex gap-4 text-[10px] text-muted-foreground font-semibold">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground/60" />
                            {internship.location}
                          </span>
                          <span className="flex items-center gap-0.5 text-foreground font-black">
                            {internship.stipend}
                          </span>
                          <span className="text-muted-foreground">
                            Dur: {internship.duration}
                          </span>
                        </div>

                        <Button 
                          size="sm" 
                          variant="hero" 
                          className="h-8 text-xs font-bold gap-1 px-3"
                          onClick={() => handleRecommend(internship.title, selectedStudent?.full_name)}
                        >
                          <Send className="h-3 w-3" /> Recommend
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

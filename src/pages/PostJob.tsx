import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft, Sparkles, AlertTriangle, Paperclip, X, FileText, Info } from "lucide-react";
import { categories, AttachedFile } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// AI suggestion templates based on keywords
const aiSuggestions: Record<string, string[]> = {
  design: [
    "I need a professional poster design for our upcoming college fest. The theme is modern and vibrant.",
    "Create a clean logo design with minimalistic style for a student startup.",
    "Design social media creatives for Instagram and LinkedIn with brand colors.",
  ],
  poster: [
    "Design a poster for our cultural event. It should include date, venue, and event highlights.",
    "Create an A3-sized poster with eye-catching typography and event details.",
  ],
  code: [
    "Build a responsive landing page using React and Tailwind CSS with modern UI components.",
    "Develop a REST API using Node.js and Express with authentication middleware.",
    "Fix bugs in my Python Flask application and optimize database queries.",
  ],
  python: [
    "Write a Python script to automate data scraping from a website using BeautifulSoup.",
    "Create a machine learning model for text classification using scikit-learn.",
  ],
  java: [
    "Implement a Java Spring Boot microservice with CRUD operations and JWT auth.",
    "Build a Java console application for student management with file I/O.",
  ],
  assignment: [
    "Complete my mathematics assignment covering calculus and linear algebra topics.",
    "Help me solve physics problems related to thermodynamics and wave optics.",
  ],
  math: [
    "Solve differential equations and provide step-by-step solutions with explanations.",
    "Help with statistics assignment including hypothesis testing and regression analysis.",
  ],
  write: [
    "Write a 2000-word research essay on the impact of AI in education.",
    "Proofread and edit my thesis paper for grammar, tone, and academic formatting.",
  ],
  essay: [
    "Draft a persuasive essay on climate change with proper citations and references.",
    "Write a literature review for my research paper on digital marketing trends.",
  ],
  video: [
    "Edit a 5-minute YouTube video with transitions, background music, and subtitles.",
    "Create a short promotional video for a college event using After Effects.",
  ],
  tutor: [
    "Need a tutor for organic chemistry, 2 sessions per week for 1 month.",
    "Looking for someone to teach Data Structures and Algorithms in C++.",
  ],
  teach: [
    "Teach me web development basics including HTML, CSS, and JavaScript.",
    "I need help understanding machine learning concepts and hands-on practice.",
  ],
  present: [
    "Create a professional PowerPoint presentation with 15-20 slides on market analysis.",
    "Design a pitch deck for a startup idea with modern templates and infographics.",
  ],
  project: [
    "Help me complete my final year project on IoT-based home automation system.",
    "Need assistance with a database management system project using MySQL.",
  ],
};

const getAISuggestions = (text: string): string[] => {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  for (const [keyword, suggestions] of Object.entries(aiSuggestions)) {
    if (lower.includes(keyword)) {
      matched.push(...suggestions);
    }
  }
  if (matched.length === 0 && text.length > 3) {
    return [
      "Describe your task clearly including deliverables, timeline, and any specific requirements.",
      "Add details about the format, tools, or technologies you prefer for this task.",
    ];
  }
  return matched.slice(0, 3);
};

const PostJob = () => {
  const navigate = useNavigate();
  const { addJob } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  
  // New Feature States
  const [isQuickTask, setIsQuickTask] = useState(false);
  const [campusOnly, setCampusOnly] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [urgentTime, setUrgentTime] = useState("");
  const [isTeamTask, setIsTeamTask] = useState(false);
  const [teamRoleInput, setTeamRoleInput] = useState("");
  const [teamRoles, setTeamRoles] = useState<string[]>([]);
  const [isMentoring, setIsMentoring] = useState(false);

  // File upload state
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newFile: AttachedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result as string,
        };
        setAttachedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // AI suggestion state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (description.length > 2) {
      const newSuggestions = getAISuggestions(description);
      if (newSuggestions.length > 0) {
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [description]);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addTeamRole = () => {
    if (teamRoleInput.trim() && !teamRoles.includes(teamRoleInput.trim())) {
      setTeamRoles([...teamRoles, teamRoleInput.trim()]);
      setTeamRoleInput("");
    }
  };

  const removeTeamRole = (role: string) => {
    setTeamRoles(teamRoles.filter((r) => r !== role));
  };

  const getMinDeadline = () => {
    const d = new Date();
    if (isUrgent || isQuickTask) return d.toISOString().split("T")[0];
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  };

  const handleAIAssist = () => {
    if (!title && !description) {
      toast.error("Please enter a title or description first so AI can help!");
      return;
    }
    toast.success("AI is analyzing your request...");
    setTimeout(() => {
      const lowerText = (title + " " + description).toLowerCase();
      let matched = false;

      if (lowerText.includes("solve") || lowerText.includes("math") || lowerText.includes("calculation") || lowerText.includes("equation")) {
        setCategory("Assignment Help");
        setBudget("50");
        setIsQuickTask(true);
        matched = true;
      }
      if (!matched && (lowerText.includes("design") || lowerText.includes("poster") || lowerText.includes("logo") || lowerText.includes("banner") || lowerText.includes("flyer"))) {
        setCategory("Poster Design");
        if (!skills.includes("Figma")) setSkills([...skills, "Figma"]);
        matched = true;
      }
      if (!matched && (lowerText.includes("code") || lowerText.includes("python") || lowerText.includes("java") || lowerText.includes("react") || lowerText.includes("website") || lowerText.includes("app") || lowerText.includes("develop") || lowerText.includes("program") || lowerText.includes("bug") || lowerText.includes("api"))) {
        setCategory("Coding Help");
        if (lowerText.includes("python") && !skills.includes("Python")) setSkills(prev => [...prev, "Python"]);
        else if (lowerText.includes("java") && !skills.includes("Java")) setSkills(prev => [...prev, "Java"]);
        else if (lowerText.includes("react") && !skills.includes("React")) setSkills(prev => [...prev, "React"]);
        matched = true;
      }
      if (!matched && (lowerText.includes("teach") || lowerText.includes("mentor") || lowerText.includes("tutor") || lowerText.includes("learn"))) {
        setCategory("Tutoring");
        setIsMentoring(true);
        matched = true;
      }
      if (!matched && (lowerText.includes("video") || lowerText.includes("edit") || lowerText.includes("animation"))) {
        setCategory("Video Editing");
        matched = true;
      }
      if (!matched && (lowerText.includes("write") || lowerText.includes("essay") || lowerText.includes("article") || lowerText.includes("content") || lowerText.includes("blog"))) {
        setCategory("Writing");
        matched = true;
      }
      if (!matched && (lowerText.includes("present") || lowerText.includes("ppt") || lowerText.includes("slide") || lowerText.includes("powerpoint"))) {
        setCategory("Presentation");
        matched = true;
      }
      if (!matched && (lowerText.includes("assignment") || lowerText.includes("homework") || lowerText.includes("project"))) {
        setCategory("Assignment Help");
        matched = true;
      }
      if (!matched) {
        // Don't default to "Writing" - instead inform the user
        toast.info("AI couldn't auto-detect the category. Please select one manually.");
        return;
      }
      toast.success("AI has suggested a category and tags based on your text!");
    }, 1200);
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !category || !deadline) {
      toast.error("Please fill in all required fields (Title, Description, Category, Deadline)");
      return;
    }
    if (!budget) {
      toast.error("Please provide a budget.");
      return;
    }
    const minDate = getMinDeadline();
    if (deadline < minDate && !isUrgent && !isQuickTask) {
      toast.error("Deadline must be at least 2 days from today, unless marked Urgent/Quick Task");
      return;
    }
    
    const numericBudget = Number(budget);
    if (!numericBudget || numericBudget <= 0) {
      toast.error("Budget must be a positive number");
      return;
    }

    const jobPayload = {
      title: title.trim(),
      description: description.trim(),
      category,
      budget: numericBudget,
      deadline,
      skills,
      paymentType: "money" as const,
      isQuickTask,
      campusOnly,
      campusName: campusOnly ? "Stanford University" : undefined,
      isUrgent,
      urgentTime: isUrgent ? urgentTime.trim() : undefined,
      isTeamTask,
      teamRoles: isTeamTask ? teamRoles : undefined,
      isMentoring,
      rescueMode: false,
      attachedFiles: attachedFiles.length > 0 ? attachedFiles : undefined,
      instructions: instructions.trim() || undefined,
    };

    addJob(jobPayload);
    toast.success("Job posted successfully!");
    navigate("/dashboard/jobs");
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-background pb-12">
      <Navbar />

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Button variant="outline" size="sm" className="gap-2 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" onClick={handleAIAssist}>
            <Sparkles className="h-4 w-4" />
            AI Task Assistant
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground">Post a Job</h1>
          <p className="mt-1 mb-6 text-muted-foreground">Describe what you need done.</p>

          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-800">Demo Mode Notice</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  To keep the website free and fast, we use <strong>Browser Local Storage</strong> for this demo. 
                  Jobs you post will be visible on <strong>this device</strong> and in <strong>other tabs</strong> on this computer, 
                  but won't automatically sync to other devices without a central database.
                </p>
              </div>
            </div>
          </div>

          <Card className="shadow-card">
            <CardContent className="space-y-6 p-6">
              
              {/* Basic Details */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Job Title *</label>
                  <Input
                    placeholder="e.g. Design a poster for college event"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Description *</label>
                  <textarea
                    ref={descriptionRef}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Describe the job requirements, deliverables, and any specific instructions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      // Delay hiding so clicks on suggestions register
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                  />
                  {/* AI Suggestions Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute left-0 right-0 mt-1 z-20 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                      >
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 border-b text-xs font-medium text-indigo-700">
                          <Sparkles className="h-3 w-3" />
                          AI Suggestions
                        </div>
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="w-full text-left px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors border-b last:border-0 cursor-pointer"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setDescription(suggestion);
                              setShowSuggestions(false);
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Category *</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Badge
                        key={cat.name}
                        variant={category === cat.name ? "default" : "category"}
                        className="cursor-pointer"
                        onClick={() => setCategory(cat.name)}
                      >
                        {cat.icon} {cat.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Switch id="quick-task" checked={isQuickTask} onCheckedChange={setIsQuickTask} />
                  <Label htmlFor="quick-task">10 Minute Quick Task</Label>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                  <div className="flex items-center space-x-2">
                    <Switch id="urgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
                    <Label htmlFor="urgent" className="flex items-center gap-1 text-rose-600">
                      <AlertTriangle className="w-3 h-3" /> Emergency Help (Urgent)
                    </Label>
                  </div>
                  {isUrgent && (
                    <Input
                      placeholder="Required time (e.g. 2 hours)"
                      value={urgentTime}
                      onChange={(e) => setUrgentTime(e.target.value)}
                      className="h-8 text-sm"
                    />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="campus" checked={campusOnly} onCheckedChange={setCampusOnly} />
                  <Label htmlFor="campus">Campus Only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="mentor" checked={isMentoring} onCheckedChange={setIsMentoring} />
                  <Label htmlFor="mentor">Mentoring / Learning Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="team" checked={isTeamTask} onCheckedChange={setIsTeamTask} />
                  <Label htmlFor="team">Team Task</Label>
                </div>
              </div>

              {/* Dynamic Sections Based on Toggles */}
              {isTeamTask && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <label className="block text-sm font-medium text-foreground">Required Team Roles</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Frontend Developer"
                      value={teamRoleInput}
                      onChange={(e) => setTeamRoleInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTeamRole())}
                    />
                    <Button variant="outline" onClick={addTeamRole}>Add Role</Button>
                  </div>
                  {teamRoles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {teamRoles.map((role) => (
                        <Badge key={role} variant="secondary" className="cursor-pointer" onClick={() => removeTeamRole(role)}>
                          {role} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Budget & Deadline */}
              <div className="pt-4 border-t space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Budget (₹) *</label>
                    <Input
                      type="number"
                      placeholder={isQuickTask ? "10 - 100" : "25"}
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Deadline *</label>
                    <Input
                      type="date"
                      value={deadline}
                      min={getMinDeadline()}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                    {(!isUrgent && !isQuickTask) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        ⚠️ Regular tasks require a 2-day minimum deadline.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Area */}
              <div className="pt-4 border-t">
                <label className="mb-1.5 block text-sm font-medium text-foreground">Required Skills for Worker</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a required skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <Button variant="outline" onClick={addSkill}>Add</Button>
                </div>
                {skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* File Attachments */}
              <div className="pt-4 border-t">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Attach Files <span className="text-muted-foreground font-normal">(hidden from bidders until payment)</span>
                </label>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload PDFs, images, or documents</p>
                  <p className="text-xs text-muted-foreground mt-1">Files are kept private until a bid is accepted and payment is verified</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip,.rar"
                />
                {attachedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-muted/50 border text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button onClick={() => removeFile(idx)} className="text-destructive hover:text-destructive/80 shrink-0 ml-2">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button variant="hero" className="w-full gap-2 mt-4" size="lg" onClick={handleSubmit}>
                <Send className="h-4 w-4" />
                Post Job
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PostJob;

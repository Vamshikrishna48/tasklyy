import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft, Sparkles, AlertTriangle } from "lucide-react";
import { categories } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { openRazorpayCheckout } from "@/integrations/payments/razorpay";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const PostJob = () => {
  const navigate = useNavigate();
  const { addJob, recordPostingFee } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  
  // New Feature States
  const [paymentType, setPaymentType] = useState<"money" | "skill">("money");
  const [skillExchangeDetails, setSkillExchangeDetails] = useState("");
  const [isQuickTask, setIsQuickTask] = useState(false);
  const [campusOnly, setCampusOnly] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [urgentTime, setUrgentTime] = useState("");
  const [isTeamTask, setIsTeamTask] = useState(false);
  const [teamRoleInput, setTeamRoleInput] = useState("");
  const [teamRoles, setTeamRoles] = useState<string[]>([]);
  const [isMentoring, setIsMentoring] = useState(false);

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
    // If urgent, deadline can be today. Otherwise 2 days.
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
      if (lowerText.includes("solve") || lowerText.includes("math")) {
        setCategory("Assignment Help");
        if(paymentType === "money") setBudget("50");
        setIsQuickTask(true);
      } else if (lowerText.includes("design") || lowerText.includes("poster")) {
        setCategory("Poster Design");
        if (!skills.includes("Figma")) setSkills([...skills, "Figma"]);
      } else if (lowerText.includes("code") || lowerText.includes("python") || lowerText.includes("java")) {
        setCategory("Coding Help");
        const detectedSkill = lowerText.includes("python") ? "Python" : "Java";
        if (!skills.includes(detectedSkill)) setSkills([...skills, detectedSkill]);
      } else if (lowerText.includes("teach") || lowerText.includes("mentor")) {
        setCategory("Tutoring");
        setIsMentoring(true);
      } else {
        setCategory("Writing");
      }
      toast.success("AI has suggested a category, pricing/toggles, and tags based on your text!");
    }, 1200);
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !category || !deadline) {
      toast.error("Please fill in all required fields (Title, Description, Category, Deadline)");
      return;
    }
    if (paymentType === "money" && !budget) {
      toast.error("Please provide a money budget.");
      return;
    }
    if (paymentType === "skill" && !skillExchangeDetails.trim()) {
      toast.error("Please describe the skill you are willing to exchange.");
      return;
    }
    const minDate = getMinDeadline();
    if (deadline < minDate && !isUrgent && !isQuickTask) {
      toast.error("Deadline must be at least 2 days from today, unless marked Urgent/Quick Task");
      return;
    }
    
    const numericBudget = paymentType === "money" ? Number(budget) : 0;
    if (paymentType === "money" && (!numericBudget || numericBudget <= 0)) {
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
      paymentType,
      skillExchangeDetails: paymentType === "skill" ? skillExchangeDetails.trim() : undefined,
      isQuickTask,
      campusOnly,
      campusName: campusOnly ? "Stanford University" : undefined, // Inherited from currentUser naturally, but kept here for mock
      isUrgent,
      urgentTime: isUrgent ? urgentTime.trim() : undefined,
      isTeamTask,
      teamRoles: isTeamTask ? teamRoles : undefined,
      isMentoring,
      rescueMode: false,
    };

    if (paymentType === "money" && numericBudget > 0) {
      // Post job directly without posting fee
      addJob(jobPayload);
      toast.success("Job posted successfully!");
      navigate("/dashboard/jobs");
    } else {
      addJob(jobPayload);
      toast.success("Skill Exchange Job posted successfully!");
      navigate("/dashboard/jobs");
    }
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
          <p className="mt-1 mb-8 text-muted-foreground">Describe what you need done and how you want to pay.</p>

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

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Description *</label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Describe the job requirements, deliverables, and any specific instructions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
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

              {/* Payment & Deadline */}
              <div className="pt-4 border-t space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Payment Type *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="money" 
                        checked={paymentType === "money"} 
                        onChange={() => setPaymentType("money")} 
                        className="accent-primary"
                      />
                      <span>Pay with Money (₹)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="skill" 
                        checked={paymentType === "skill"} 
                        onChange={() => setPaymentType("skill")} 
                        className="accent-primary"
                      />
                      <span>Skill Exchange</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentType === "money" ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Budget (₹) *</label>
                      <Input
                        type="number"
                        placeholder={isQuickTask ? "10 - 100" : "25"}
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-foreground">What skill will you offer in exchange? *</label>
                      <Input
                        placeholder="e.g. I will teach you Python for 1 hour"
                        value={skillExchangeDetails}
                        onChange={(e) => setSkillExchangeDetails(e.target.value)}
                      />
                    </div>
                  )}
                  <div className={paymentType === "skill" ? "md:col-span-2" : ""}>
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

              <Button variant="hero" className="w-full gap-2 mt-4" size="lg" onClick={handleSubmit}>
                <Send className="h-4 w-4" />
                {paymentType === "money" ? "Post Job" : "Post Skill Exchange Job"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PostJob;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Briefcase,
  Rocket,
  GraduationCap,
  Building2,
  Star,
  Lock,
  User,
  Search,
  CheckCircle,
  FileText,
  MapPin,
  Calendar,
  IndianRupee,
  LogOut,
  Send,
  Loader2,
  KeyRound
} from "lucide-react";
import { toast } from "sonner";

// Static premium mock internships
const mockInternships = [
  {
    id: "int-1",
    title: "Software Engineer Intern",
    company: "TechSprint Systems",
    location: "Remote",
    stipend: "₹15,000 / month",
    duration: "3 Months",
    skills: ["React", "TypeScript", "Node.js"],
    description: "Work on developing user-facing features, building robust API integrations, and collaborating with our core product team."
  },
  {
    id: "int-2",
    title: "UI/UX Designer Intern",
    company: "DesignFlo Studios",
    location: "Remote",
    stipend: "₹10,000 / month",
    duration: "2 Months",
    skills: ["Figma", "Wireframing", "Prototyping"],
    description: "Design high-fidelity user flows, construct beautiful components, and conduct wireframing tests for our next-gen mobile application."
  },
  {
    id: "int-3",
    title: "Data Analyst Intern",
    company: "FinGrow Analytics",
    location: "Hybrid (Bangalore)",
    stipend: "₹18,000 / month",
    duration: "6 Months",
    skills: ["Python", "SQL", "Excel", "PowerBI"],
    description: "Extract intelligence from database pools, design operational dashboards, and present performance metrics to key stakeholders."
  },
  {
    id: "int-4",
    title: "Social Media Marketing Intern",
    company: "Zenith Brands",
    location: "Remote",
    stipend: "₹8,000 / month",
    duration: "3 Months",
    skills: ["SEO", "Content Strategy", "Canva"],
    description: "Help expand our digital footprint by creating organic campaigns, managing copy drafts, and scheduling newsletters."
  }
];

interface PortalUser {
  id: string;
  full_name: string;
  email: string;
  tasskly_id: string;
}

interface Application {
  id: string;
  internshipId: string;
  internshipTitle: string;
  company: string;
  appliedDate: string;
  status: "submitted" | "under_review" | "shortlisted";
  portfolioLink: string;
  coverLetter: string;
}

const Internships = () => {
  // Portal Auth States
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [tassklyId, setTassklyId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authStep, setAuthStep] = useState<"id_entry" | "password_entry" | "password_setup">("id_entry");
  const [checkLoading, setCheckLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [tempUserName, setTempUserName] = useState("");

  // Portal Dashboard States
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedInternship, setSelectedInternship] = useState<typeof mockInternships[0] | null>(null);
  const [portfolioLink, setPortfolioLink] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submittingApp, setSubmittingApp] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<"explore" | "applications">("explore");

  // Load auth state and mock applications from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("tasskly_internship_auth_user");
    if (savedUser) {
      setPortalUser(JSON.parse(savedUser));
    }
    const savedApps = localStorage.getItem("tasskly_internship_applications");
    if (savedApps) {
      setApplications(JSON.parse(savedApps));
    }
  }, []);

  // Handle Tasskly ID verification
  const handleCheckId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tassklyId.trim()) {
      toast.error("Please enter your Tasskly ID");
      return;
    }

    setCheckLoading(true);
    try {
      const response = await fetch("/api/internship-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasskly_id: tassklyId.trim(), action: "check" })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "ID check failed");
      }

      setTempUserName(data.name);
      if (data.hasPassword) {
        setAuthStep("password_entry");
      } else {
        setAuthStep("password_setup");
        toast.info("Welcome! Create a password for your Internship Portal setup. ✅");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid Tasskly ID");
    } finally {
      setCheckLoading(false);
    }
  };

  // Handle Password Setup
  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setAuthLoading(true);
    try {
      const response = await fetch("/api/internship-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasskly_id: tassklyId.trim(),
          password: password.trim(),
          action: "setup"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Setup failed");
      }

      toast.success("Password configured! Logging in... 🚀");
      
      // Auto login after setup
      await handleLoginDirect();
    } catch (err: any) {
      toast.error(err.message || "Failed to set up password");
      setAuthLoading(false);
    }
  };

  // Direct login utility
  const handleLoginDirect = async () => {
    try {
      const response = await fetch("/api/internship-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasskly_id: tassklyId.trim(),
          password: password.trim(),
          action: "login"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const userDetail = data.user;
      localStorage.setItem("tasskly_internship_auth_user", JSON.stringify(userDetail));
      setPortalUser(userDetail);
      toast.success(`Access Granted! Welcome to the Internship Portal, ${userDetail.full_name} 🎉`);
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle standard Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setAuthLoading(true);
    await handleLoginDirect();
  };

  // Logout Portal
  const handleLogout = () => {
    localStorage.removeItem("tasskly_internship_auth_user");
    setPortalUser(null);
    setTassklyId("");
    setPassword("");
    setConfirmPassword("");
    setAuthStep("id_entry");
    toast.success("Logged out from Internship Portal successfully.");
  };

  // Apply to Internship Action
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternship || !portalUser) return;

    if (!portfolioLink.trim()) {
      toast.error("Please enter your Resume or Portfolio link");
      return;
    }
    if (!coverLetter.trim()) {
      toast.error("Please write a short cover letter/introduction");
      return;
    }

    setSubmittingApp(true);
    setTimeout(() => {
      const newApp: Application = {
        id: "app-" + Math.floor(Math.random() * 90000 + 10000),
        internshipId: selectedInternship.id,
        internshipTitle: selectedInternship.title,
        company: selectedInternship.company,
        appliedDate: new Date().toLocaleDateString("en-IN"),
        status: "submitted",
        portfolioLink: portfolioLink.trim(),
        coverLetter: coverLetter.trim()
      };

      const updatedApps = [newApp, ...applications];
      setApplications(updatedApps);
      localStorage.setItem("tasskly_internship_applications", JSON.stringify(updatedApps));

      toast.success(`Successfully applied to ${selectedInternship.title} at ${selectedInternship.company}! 📤`);
      
      // Clear forms
      setPortfolioLink("");
      setCoverLetter("");
      setSelectedInternship(null);
      setSubmittingApp(false);
      setDashboardTab("applications");
    }, 1200);
  };

  // Filtered internships for search
  const filteredInternships = mockInternships.filter(item => {
    const s = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(s) ||
      item.company.toLowerCase().includes(s) ||
      item.skills.some(skill => skill.toLowerCase().includes(s))
    );
  });

  return (
    <div
      className="min-h-screen w-screen relative overflow-x-hidden flex flex-col items-center bg-slate-50"
      style={{
        backgroundImage: "linear-gradient(135deg, #e0f7f4 0%, #f0fdf4 40%, #d1fae5 70%, #bae6fd 100%)",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Absolute Blobs for Ambient Aesthetics */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-cyan-200/20 blur-3xl" />
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 z-20">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 text-gray-500 hover:text-gray-800 hover:bg-white/60">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl px-4 py-16 flex flex-col items-center flex-1 justify-center">
        
        <AnimatePresence mode="wait">
          {!portalUser ? (
            /* ─────────────────────────────────────────────────────────────────
               AUTHENTICATION PORTAL VIEW
               ───────────────────────────────────────────────────────────────── */
            <motion.div
              key="auth-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-8 shadow-xl space-y-6"
            >
              {/* Portal Branding */}
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <Rocket className="h-3 w-3" />
                  Beta Portal Access
                </span>
                <h1 className="text-3xl font-black text-gray-800 tracking-tight" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  Intern<span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600">ships</span>
                </h1>
                <p className="text-xs text-gray-500">
                  Log in using your Tasskly ID to search, apply, and track student internships.
                </p>
              </div>

              {/* ID Entry Form */}
              {authStep === "id_entry" && (
                <form onSubmit={handleCheckId} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tasskly-id" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-4 w-4 text-emerald-600" /> Enter Tasskly ID
                    </Label>
                    <Input
                      id="tasskly-id"
                      placeholder="e.g. TSK-123456"
                      value={tassklyId}
                      onChange={(e) => setTassklyId(e.target.value.toUpperCase())}
                      className="rounded-xl border-slate-200/80 bg-white/50 text-center font-bold font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal h-11 text-base focus-visible:ring-emerald-500"
                      required
                    />
                    <p className="text-[10px] text-gray-400 italic text-center">
                      *Find your Tasskly ID inside your Profile settings under settings tab.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={checkLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:opacity-95 text-white font-bold h-11 rounded-xl shadow-md shadow-emerald-500/10"
                  >
                    {checkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
                  </Button>
                </form>
              )}

              {/* First Time Password Setup */}
              {authStep === "password_setup" && (
                <form onSubmit={handleSetupPassword} className="space-y-4">
                  <div className="bg-slate-50 border rounded-xl p-3 flex items-start gap-2.5">
                    <KeyRound className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-800">Configure Password</p>
                      <p className="text-[10px] text-slate-500">First login for Tasskly ID: <strong className="font-mono text-emerald-700">{tassklyId}</strong> ({tempUserName})</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="setup-pwd" className="text-xs font-bold text-gray-700">Choose password</Label>
                      <Input
                        id="setup-pwd"
                        type="password"
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl bg-white/50 h-10 border-slate-200/80"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirm-pwd" className="text-xs font-bold text-gray-700">Re-enter password</Label>
                      <Input
                        id="confirm-pwd"
                        type="password"
                        placeholder="••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="rounded-xl bg-white/50 h-10 border-slate-200/80"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAuthStep("id_entry")}
                      className="rounded-xl border-slate-200 h-10 flex-1 font-semibold"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={authLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 flex-1 rounded-xl"
                    >
                      {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Login"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Password Verification Login */}
              {authStep === "password_entry" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="bg-slate-50 border rounded-xl p-3 flex items-start gap-2.5">
                    <Lock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-800">Identify Verified</p>
                      <p className="text-[10px] text-slate-500">Signing in as: <strong className="font-mono text-emerald-700">{tassklyId}</strong> ({tempUserName})</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-pwd" className="text-xs font-bold text-gray-700">Internship Password</Label>
                    <Input
                      id="login-pwd"
                      type="password"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-xl bg-white/50 h-11 border-slate-200/80"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAuthStep("id_entry")}
                      className="rounded-xl border-slate-200 h-11 flex-1 font-semibold"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={authLoading}
                      className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:opacity-95 text-white font-bold h-11 flex-1 rounded-xl"
                    >
                      {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enter Portal"}
                    </Button>
                  </div>
                </form>
              )}

            </motion.div>
          ) : (
            /* ─────────────────────────────────────────────────────────────────
               AUTHENTICATED DASHBOARD VIEW
               ───────────────────────────────────────────────────────────────── */
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4 }}
              className="w-full space-y-6"
            >
              {/* Dashboard Top Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
                    {portalUser.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-display font-black text-xl text-gray-800">
                      Welcome, {portalUser.full_name}!
                    </h2>
                    <p className="text-xs text-emerald-700 font-bold font-mono">
                      Intern Portal ID: {portalUser.tasskly_id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 flex-wrap">
                  <div className="flex bg-muted/65 p-1 rounded-xl border gap-1 self-start">
                    <Button
                      variant={dashboardTab === "explore" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setDashboardTab("explore")}
                      className="text-xs font-bold rounded-lg px-4 h-8"
                    >
                      <Briefcase className="h-3.5 w-3.5 mr-1.5" /> Explore Openings
                    </Button>
                    <Button
                      variant={dashboardTab === "applications" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setDashboardTab("applications")}
                      className="text-xs font-bold rounded-lg px-4 h-8 relative"
                    >
                      <FileText className="h-3.5 w-3.5 mr-1.5" /> Applications
                      {applications.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black text-white">
                          {applications.length}
                        </span>
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-slate-200 text-slate-600 font-semibold gap-1.5 h-8 px-3 rounded-lg hover:bg-slate-100"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Logout Portal
                  </Button>
                </div>
              </div>

              {/* Portal Stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/40 border p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Applied Openings</p>
                    <p className="text-2xl font-black text-slate-800">{applications.length}</p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Send className="h-4.5 w-4.5" />
                  </div>
                </div>

                <div className="bg-white/40 border p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shortlisted</p>
                    <p className="text-2xl font-black text-slate-800">
                      {applications.filter(a => a.status === "shortlisted").length}
                    </p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle className="h-4.5 w-4.5" />
                  </div>
                </div>

                <div className="bg-white/40 border p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Under Review</p>
                    <p className="text-2xl font-black text-slate-800">
                      {applications.filter(a => a.status === "under_review" || a.status === "submitted").length}
                    </p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
                    <Briefcase className="h-4.5 w-4.5" />
                  </div>
                </div>
              </div>

              {/* Tabs Content Router */}
              <AnimatePresence mode="wait">
                {dashboardTab === "explore" ? (
                  /* ───────────────────────────────────────────────────────────
                     TAB: EXPLORE INTERNSHIPS
                     ─────────────────────────────────────────────────────────── */
                  <motion.div
                    key="explore-tab"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="space-y-5"
                  >
                    {/* Search Panel */}
                    <div className="relative w-full max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                      <Input
                        placeholder="Search by role, company name, or skills..."
                        className="pl-10 rounded-xl bg-white/50 border-slate-200/80 h-10 shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>

                    {/* Internships Listing Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredInternships.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-slate-500 italic bg-white/30 border border-dashed rounded-3xl">
                          No internships match your search query. Try searching another term!
                        </div>
                      ) : (
                        filteredInternships.map((item) => {
                          const isAlreadyApplied = applications.some(app => app.internshipId === item.id);

                          return (
                            <Card
                              key={item.id}
                              className="shadow-sm border border-slate-200/80 bg-white/60 backdrop-blur-sm flex flex-col justify-between"
                            >
                              <CardContent className="p-5 space-y-4">
                                <div className="space-y-1">
                                  <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-bold text-base text-gray-800">{item.title}</h3>
                                    {isAlreadyApplied && (
                                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase text-[9px] font-black tracking-wider py-0.5">
                                        Applied
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                                    {item.company}
                                  </p>
                                </div>

                                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                                  {item.description}
                                </p>

                                {/* Meta details tags */}
                                <div className="flex items-center gap-3.5 text-[11px] text-slate-600 font-semibold flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                    {item.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                    {item.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <IndianRupee className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                    {item.stipend}
                                  </span>
                                </div>

                                {/* Skills tags */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {item.skills.map(skill => (
                                    <span key={skill} className="text-[10px] bg-slate-100 font-bold text-slate-600 px-2 py-0.5 rounded">
                                      {skill}
                                    </span>
                                  ))}
                                </div>

                                {/* Action */}
                                <div className="pt-2">
                                  {isAlreadyApplied ? (
                                    <Button
                                      disabled
                                      className="w-full bg-slate-200 text-slate-500 font-bold h-9 rounded-xl"
                                    >
                                      Application Submitted
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => setSelectedInternship(item)}
                                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 rounded-xl"
                                    >
                                      Apply Now
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                ) : (
                  /* ───────────────────────────────────────────────────────────
                     TAB: APPLIED LISTING
                     ─────────────────────────────────────────────────────────── */
                  <motion.div
                    key="apps-tab"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="space-y-4"
                  >
                    {applications.length === 0 ? (
                      <div className="py-16 text-center text-slate-500 italic bg-white/30 border border-dashed rounded-3xl">
                        You have not submitted any internship applications yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {applications.map((app) => (
                          <div
                            key={app.id}
                            className="bg-white/60 backdrop-blur-sm border rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4"
                          >
                            <div className="space-y-2">
                              <div>
                                <h3 className="font-bold text-sm text-gray-800">{app.internshipTitle}</h3>
                                <p className="text-xs text-emerald-700 font-bold">{app.company}</p>
                              </div>

                              <div className="space-y-1 text-[11px] text-slate-500">
                                <p>Applied on: <strong>{app.appliedDate}</strong></p>
                                <p className="truncate max-w-md">Resume/Portfolio: <a href={app.portfolioLink} target="_blank" rel="noreferrer" className="text-blue-600 underline font-mono">{app.portfolioLink}</a></p>
                              </div>
                            </div>

                            <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2">
                              <Badge
                                variant={app.status === "shortlisted" ? "default" : "secondary"}
                                className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border-none ${
                                  app.status === "shortlisted"
                                    ? "bg-green-600 text-white animate-pulse"
                                    : app.status === "under_review"
                                    ? "bg-cyan-100 text-cyan-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {app.status.replace("_", " ")}
                              </Badge>
                              <span className="text-[10px] text-slate-400 font-mono font-bold">App ID: {app.id}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Internship Application Dialog Form */}
      <Dialog open={selectedInternship !== null} onOpenChange={(open) => { if (!open) setSelectedInternship(null); }}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleApplySubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-1.5 text-emerald-800">
                <Briefcase className="h-5 w-5 text-emerald-600" /> Apply to Internship
              </DialogTitle>
              <DialogDescription>
                Submit details for the {selectedInternship?.title} role at {selectedInternship?.company}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Portfolio / Resume Link */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="resume-link" className="text-xs font-bold text-gray-700">
                  Resume / Portfolio URL <span className="text-red-500 font-bold">*</span>
                </Label>
                <Input
                  id="resume-link"
                  type="url"
                  placeholder="https://drive.google.com/file/... or github.com/..."
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              {/* Cover Letter */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="cover-letter" className="text-xs font-bold text-gray-700">
                  Why should we hire you? (Short introduction) <span className="text-red-500 font-bold">*</span>
                </Label>
                <textarea
                  id="cover-letter"
                  placeholder="Explain briefly why you are a good fit for this role and your experience..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSelectedInternship(null)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                {submittingApp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Internships;

import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { UserCircle, Mail, Star, Briefcase, Calendar, ShieldCheck, CreditCard, Pencil, Check, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Profile = () => {
  const { profile, authLoading, refreshProfile } = useApp();
  const [editingUpi, setEditingUpi] = useState(false);
  const [upiValue, setUpiValue] = useState("");
  const [savingUpi, setSavingUpi] = useState(false);

  const [levelInfo, setLevelInfo] = useState<any>(null);
  const [levelLoading, setLevelLoading] = useState(true);
  const [viewLevelDetails, setViewLevelDetails] = useState<number>(1);

  useEffect(() => {
    if (!profile?.id) return;
    const fetchLevel = async () => {
      setLevelLoading(true);
      try {
        const { data } = await supabase
          .from("jobs")
          .select("created_at, rating")
          .eq("worker_id", profile.id)
          .eq("status", "completed");
        
        const jobsList = data || [];
        const totalCompleted = jobsList.length;
        
        const ratedJobs = jobsList.filter((j: any) => j.rating !== null && j.rating !== undefined);
        const averageRating = ratedJobs.length > 0
          ? (ratedJobs.reduce((acc: number, curr: any) => acc + Number(curr.rating), 0) / ratedJobs.length).toFixed(1)
          : null;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const monthlyCompleted = jobsList.filter((j: any) => {
          if (!j.created_at) return false;
          const date = new Date(j.created_at);
          return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
        }).length;

        let level = 1;
        let payoutPercent = 70;
        let feePercent = 30;
        let nextThresholdText = "";
        let progressVal = 0;

        if (totalCompleted >= 50) {
          level = 4;
          payoutPercent = 95;
          feePercent = 5;
          nextThresholdText = "👑 Max Tier Unlocked! Permanent 95% payout.";
          progressVal = 100;
        } else if (totalCompleted >= 25) {
          level = 3;
          payoutPercent = 90;
          feePercent = 10;
          const level3Completed = totalCompleted - 25;
          nextThresholdText = `Complete ${25 - level3Completed} more jobs in Level 3 (Level 3 progress: ${level3Completed}/25) to reach Level 4 (95% payout)`;
          progressVal = (level3Completed / 25) * 100;
        } else if (totalCompleted >= 10) {
          level = 2;
          payoutPercent = 80;
          feePercent = 20;
          const level2Completed = totalCompleted - 10;
          nextThresholdText = `Complete ${15 - level2Completed} more jobs in Level 2 (Level 2 progress: ${level2Completed}/15) to reach Level 3 (90% payout)`;
          progressVal = (level2Completed / 15) * 100;
        } else {
          level = 1;
          payoutPercent = 70;
          feePercent = 30;
          nextThresholdText = `Complete ${10 - totalCompleted} more jobs to reach Level 2 (80% payout) — Progress: ${totalCompleted}/10`;
          progressVal = (totalCompleted / 10) * 100;
        }

        setLevelInfo({
          level,
          payoutPercent,
          feePercent,
          totalCompleted,
          monthlyCompleted,
          nextThresholdText,
          progressVal,
          averageRating
        });
      } catch (err) {
        console.error("Error loading level stats:", err);
      } finally {
        setLevelLoading(false);
      }
    };

    fetchLevel();
  }, [profile?.id]);

  const handleSaveUpi = async () => {
    if (!upiValue.trim()) {
      toast.error("Please enter a valid UPI ID");
      return;
    }
    // Basic UPI format validation: something@something
    if (!upiValue.includes("@")) {
      toast.error("UPI ID must be in format: name@bank (e.g. 9876543210@paytm)");
      return;
    }
    setSavingUpi(true);
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ upi_id: upiValue.trim() })
      .eq("id", profile!.id);
    setSavingUpi(false);
    if (error) {
      toast.error("Failed to save UPI ID: " + error.message);
    } else {
      toast.success("UPI ID saved successfully! ✅");
      setEditingUpi(false);
      refreshProfile();
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-12 text-center">
        <UserCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-semibold text-foreground">No Profile Found</h3>
        <p className="text-muted-foreground">Please sign in to view your information.</p>
      </div>
    );
  }

  const upiId = (profile as any).upi_id;

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Your Information</h1>
        <p className="text-muted-foreground mt-1">View and manage your profile details.</p>
      </motion.div>

      {/* UPI Warning Banner */}
      {!upiId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
        >
          <CreditCard className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800 text-sm">UPI ID Required</p>
            <p className="text-xs text-red-600 mt-0.5">
              You must set your UPI ID before posting a job. Without it you cannot receive payments.
            </p>
          </div>
        </motion.div>
      )}

      {/* Worker Level / Tier Card */}
      {profile.role === "worker" && !levelLoading && levelInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-pink-50/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Worker Progression
                  </span>
                  <h3 className="font-display font-black text-2xl text-slate-800 mt-1.5 flex items-center gap-2">
                    Level {levelInfo.level} Tier
                    <span className="text-sm font-normal text-slate-500">
                      ({levelInfo.payoutPercent}% Payment Payout)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your platform fee is currently <span className="font-bold text-primary">{levelInfo.feePercent}%</span>.
                  </p>
                </div>
                <Badge className={`text-xs px-3 py-1 font-black uppercase tracking-wider border-none
                  ${levelInfo.level === 4 ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white animate-pulse' :
                    levelInfo.level === 3 ? 'bg-green-600 text-white' :
                    levelInfo.level === 2 ? 'bg-amber-500 text-white' : 'bg-primary text-white'}`}>
                  {levelInfo.level === 4 ? "💎 TIER 4 (LEGEND)" : levelInfo.level === 3 ? "👑 TIER 3 (ELITE)" : levelInfo.level === 2 ? "⭐️ TIER 2 (EXPERT)" : "🌱 TIER 1 (START)"}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>{levelInfo.nextThresholdText}</span>
                  <span>{Math.round(levelInfo.progressVal)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-500
                      ${levelInfo.level === 4 ? 'from-purple-600 to-pink-500' :
                        levelInfo.level === 3 ? 'from-green-500 to-emerald-400' :
                        levelInfo.level === 2 ? 'from-amber-500 to-yellow-400' :
                        'from-violet-500 to-indigo-400'}`}
                    style={{ width: `${levelInfo.progressVal}%` }}
                  />
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-white/70 backdrop-blur-sm border rounded-xl">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Jobs Completed (Month)</p>
                  <p className="text-lg font-black text-slate-800">{levelInfo.monthlyCompleted} jobs</p>
                </div>
                <div className="p-3 bg-white/70 backdrop-blur-sm border rounded-xl">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Total Historical Jobs</p>
                  <p className="text-lg font-black text-slate-800">{levelInfo.totalCompleted} jobs</p>
                </div>
              </div>

              {/* Level Details Tabs */}
              <div className="border-t pt-4">
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Explore Tier Benefits & Options:</p>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setViewLevelDetails(1)}
                    className={`py-2 px-1 text-center text-[10px] sm:text-xs font-bold rounded-lg border transition-all ${
                      viewLevelDetails === 1
                        ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Lvl 1 (70%)
                  </button>
                  <button
                    onClick={() => setViewLevelDetails(2)}
                    className={`py-2 px-1 text-center text-[10px] sm:text-xs font-bold rounded-lg border transition-all ${
                      viewLevelDetails === 2
                        ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Lvl 2 (80%)
                  </button>
                  <button
                    onClick={() => setViewLevelDetails(3)}
                    className={`py-2 px-1 text-center text-[10px] sm:text-xs font-bold rounded-lg border transition-all ${
                      viewLevelDetails === 3
                        ? "bg-green-50 text-green-700 border-green-200 shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Lvl 3 (90%)
                  </button>
                  <button
                    onClick={() => setViewLevelDetails(4)}
                    className={`py-2 px-1 text-center text-[10px] sm:text-xs font-bold rounded-lg border transition-all ${
                      viewLevelDetails === 4
                        ? "bg-purple-50 text-purple-700 border-purple-200 shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Lvl 4 (95%)
                  </button>
                </div>

                {/* Tab content */}
                <div className="mt-4 p-4 rounded-xl border bg-white/50 backdrop-blur-sm text-left">
                  {viewLevelDetails === 1 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-800">Tier 1: Starter</span>
                        <Badge className="bg-blue-600 text-white">70% Payout</Badge>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Default starting tier for all registered workers. Payout starts at <strong>70%</strong>. Once you complete <strong>10 assignments historically</strong>, you enter Level 2 and your payout automatically increases to 80%!
                      </p>
                      <div className="text-[11px] font-bold text-slate-500 pt-1 flex items-center justify-between">
                        <span>Total Jobs Completed: {levelInfo.totalCompleted}/10</span>
                        <span className={levelInfo.totalCompleted >= 10 ? "text-green-600 font-extrabold" : "text-blue-600"}>
                          {levelInfo.totalCompleted >= 10 ? "Level 2 Reached! 🎉" : `${10 - levelInfo.totalCompleted} jobs remaining to reach Level 2`}
                        </span>
                      </div>
                    </div>
                  )}
                  {viewLevelDetails === 2 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-800">Tier 2: Expert</span>
                        <Badge className="bg-amber-500 text-white">80% Payout</Badge>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Unlock <strong>80% payout</strong> (only 20% platform fee) by completing 10 jobs historically. Once you are in Level 2, you must complete <strong>15 assignments</strong> (progressing from 0 to 15 within this tier, reaching a total of 25 completed jobs) to enter Level 3.
                      </p>
                      <div className="text-[11px] font-bold text-slate-500 pt-1 flex items-center justify-between">
                        <span>Level 2 Progress: {Math.max(0, Math.min(15, levelInfo.totalCompleted - 10))}/15</span>
                        <span className={levelInfo.totalCompleted >= 25 ? "text-green-600 font-extrabold" : "text-amber-600"}>
                          {levelInfo.totalCompleted >= 25 ? "Level 3 Reached! 🚀" : `${15 - Math.max(0, levelInfo.totalCompleted - 10)} jobs remaining for Level 3`}
                        </span>
                      </div>
                    </div>
                  )}
                  {viewLevelDetails === 3 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-800">Tier 3: Elite</span>
                        <Badge className="bg-green-600 text-white">90% Payout</Badge>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Get <strong>90% payout</strong> (only 10% platform fee) by completing 25 assignments historically (10 jobs from Level 1 + 15 jobs from Level 2). In Level 3, you must complete <strong>25 assignments</strong> (progressing from 0 to 25 within this tier, reaching a total of 50 completed jobs) to unlock the ultimate Level 4.
                      </p>
                      <div className="text-[11px] font-bold text-slate-500 pt-1 flex items-center justify-between">
                        <span>Level 3 Progress: {Math.max(0, Math.min(25, levelInfo.totalCompleted - 25))}/25</span>
                        <span className={levelInfo.totalCompleted >= 50 ? "text-green-600 font-extrabold" : "text-green-600"}>
                          {levelInfo.totalCompleted >= 50 ? "Level 4 Reached! 💎" : `${25 - Math.max(0, levelInfo.totalCompleted - 25)} jobs remaining for Level 4`}
                        </span>
                      </div>
                    </div>
                  )}
                  {viewLevelDetails === 4 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-800">Tier 4: Legend</span>
                        <Badge className="bg-purple-600 text-white">95% Payout</Badge>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        The ultimate <strong>95% payout</strong> tier (only 5% platform fee) unlocked after completing <strong>50 assignments historically</strong> (10 jobs from Level 1 + 15 jobs from Level 2 + 25 jobs from Level 3). You are permanently locked at this elite master tier!
                      </p>
                      <div className="text-[11px] font-bold text-slate-500 pt-1 flex items-center justify-between">
                        <span>Historical Total Jobs: {levelInfo.totalCompleted}/50</span>
                        <span className={levelInfo.totalCompleted >= 50 ? "text-purple-600 font-extrabold animate-pulse" : "text-purple-600"}>
                          {levelInfo.totalCompleted >= 50 ? "Legendary Payout Active! 💎" : `${50 - levelInfo.totalCompleted} jobs remaining for Legend Lock`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {profile.avatar_url ? <img src={profile.avatar_url} className="h-full w-full rounded-full object-cover" /> : profile.full_name?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">{profile.full_name}</h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
                  {profile.is_verified && <Badge variant="outline" className="text-[10px] text-green-700 border-green-300"><ShieldCheck className="h-3 w-3 mr-1" />Verified</Badge>}
                </div>
              </div>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Email</p>
                  <p className="text-sm font-semibold text-foreground">{profile.email}</p>
                </div>
              </div>
 
              {/* UPI ID - editable */}
              <div className={`flex items-start gap-3 p-4 rounded-lg ${upiId ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-200'}`}>
                <CreditCard className={`h-5 w-5 shrink-0 mt-0.5 ${upiId ? 'text-green-600' : 'text-red-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    UPI ID <span className="text-red-500 font-bold">*</span>
                    <span className="text-[10px] text-muted-foreground ml-1">(required to post jobs)</span>
                  </p>
                  {editingUpi ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={upiValue}
                        onChange={(e) => setUpiValue(e.target.value)}
                        placeholder="e.g. 9876543210@paytm"
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleSaveUpi()}
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={handleSaveUpi} disabled={savingUpi}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => { setEditingUpi(false); setUpiValue(""); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold font-mono ${upiId ? 'text-green-800' : 'text-red-600'}`}>
                        {upiId || "Not set — tap to add"}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => { setEditingUpi(true); setUpiValue(upiId || ""); }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Rating</p>
                  <p className="text-sm font-semibold text-foreground">
                    {levelInfo?.averageRating ? `⭐ ${levelInfo.averageRating} / 5.0` : "⭐ No ratings yet"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Account ID</p>
                  <p className="text-sm font-semibold text-foreground text-[10px]">{profile.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Member Since</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(profile.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;

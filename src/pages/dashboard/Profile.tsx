import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { UserCircle, Mail, Star, Briefcase, Calendar, ShieldCheck, CreditCard, Pencil, Check, X, Loader2, Phone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { validateUpiId } from "@/utils/upiValidation";

const Profile = () => {
  const { profile, authLoading, refreshProfile } = useApp();
  const [editingUpi, setEditingUpi] = useState(false);
  const [upiValue, setUpiValue] = useState("");
  const [savingUpi, setSavingUpi] = useState(false);


  const handleSaveUpi = async () => {
    const check = validateUpiId(upiValue);
    if (!check.valid) {
      toast.error(check.message);
      return;
    }

    setSavingUpi(true);
    try {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({
          upi_id: check.normalized,
          upi_verified: false,
          bank_verification_status: "pending",
        })
        .eq("id", profile!.id);

      if (error) {
        // Fallback update
        await (supabase as any)
          .from("profiles")
          .update({ upi_id: check.normalized })
          .eq("id", profile!.id);
      }

      toast.success("UPI ID submitted! It will be reviewed and verified by an Administrator ⏳");
      setEditingUpi(false);
      refreshProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit UPI ID");
    } finally {
      setSavingUpi(false);
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
  const upiVerified = !!(profile as any).upi_verified;
  const bankStatus = (profile as any).bank_verification_status;
  const upiStatus = (upiVerified || bankStatus === "verified" || (profile as any).upi_verification_status === "verified")
    ? "verified"
    : (bankStatus === "rejected" || (profile as any).upi_verification_status === "rejected")
    ? "rejected"
    : upiId
    ? "pending"
    : "unverified";

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
              You must set your UPI ID to receive payouts.
            </p>
          </div>
        </motion.div>
      )}

      {/* My Level Teaser — links to dedicated Levels page */}
      {profile.role === "worker" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Link to="/dashboard/levels" className="block group">
            <div className="rounded-2xl p-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.01]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Worker Progression</p>
                  <p className="text-xl font-black">🏆 View My Level & Tier Benefits</p>
                  <p className="text-white/80 text-xs mt-1 font-medium">Check your payout tier, progress, and unlock higher earnings</p>
                </div>
                <div className="text-3xl opacity-80 group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </div>
            </div>
          </Link>
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

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Phone Number</p>
                  <p className="text-sm font-semibold text-foreground">{(profile as any).phone || (profile as any).phone_number || "Not set"}</p>
                </div>
              </div>
 
              {/* UPI ID - editable */}
              <div className={`flex items-start gap-3 p-4 rounded-lg ${
                upiStatus === 'verified' ? 'bg-green-50 border border-green-200' :
                upiStatus === 'rejected' ? 'bg-red-50 border border-red-200' :
                upiId ? 'bg-amber-50 border border-amber-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <CreditCard className={`h-5 w-5 shrink-0 mt-0.5 ${
                  upiStatus === 'verified' ? 'text-green-600' :
                  upiStatus === 'rejected' ? 'text-red-600' :
                  upiId ? 'text-amber-600' :
                  'text-red-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      UPI ID <span className="text-red-500 font-bold">*</span>
                    </p>
                    {upiId && (
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-black uppercase py-0 px-1.5 ${
                          upiStatus === 'verified' ? 'text-green-700 bg-green-50 border-green-300' :
                          upiStatus === 'rejected' ? 'text-red-700 bg-red-50 border-red-300' :
                          'text-amber-700 bg-amber-50 border-amber-300'
                        }`}
                      >
                        {upiStatus === 'verified' ? 'Verified ✅' :
                         upiStatus === 'rejected' ? 'Rejected ❌' :
                         'Pending Admin Verification ⏳'}
                      </Badge>
                    )}
                  </div>
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
                        {savingUpi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
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
                    ⭐ No ratings yet
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Briefcase className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium">Tasskly ID</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground font-mono">{(profile as any).tasskly_id || "Generating..."}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={() => {
                        const tid = (profile as any).tasskly_id;
                        if (tid) {
                          navigator.clipboard.writeText(tid);
                          toast.success("Tasskly ID copied to clipboard! 📋");
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </Button>
                  </div>
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

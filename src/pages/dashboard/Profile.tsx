import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { UserCircle, Mail, Star, Briefcase, Calendar, ShieldCheck, CreditCard, Pencil, Check, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Profile = () => {
  const { profile, authLoading, refreshProfile } = useApp();
  const [editingUpi, setEditingUpi] = useState(false);
  const [upiValue, setUpiValue] = useState("");
  const [savingUpi, setSavingUpi] = useState(false);

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
                  <p className="text-sm font-semibold text-foreground">⭐ 5.0 / 5.0</p>
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

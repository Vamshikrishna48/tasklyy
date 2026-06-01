import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type AuthView = "signin" | "signup" | "otp_verify";

const Auth = () => {
  const [view, setView] = useState<AuthView>("signin");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    });
  }, [navigate]);

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email is required to resend verification code.");
      return;
    }
    setLoading(true);
    try {
      const isSignup = !!localStorage.getItem("pending_signup_upi");
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: isSignup,
          data: isSignup ? {
            full_name: localStorage.getItem("pending_signup_name") || "",
            upi_id: localStorage.getItem("pending_signup_upi") || ""
          } : undefined
        }
      });
      if (error) throw error;
      toast.success("A new verification code has been sent! ✉️");
      setInfoMessage(`A new 6-digit code has been sent to ${email}. Please check your inbox.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      if (view === "signin") {
        // 1. Send OTP Login Code (Strictly existing users)
        if (!email.trim()) throw new Error("Please enter your email");

        // Verify if user profile exists before attempting password-less login
        const { data: existingProfile, error: profileErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email.trim())
          .maybeSingle();

        if (profileErr) throw profileErr;
        
        if (!existingProfile) {
          throw new Error("This email is not registered yet. Please click 'Sign Up' first to create your account! 🌱");
        }

        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: false
          }
        });

        if (error) throw error;

        // Clean up any pending signup storage
        localStorage.removeItem("pending_signup_upi");
        localStorage.removeItem("pending_signup_name");

        setInfoMessage(`We have sent a 6-digit login code to ${email}. Please enter it below.`);
        setView("otp_verify");
        setLoading(false);

      } else if (view === "signup") {
        // 2. Send OTP Register Code (Create User)
        if (!displayName.trim()) throw new Error("Please enter your display name");
        if (!upiId.trim()) throw new Error("Please enter your UPI ID");
        if (!agreeTerms) throw new Error("You must agree to the Terms & Conditions and Privacy Policy");

        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email.trim())
          .maybeSingle();

        if (existingProfile) {
          throw new Error("An account with this email already exists. Please select 'Sign In' instead!");
        }

        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: true,
            data: {
              full_name: displayName.trim(),
              upi_id: upiId.trim()
            }
          }
        });

        if (error) throw error;

        // Save metadata temporarily to sync on successful code verification
        localStorage.setItem("pending_signup_upi", upiId.trim());
        localStorage.setItem("pending_signup_name", displayName.trim());

        setInfoMessage(`We have sent a 6-digit activation code to ${email}. Please verify below to activate your account!`);
        setView("otp_verify");
        setLoading(false);

      } else if (view === "otp_verify") {
        // 3. Verify OTP Code
        if (!otpCode.trim()) throw new Error("Please enter the 6-digit verification code");
        
        const { data, error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otpCode.trim(),
          type: "email"
        });

        if (error) throw error;

        // Post-verification profile metadata sync (in case trigger lags)
        if (data.user) {
          const pendingUpi = localStorage.getItem("pending_signup_upi");
          const pendingName = localStorage.getItem("pending_signup_name");
          if (pendingUpi || pendingName) {
            await supabase
              .from("profiles")
              .update({
                upi_id: pendingUpi || undefined,
                full_name: pendingName || undefined
              })
              .eq("id", data.user.id);
            
            localStorage.removeItem("pending_signup_upi");
            localStorage.removeItem("pending_signup_name");
          }
        }

        toast.success("Successfully authenticated! Welcome to Tasklyy 🎉");
        setShowWelcome(true);
        setTimeout(() => {
          setShowWelcome(false);
          navigate("/dashboard");
        }, 900);
      }
    } catch (err: any) {
      console.error("OTP Auth Error:", err);
      setError(err.message || "An authentication error occurred.");
      toast.error(err.message || "Authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{
        background: "linear-gradient(135deg, #f0f7ff 0%, #fef6fb 30%, #f0fdf9 60%, #fdf4ff 100%)",
      }}
    >
      {/* Soft pastel blob backgrounds */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-pink-100/40 blur-3xl" />
      </div>

      {/* Subtle dot grid */}
      <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo — centered */}
        <motion.div
          className="w-full flex flex-col items-center justify-center text-center mb-6"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <motion.div
            className="flex flex-row items-center justify-center animate-in fade-in"
            style={{ gap: 0 }}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src="/taskly-logo.png"
              alt="Tasklyy logo"
              style={{ width: "80px", height: "80px", marginRight: "-8px" }}
              className="object-contain shrink-0"
            />
            <span
              className="font-display font-black text-gray-900 leading-none animate-in fade-in"
              style={{ fontSize: "32px" }}
            >
              Tasklyy
            </span>
          </motion.div>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {view === "signup" ? "Create an account via OTP verification" : 
             view === "otp_verify" ? "Confirm code to authenticate" :
             "Sign in securely using Verification Codes"}
          </p>
        </motion.div>

        <Card className="shadow-xl border-white/60 backdrop-blur-sm bg-white/90 mx-auto">
          <CardContent className="p-6 space-y-6">
            
            {/* Header / Back navigation */}
            {view === "otp_verify" && (
              <button
                type="button"
                onClick={() => {
                  setView("signin");
                  setError("");
                  setInfoMessage("");
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
              </button>
            )}

            {/* Toggle (Sign In / Sign Up) */}
            {(view === "signin" || view === "signup") && (
              <div className="relative flex rounded-lg bg-gray-100 p-1">
                <motion.div
                  className="absolute top-1 bottom-1 rounded-md bg-primary"
                  initial={false}
                  animate={{ 
                    left: view === "signin" ? "4px" : "50%", 
                    width: "calc(50% - 4px)" 
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <button type="button" onClick={() => setView("signin")}
                  className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors ${
                    view === "signin" ? "text-primary-foreground" : "text-muted-foreground"
                  }`}>
                  Sign In
                </button>
                <button type="button" onClick={() => { setView("signup"); setError(""); setInfoMessage(""); }}
                  className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors ${
                    view === "signup" ? "text-primary-foreground" : "text-muted-foreground"
                  }`}>
                  Sign Up
                </button>
              </div>
            )}

            {/* Error & Info Messages */}
            {error && (
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-left shadow-sm"
                >
                  <span className="flex-1 font-semibold">{error}</span>
                </motion.div>
              </div>
            )}

            {infoMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl border border-violet-200/80 bg-violet-50/80 text-violet-800 text-xs text-left leading-relaxed shadow-sm flex items-start gap-2.5 font-medium"
              >
                <span className="shrink-0 mt-0.5">✉️</span>
                <span className="flex-1">{infoMessage}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in">
              <AnimatePresence mode="wait">
                
                {/* ── VIEW: OTP Verify ── */}
                {view === "otp_verify" && (
                  <motion.div key="otp-verify-view" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-800 text-sm">Enter Verification Code</h4>
                      <p className="text-xs text-slate-500">Please enter the 6-digit verification token sent to <strong className="text-slate-700">{email}</strong>.</p>
                    </div>
                    <div>
                      <Label htmlFor="otp" className="block mb-1.5 text-sm font-medium text-foreground">6-Digit Code</Label>
                      <div className="relative mt-1">
                        <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary animate-pulse" />
                        <Input id="otp" value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="e.g. 123456" className="pl-10 text-center tracking-[0.5em] font-mono text-lg font-bold" required />
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-xs font-bold text-primary hover:underline"
                        disabled={loading}
                      >
                        Resend Verification Code?
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── VIEW: Sign In (OTP-only) ── */}
                {view === "signin" && (
                  <motion.div key="signin-view" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-800 text-sm">Sign In via OTP</h4>
                      <p className="text-xs text-slate-500">No password required. Enter your email to receive a secure login code.</p>
                    </div>
                    <div>
                      <Label htmlFor="email" className="block mb-1.5 text-sm font-medium text-foreground">Email</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your registered email" className="pl-10" required />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── VIEW: Sign Up (OTP-only) ── */}
                {view === "signup" && (
                  <motion.div key="signup-view" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4 text-left">
                    <div>
                      <Label htmlFor="name" className="block mb-1.5 text-sm font-medium text-foreground">Display Name</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your name" className="pl-10" required />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="upi" className="block mb-1.5 text-sm font-medium text-foreground">UPI ID (for payments) *</Label>
                      <div className="relative mt-1">
                        <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                        <Input id="upi" value={upiId} onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. success@okaxis" className="pl-10" required />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        This UPI ID is required to securely receive assignment payouts directly to your account.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="email" className="block mb-1.5 text-sm font-medium text-foreground">Email</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@email.com" className="pl-10" required />
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 pt-1 text-left">
                      <input
                        id="agreeTerms"
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                        required
                      />
                      <Label htmlFor="agreeTerms" className="text-xs text-muted-foreground leading-normal font-normal cursor-pointer select-none">
                        I agree to the{" "}
                        <span className="text-primary hover:underline font-semibold cursor-pointer">Terms & Conditions</span>
                        {" "}and{" "}
                        <span className="text-primary hover:underline font-semibold cursor-pointer">Privacy Policy</span>.
                      </Label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" variant="hero" className="w-full gap-2 mt-2 shadow-lg shadow-primary/10" disabled={loading}>
                {loading ? (
                  <motion.div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                ) : (
                  <>
                    {view === "signup" ? "Send Activation Code" :
                     view === "otp_verify" ? "Verify & Enter Dashboard" :
                     "Send Login Code"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Promo banner */}
            {(view === "signin" || view === "signup") && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="flex items-center gap-2 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground text-left leading-relaxed">
                <Sparkles className="h-4 w-4 shrink-0 text-primary animate-pulse" />
                Post jobs, bid on tasks, and earn money within your student community.
              </motion.div>
            )}

          </CardContent>
        </Card>
      </motion.div>

      {/* Welcome Flash screen */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #fef6fb 30%, #f0fdf9 60%, #fdf4ff 100%)" }}
          >
            <div className="relative z-10 text-center space-y-4 flex flex-col items-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.1 }}
                className="mx-auto flex flex-row items-center justify-center" style={{ gap: 0 }}>
                <img src="/taskly-logo.png" alt="Tasklyy logo"
                  style={{ width: "80px", height: "80px", marginRight: "-8px" }}
                  className="object-contain shrink-0" />
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="font-display font-black text-gray-900 tracking-tight leading-none"
                  style={{ fontSize: "32px" }}>Tasklyy</motion.h1>
              </motion.div>
              <div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="mt-1 text-sm font-medium text-gray-500">Welcome to the student marketplace</motion.p>
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-2 mt-8">
                <div className="h-1.5 w-64 bg-primary/20 overflow-hidden rounded-full">
                  <motion.div className="h-full bg-primary" initial={{ width: "0%" }} animate={{ width: "100%" }}
                    transition={{ duration: 0.8 }} />
                </div>
                <p className="text-xs font-medium mt-1 uppercase tracking-widest text-primary/70">
                  Loading workspace
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;

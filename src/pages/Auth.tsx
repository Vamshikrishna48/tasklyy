import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import ColorBends from "@/components/ColorBends";
import { supabase } from "@/lib/supabase";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setShowWelcome(true);
        setTimeout(() => {
          setShowWelcome(false);
          toast.success("Signed in successfully!");
          navigate("/dashboard");
        }, 900);
      } else {
        // Sign up with Supabase
        if (!displayName.trim()) throw new Error("Please enter your display name");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: displayName.trim() } },
        });
        if (error) throw error;

        // If email confirmation is off, we get a session immediately.
        // Let's create the profile manually from the frontend so we don't rely on database triggers.
        if (data.user) {
          const { error: profileError } = await (supabase as any).from("profiles").insert({
            id: data.user.id,
            email: email,
            full_name: displayName.trim(),
            role: "worker",
            is_verified: false,
            verification_status: "unverified",
            wallet_balance: 0
          });
          // Ignore unique constraint errors if the row already exists
          if (profileError && profileError.code !== '23505') {
            console.error("Profile creation error:", profileError);
          }
        }

        if (data.session) {
          // Explicitly sign out because we want them to sign in manually
          await supabase.auth.signOut();
        }
        setShowWelcome(true);
        setTimeout(() => {
          setShowWelcome(false);
          toast.success("Account created successfully! Please sign in.");
          setIsLogin(true);
          setLoading(false);
        }, 900);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Authentication failed. Please check your credentials.");
      toast.error(err.message || "Authentication failed");
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 z-0">
        <ColorBends
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={0} speed={0.2} scale={1} frequency={1}
          warpStrength={1} mouseInfluence={1} parallax={0.5}
          noise={0.1} transparent autoRotate={0}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div className="w-full flex flex-col items-center justify-center text-center mb-6"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <motion.div className="flex flex-row items-center justify-center mb-3" style={{ gap: 0 }} whileHover={{ scale: 1.05 }}>
            <img src="/taskly-logo.png" alt="Tasklyy logo" style={{ width: '120px', height: '120px', marginRight: '-4px' }} className="object-contain shrink-0" />
            <span className="font-display font-black text-gray-900 leading-none" style={{ fontSize: '44px' }}>Tasklyy</span>
          </motion.div>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Welcome back to the student marketplace" : "Join the student freelance community"}
          </p>
        </motion.div>

        <Card className="shadow-lg border-gray-200/50 backdrop-blur-sm bg-white/95 mx-auto">
          <CardContent className="p-6">
            {/* Toggle */}
            <div className="relative flex rounded-lg bg-muted p-1 mb-6">
              <motion.div className="absolute top-1 bottom-1 rounded-md bg-primary" initial={false}
                animate={{ left: isLogin ? "4px" : "50%", width: "calc(50% - 4px)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              <button type="button" onClick={() => setIsLogin(true)}
                className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors ${isLogin ? "text-primary-foreground" : "text-muted-foreground"}`}>
                Sign In
              </button>
              <button type="button" onClick={() => { setIsLogin(false); setError(""); }}
                className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors ${!isLogin ? "text-primary-foreground" : "text-muted-foreground"}`}>
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
                >
                  <span className="flex-1">{error}</span>
                </motion.div>
              )}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <Label htmlFor="name" className="block text-left mb-1.5 text-sm font-medium text-foreground">Display Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name" className="pl-10" required={!isLogin} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout>
                <Label htmlFor="email" className="block text-left mb-1.5 text-sm font-medium text-foreground">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your e-mail" className="pl-10" required />
                </div>
              </motion.div>

              <motion.div layout>
                <Label htmlFor="password" className="block text-left mb-1.5 text-sm font-medium text-foreground">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="pl-10 pr-10" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div layout>
                <Button type="submit" variant="hero" className="w-full gap-2" disabled={loading}>
                  {loading ? (
                    <motion.div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                  ) : (
                    <>{isLogin ? "Sign In" : "Create Account"}<ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </motion.div>
            </form>


            {!isLogin && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="mt-4 flex items-center gap-2 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                Post jobs, bid on tasks, and earn money within your student community.
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Welcome Flash */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <div className="absolute inset-0 z-0">
              <ColorBends colors={["#ff5c7a", "#8a5cff", "#00ffd1"]} rotation={0} speed={0.2} scale={1}
                frequency={1} warpStrength={1} mouseInfluence={1} parallax={0.5} noise={0.1} transparent autoRotate={0} />
            </div>
            <div className="relative z-10 text-center space-y-4 flex flex-col items-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.1 }}
                className="mx-auto flex flex-row items-center justify-center mb-2 gap-0">
                <img src="/taskly-logo.png" alt="Tasklyy logo" style={{ width: '120px', height: '120px', marginRight: '-4px' }} className="object-contain shrink-0" />
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="font-display font-black text-gray-900 tracking-tight leading-none" style={{ fontSize: '44px' }}>Tasklyy</motion.h1>
              </motion.div>
              <div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="mt-1 text-sm font-medium text-muted-foreground">Welcome to the student marketplace</motion.p>
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-2 mt-8">
                <div className="h-1.5 w-64 bg-primary/20 overflow-hidden rounded-full">
                  <motion.div className="h-full bg-primary" initial={{ width: "0%" }} animate={{ width: "100%" }}
                    transition={{ duration: 0.8 }} />
                </div>
                <p className="text-muted-foreground text-xs font-medium mt-1 uppercase tracking-widest text-primary/70">
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

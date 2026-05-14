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
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

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

        // Create profile row
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email,
            full_name: displayName.trim(),
            role: "worker",
            wallet_balance: 0,
            is_verified: false,
            verification_status: "unverified",
          });
        }

        setShowWelcome(true);
        setTimeout(() => {
          setShowWelcome(false);
          toast.success("Account created! Welcome to Taskly.");
          navigate("/dashboard");
        }, 900);
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
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
        <motion.div className="w-full flex flex-col items-center justify-center text-center mb-8"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <motion.div className="flex flex-row items-center justify-center mb-4" whileHover={{ scale: 1.05 }}>
            <img src="/taskly-logo.png" alt="Taskly logo" className="h-28 w-28 object-contain shrink-0" />
            <span className="font-display text-4xl font-bold text-foreground leading-none min-w-max" style={{ marginLeft: "-10px" }}>Taskly</span>
          </motion.div>
          <p className="text-muted-foreground">
            {isLogin ? "Welcome back to the student marketplace" : "Join the student freelance community"}
          </p>
        </motion.div>

        <Card className="shadow-card border-border/50 backdrop-blur-sm bg-card/95 mx-auto">
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
              <button type="button" onClick={() => setIsLogin(false)}
                className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors ${!isLogin ? "text-primary-foreground" : "text-muted-foreground"}`}>
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                    <Label htmlFor="name" className="text-foreground">Display Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name" className="pl-10" required={!isLogin} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout>
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your e-mail" className="pl-10" required />
                </div>
              </motion.div>

              <motion.div layout>
                <Label htmlFor="password" className="text-foreground">Password</Label>
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

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogleSignIn}>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </Button>

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
            <div className="relative z-10 text-center space-y-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.1 }}
                className="mx-auto flex items-center justify-center mb-6">
                <img src="/taskly-logo.png" alt="Taskly logo" className="h-64 w-64 object-contain" />
              </motion.div>
              <div>
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="font-display text-4xl font-bold text-foreground tracking-tight">Taskly</motion.h1>
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

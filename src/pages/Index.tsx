import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, TrendingUp, Shield, Globe } from "lucide-react";
import { categories } from "@/data/mockData";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import MagicBento from "@/components/MagicBento";
import { GlobeBars } from "@/components/ui/cobe-globe-bars";

const indiaCampusMarkers = [
  { id: "delhi", location: [28.61, 77.21] as [number, number], value: 96, label: "Delhi NCR" },
  { id: "bengaluru", location: [12.97, 77.59] as [number, number], value: 98, label: "Bengaluru" },
  { id: "mumbai", location: [19.08, 72.88] as [number, number], value: 94, label: "Mumbai" },
  { id: "hyderabad", location: [17.38, 78.48] as [number, number], value: 92, label: "Hyderabad" },
  { id: "chennai", location: [13.08, 80.27] as [number, number], value: 89, label: "Chennai" },
  { id: "pune", location: [18.52, 73.86] as [number, number], value: 91, label: "Pune" },
  { id: "kolkata", location: [22.57, 88.36] as [number, number], value: 87, label: "Kolkata" },
  { id: "ahmedabad", location: [23.02, 72.57] as [number, number], value: 85, label: "Ahmedabad" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      {/* Hero Section - Sticky */}
      <section className="sticky top-0 h-[85vh] overflow-hidden z-0">
        {/* Subtle neutral animated background blobs (no green) */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-slate-200/20 blur-[90px] pointer-events-none"
            style={{
              width: 200 + i * 100,
              height: 200 + i * 100,
              left: `${(i * 30) % 100}%`,
              top: `${(i * 25) % 100}%`,
            }}
            animate={{
              x: [0, Math.sin(i) * 60, 0],
              y: [0, Math.cos(i) * 60, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <div className="container relative mx-auto px-4 text-center z-10 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="category" className="mb-6 px-4 py-1.5 text-sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              The Student Freelance Platform
            </Badge>
 
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-4xl font-display text-5xl font-black leading-tight text-foreground md:text-7xl md:leading-[1.1] tracking-tighter"
            >
              Crafting Digital{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Careers & Skills.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground font-medium"
            >
              Tasskly is the immersive freelance marketplace built for students. Building truly memorable experiences within your campus community.
            </motion.p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
              <Link to="/jobs">
                <Button variant="hero" size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  Explore Work
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/post-job">
                <Button variant="hero-outline" size="lg" className="h-14 px-10 text-lg rounded-full transition-all">
                  Post a Task
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex justify-center">
              <a 
                href="#global-network" 
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-primary transition-all hover:scale-105 shadow-md shadow-slate-200/50 cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>50+ Campus Hubs Worldwide — Explore 3D Globe</span>
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories - Scrolls over Hero */}
      <section className="relative z-10 border-t py-16 overflow-hidden bg-white">


        <div className="container relative z-10 mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-black text-gray-800 md:text-5xl tracking-tight">
              Services We Offer
            </h2>
            <p className="mt-4 text-lg text-gray-600">We blend strategic thinking with bold creativity across categories.</p>
          </div>

          <MagicBento />
        </div>
      </section>

      {/* India Campus Network Section with 3D Interactive Rotating Globe */}
      <section id="global-network" className="relative z-20 border-t py-24 bg-white overflow-hidden">
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left text / highlights */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider border-primary/30 text-primary bg-primary/5 inline-flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                India's Premier Student Network
              </Badge>

              <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
                Connecting Ambitious Students Across{" "}
                <span className="bg-gradient-to-r from-primary via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                  India's Campus Hubs.
                </span>
              </h2>

              <p className="text-lg text-muted-foreground leading-relaxed">
                From IIT Delhi and BITS Pilani to RVCE Bengaluru and Anna University Chennai, Tasskly connects verified student talent with instant escrow security.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link to="/jobs">
                  <Button variant="hero" size="lg" className="h-12 px-8 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                    Explore Campus Jobs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/post-job">
                  <Button variant="outline" size="lg" className="h-12 px-8 rounded-full hover:bg-slate-50 transition-all">
                    Post a Campus Task
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Globe Visualization */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 flex justify-center items-center"
            >
              <div className="relative w-full max-w-[460px] aspect-square rounded-3xl bg-gradient-to-b from-slate-50 to-slate-100/60 p-6 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center">
                {/* Subtle decorative glowing background blur */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Status pill on top of card */}
                <div className="absolute top-5 left-5 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur border text-xs font-medium text-slate-700 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Live Indian Hub Activity</span>
                </div>

                {/* 3D Rotating Globe with India Markers Only */}
                <div className="w-full h-full flex items-center justify-center pt-4">
                  <GlobeBars 
                    markers={indiaCampusMarkers}
                    className="w-full max-w-[340px]"
                    speed={0.0035}
                  />
                </div>

                <div className="absolute bottom-4 text-center text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                  Click &amp; drag to explore Indian hubs
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* FAQ Section (Pulsewave style) */}
      <section className="relative z-10 bg-white py-24 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="font-display text-4xl font-black text-foreground md:text-5xl tracking-tight mb-6">
                Frequently Asked<br/>Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                We blend strategic thinking with bold creativity. Tasskly is more than a marketplace—it's a partner in your career journey.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { q: "How fast can I start?", a: "Instantly. Sign up with your student email and you can post or find work in minutes. Our onboarding is streamlined for maximum speed." },
                { q: "Is it secure?", a: "Absolutely. We use a secure enterprise-grade escrow system for all payments, ensuring money only moves when work is verified and complete." },
                { q: "What projects can I post?", a: "Anything from simple assignments and design tasks to complex coding projects and long-term mentoring. If it can be done by a student, it belongs on Tasskly." }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group rounded-2xl border bg-gray-50 p-6 transition-all hover:border-primary/50 cursor-pointer"
                >
                  <h4 className="font-display text-xl font-bold text-foreground flex justify-between items-center group-hover:text-primary transition-colors">
                    {item.q}
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -rotate-45" />
                  </h4>
                  <p className="mt-3 text-muted-foreground hidden group-hover:block animate-in slide-in-from-top-2 duration-300">{item.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 bg-background py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl font-black text-foreground md:text-5xl tracking-tight">
              Our Process
            </h2>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "Discovery",
                desc: "Post a micro job or browse tasks that match your unique skills and vision.",
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Execution",
                desc: "Accept jobs instantly and secure payment via our enterprise-grade escrow system.",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Delivery",
                desc: "Complete the work, get rated, and receive payment securely in your dashboard.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="group"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="mb-3 font-display text-2xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer (Pulsewave style) */}
      <footer className="relative z-10 border-t bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16 text-left">
            <div className="col-span-2">
              <span className="font-display text-3xl font-black text-foreground block mb-4">Tasskly</span>
              <p className="text-muted-foreground max-w-xs mb-6">
                The immersive freelance marketplace built for students, by students. Worldwide campus reach.
              </p>
              <div className="flex gap-4">
                 {/* Social links placeholder */}
                 <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">T</div>
                 <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">I</div>
                 <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">L</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-primary">Navigation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Home</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Work</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Services</li>
                <li className="hover:text-primary transition-colors cursor-pointer">About</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-primary">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Design</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Development</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Branding</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Tutoring</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-primary">Contact</h4>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=support@tasskly.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground mb-2 block hover:text-primary transition-colors animate-in fade-in duration-300">
                support@tasskly.com
              </a>
              <a href="https://wa.me/919640008684" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground mb-2 block hover:text-primary transition-colors animate-in fade-in duration-350">
                WhatsApp: 9640008684
              </a>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest">
            <p>© 2026 Tasskly Studio - All rights reserved</p>
            <p>Created with passion for students</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

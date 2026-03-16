import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, TrendingUp, Shield } from "lucide-react";
import { categories } from "@/data/mockData";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Animated background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(160_84%_39%/0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(16_85%_61%/0.08),transparent_50%)]" />
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/5"
              style={{
                width: 100 + i * 60,
                height: 100 + i * 60,
                left: `${15 + i * 18}%`,
                top: `${10 + i * 15}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="container relative mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="category" className="mb-6 px-4 py-1.5 text-sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              The Student Freelance Platform
            </Badge>

            <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight text-foreground md:text-6xl md:leading-tight">
              Turn Your Skills Into{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Campus Cash
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Post micro jobs, accept tasks instantly, and earn money — all within your student community. From poster design to coding help.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/jobs">
                <Button variant="hero" size="lg" className="gap-2 px-8">
                  Browse Jobs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/post-job">
                <Button variant="hero-outline" size="lg" className="px-8">
                  Post a Job
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-16 grid max-w-md grid-cols-3 gap-8"
          >
            {[
              { value: "1.2K+", label: "Active Jobs" },
              { value: "3.5K+", label: "Students" },
              { value: "₹45K+", label: "Earned" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold text-primary md:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-t bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Popular Categories
            </h2>
            <p className="mt-2 text-muted-foreground">Find the perfect gig for your skills</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link to={`/jobs?category=${encodeURIComponent(cat.name)}`}>
                  <div className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl border bg-background p-5 transition-all hover:border-primary hover:shadow-card">
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="font-display text-sm font-semibold text-foreground">
                      {cat.name}
                    </span>
                    
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              How It Works
            </h2>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: <Sparkles className="h-6 w-6" />,
                title: "Post or Find",
                desc: "Post a micro job or browse tasks that match your skills.",
              },
              {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Accept & Secure",
                desc: "Accept jobs instantly and secure payment via our escrow system.",
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Deliver & Earn",
                desc: "Complete the work, get rated, and receive payment securely.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {step.icon}
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center">
          <span className="font-display text-lg font-bold text-foreground">Taskly</span>
          <p className="text-sm text-muted-foreground">
            The micro job marketplace built for students, by students.
          </p>
          <p className="text-xs text-muted-foreground">© 2026 Taskly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

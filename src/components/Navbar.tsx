import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, LayoutDashboard, LogIn, LogOut, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const email = localStorage.getItem("demoUserEmail");
    setUser(email ? { email } : null);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("demoUserEmail");
    localStorage.removeItem("isAdminLoggedIn");
    toast.success("Signed out (demo mode)");
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-0">
          <img
            src="/taskly-logo.png"
            alt="Taskly logo"
            className="h-10 w-auto object-contain"
          />
          <span className="font-display text-xl font-bold text-foreground">
            Taskly
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link to="/jobs">
            <Button variant={isActive("/jobs") ? "secondary" : "ghost"} size="sm" className="gap-2">
              <Search className="h-4 w-4" />
              Browse Jobs
            </Button>
          </Link>
          <Link to="/post-job">
            <Button variant={isActive("/post-job") ? "secondary" : "ghost"} size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Post a Job
            </Button>
          </Link>
          <Link to="/on-time-works">
            <Button variant={isActive("/on-time-works") ? "secondary" : "ghost"} size="sm" className="gap-2">
              <Clock className="h-4 w-4" />
              On Time Works
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/post-job" className="md:hidden">
            <Button size="icon" variant="ghost">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="hero" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="hero" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

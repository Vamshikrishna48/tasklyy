import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, LayoutDashboard, LogIn, LogOut, Clock, CheckCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, profile } = useApp();
  const isAuthenticated = !!session;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("demoUserEmail");
    localStorage.removeItem("demoAdminAuth");
    toast.success("Signed out");
    navigate("/auth");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <Link to="/" className="flex items-center" style={{ gap: 0 }}>
          <img
            src="/taskly-logo.png"
            alt="Tasklyy logo"
            style={{ width: "80px", height: "80px", marginRight: "-10px" }}
            className="object-contain"
          />
          <span className="font-display font-black text-foreground" style={{ fontSize: "26px", lineHeight: 1 }}>
            Tasklyy
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
        </div>

        <div className="flex items-center gap-2">
          <Link to="/post-job" className="md:hidden">
            <Button size="icon" variant="ghost">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </Link>
          
          {isAuthenticated ? (
            <>
              {profile && (
                <div className="hidden lg:flex items-center gap-2 mr-2 px-2 border-r border-border min-w-0">
                  <span className="text-sm font-medium truncate max-w-[120px]">{profile.full_name}</span>
                </div>
              )}
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

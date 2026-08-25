import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndianRupee, Lock, Users, CheckCircle, Rocket, Construction } from "lucide-react";
import { toast } from "sonner";
import { getIsPlatformLaunched, setPlatformLaunched, syncLaunchStateFromServer } from "@/utils/launchControl";

interface AdminStats {
  platform_balance: number;
  total_escrow: number;
  total_jobs: number;
  active_jobs: number;
  completed_jobs: number;
  total_users: number;
}

const AdminOverview = () => {
  const { fetchAdminStats } = useAdmin();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLaunched, setIsLaunched] = useState(() => getIsPlatformLaunched());
  const [launching, setLaunching] = useState(false);

  const loadStats = async () => {
    const data = await fetchAdminStats();
    if (data) setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
    // Sync real launch state from Supabase on mount
    syncLaunchStateFromServer().then(launched => setIsLaunched(launched));
  }, []);

  const handleToggleLaunch = async () => {
    setLaunching(true);
    const nextState = !isLaunched;
    const persisted = await setPlatformLaunched(nextState);
    setIsLaunched(nextState);
    setLaunching(false);

    if (!persisted) {
      toast.error(
        "Launch updated on this device only. Server save failed — other devices may not see it. Ensure SUPABASE_SERVICE_ROLE_KEY and platform_settings table are configured.",
        { duration: 8000 }
      );
      return;
    }

    if (nextState) {
      toast.success("🚀 Website Officially Launched to Public! All devices will unlock within a few seconds.", { duration: 6000 });
    } else {
      toast.warning("🚧 Switched to Under Development Mode. Popup enabled & non-admin logins restricted on all devices.", { duration: 6000 });
    }
  };

  const fmt = (n: number) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground text-sm">
          Manage platform funds, track escrow-based payouts, and control website launch mode.
        </p>
      </div>

      {/* Launch Control Panel */}
      <Card className="border-2 border-violet-500/20 bg-gradient-to-r from-violet-500/5 via-indigo-500/5 to-purple-500/5 shadow-md">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Rocket className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Website Launch & Development Status
              </h2>
              {isLaunched ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold">
                  🟢 LIVE & PUBLIC
                </Badge>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold">
                  🚧 UNDER DEVELOPMENT
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              {isLaunched
                ? "The website is currently LIVE for all users. The Under Development popup is disabled globally, and regular user logins are fully enabled."
                : "The website is currently under active development. Visitors see the Under Development popup, and logins/signups are restricted strictly to Administrators."}
            </p>
          </div>

          <Button
            onClick={handleToggleLaunch}
            size="lg"
            className={
              isLaunched
                ? "bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2 shrink-0 shadow-md"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold gap-2 shrink-0 shadow-lg shadow-emerald-500/20"
            }
          >
            {isLaunched ? (
              <>
                <Construction className="h-4 w-4" />
                Switch to Under Development Mode
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Launch Website to Public
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-1">
            <IndianRupee className="h-5 w-5 text-primary mb-1" />
            <div className="font-display text-2xl font-bold text-foreground">{loading ? '...' : fmt(stats?.platform_balance ?? 0)}</div>
            <div className="text-xs text-muted-foreground">Platform / Admin Balance</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 space-y-1">
            <Lock className="h-5 w-5 text-muted-foreground mb-1" />
            <div className="font-display text-2xl font-bold text-foreground">{loading ? '...' : fmt(stats?.total_escrow ?? 0)}</div>
            <div className="text-xs text-muted-foreground">Held in Escrow (to freelancers)</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 space-y-1">
            <CheckCircle className="h-5 w-5 text-primary mb-1" />
            <div className="font-display text-2xl font-bold text-foreground">{loading ? '...' : stats?.completed_jobs ?? 0}</div>
            <div className="text-xs text-muted-foreground">Completed Jobs</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 space-y-1">
            <Users className="h-5 w-5 text-accent mb-1" />
            <div className="font-display text-2xl font-bold text-foreground">{loading ? '...' : stats?.total_users ?? 0}</div>
            <div className="text-xs text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-5 space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">How the payment flow works</h2>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>
              <Badge variant="outline" className="mr-2">1</Badge>
              When a job owner accepts a bid, they pay the full amount to the platform/admin.
            </li>
            <li>
              <Badge variant="outline" className="mr-2">2</Badge>
              10% is kept as platform fee, and 90% is stored as an escrow payment for the freelancer.
            </li>
            <li>
              <Badge variant="outline" className="mr-2">3</Badge>
              After the work is confirmed, you (the admin) release escrow in the Escrow Payments screen.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;

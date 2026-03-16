import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Lock, Unlock, Users, User, Package, ArrowRight, Shield } from "lucide-react";

const AdminOverview = () => {
  const { payments, platformBalance, seedDatabase } = useApp();

  const totalEscrow = payments
    .filter((p) => p.status === "escrow")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalProcessed = payments
    .filter((p) => p.type === "spent")
    .reduce((sum, p) => sum + p.amount, 0);

  const completedPayouts = payments
    .filter((p) => p.type === "earned" && p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const activeEscrowCount = payments.filter((p) => p.status === "escrow").length;

  const isFirebaseConnected = import.meta.env.VITE_FIREBASE_API_KEY !== "...";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground text-sm">
            Manage platform funds and track escrow-based payouts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isFirebaseConnected ? "default" : "destructive"} className="h-7 px-3">
            {isFirebaseConnected ? "🟢 Firebase Connected" : "🔴 Firebase Disconnected"}
          </Badge>
          <button 
            onClick={seedDatabase}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Seed Demo Projects
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-1">
            <DollarSign className="h-5 w-5 text-primary mb-1" />
            <div className="font-display text-2xl font-bold text-foreground">₹{platformBalance}</div>
            <div className="text-xs text-muted-foreground">Platform / Admin Balance</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 space-y-1">
            <Lock className="h-5 w-5 text-muted-foreground mb-1" />
            <div className="font-display text-2xl font-bold text-foreground">₹{totalEscrow}</div>
            <div className="text-xs text-muted-foreground">Held in Escrow (to freelancers)</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 space-y-1">
            <Unlock className="h-5 w-5 text-primary mb-1" />
            <div className="font-display text-2xl font-bold text-foreground">₹{completedPayouts}</div>
            <div className="text-xs text-muted-foreground">Released to Freelancers</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 space-y-1">
            <Users className="h-5 w-5 text-accent mb-1" />
            <div className="font-display text-2xl font-bold text-foreground">{activeEscrowCount}</div>
            <div className="text-xs text-muted-foreground">Active Escrow Payments</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-card border-none overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-display font-bold text-foreground flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-primary" />
              Recent Platform Ledger (Money Tracking)
            </h2>
            <Badge variant="outline" className="text-[10px] h-5">Real-time Updates</Badge>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-muted/50 text-muted-foreground font-medium text-[10px] uppercase tracking-wider border-b">
                  <tr>
                    <th className="px-6 py-4">Task Details</th>
                    <th className="px-6 py-4">Funds Origin & Destination</th>
                    <th className="px-6 py-4">Admin Status</th>
                    <th className="px-6 py-4 text-right">Freelancer Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.filter(p => p.recipient !== 'platform').length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                        No transactions recorded in the ledger yet.
                      </td>
                    </tr>
                  ) : (
                    payments.filter(p => p.recipient !== 'platform').slice(0, 10).map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-5">
                          <div className="font-bold text-foreground text-sm leading-tight">{p.jobTitle}</div>
                          <div className="text-[10px] text-muted-foreground mt-1 tabular-nums">{p.date}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold">FROM</span>
                              <span className="text-foreground font-medium text-xs truncate max-w-[120px]">{p.posterName || "User"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-bold">TO</span>
                              <span className="text-foreground font-medium text-xs truncate max-w-[120px]">{p.freelancerName || "Freelancer"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <Badge 
                            variant={p.status === 'escrow' ? 'secondary' : 'default'} 
                            className={`text-[9px] font-black h-5 ${p.status === 'escrow' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : ''}`}
                          >
                            {p.status === 'escrow' ? '🛡️ HELD IN ESCROW' : '✅ RELEASED'}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="font-black text-foreground text-base">₹{p.amount}</div>
                          <div className="text-[9px] font-bold text-muted-foreground mt-0.5">
                            {p.status === 'escrow' ? '(Money in your account)' : 'Payout Completed'}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-accent/20">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Financial Administrator's Guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground flex items-center gap-1 uppercase tracking-wider">
                  <ArrowRight className="h-3 w-3 text-blue-500" /> Receiving Money
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When a Poster accepts a bid, you receive the <strong>full 100%</strong> of the task budget.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground flex items-center gap-1 uppercase tracking-wider">
                  <ArrowRight className="h-3 w-3 text-green-500" /> Sending Money
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You hold the 90% amount. Use the <strong>"Release"</strong> button in the Escrow section to send it to the freelancer.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground flex items-center gap-1 uppercase tracking-wider">
                  <ArrowRight className="h-3 w-3 text-amber-500" /> Platform Fee
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The remaining 10% is your fixed service fee and is automatically added to your <strong>Admin Balance</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;


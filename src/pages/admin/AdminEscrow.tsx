import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, CheckCircle2, Shield, User, ArrowRight, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const AdminEscrow = () => {
  const { payments, jobs, releaseEscrow } = useApp();

  const escrowPayments = payments.filter((p) => p.status === "escrow");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Escrow Management</h1>
          <p className="text-muted-foreground text-sm">
            Review submitted work and release payouts (90%) to freelancers.
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1 font-bold">
          <Shield className="h-3 w-3 text-primary" />
          Pending Payouts: {escrowPayments.length}
        </Badge>
      </div>

      <div className="grid gap-4">
        {escrowPayments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Shield className="h-8 w-8 opacity-20" />
              <p>No escrow payments pending review.</p>
            </CardContent>
          </Card>
        ) : (
          escrowPayments.map((p, i) => {
            const job = jobs.find(j => j.id === p.jobId);
            const workSubmitted = !!job?.submittedWork;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="shadow-card overflow-hidden border-l-4 border-l-amber-500">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center p-5 gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                            Job ID: {p.jobId?.slice(0, 8)}
                          </Badge>
                          {workSubmitted ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">✅ Work Submitted</Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">🛠️ In Progress</Badge>
                          )}
                        </div>
                        <h3 className="font-display font-bold text-lg text-foreground truncate">{p.jobTitle}</h3>
                        
                        <div className="mt-3 grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-black">Poster</p>
                            <p className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                              <User className="h-3 w-3 text-blue-500" /> {p.posterName}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-black">Freelancer</p>
                            <p className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                              <User className="h-3 w-3 text-green-500" /> {p.freelancerName}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-6 p-2 rounded bg-muted/30 border border-muted w-fit text-xs text-muted-foreground">
                          <div className="flex flex-col">
                            <span className="font-black text-foreground">₹{Math.round(p.amount / 0.9)}</span>
                            <span>Total Collected</span>
                          </div>
                          <ArrowRight className="h-3 w-3 opacity-30" />
                          <div className="flex flex-col">
                            <span className="font-black text-primary">₹{p.amount}</span>
                            <span>Freelancer (90%)</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-amber-600">₹{Math.round((p.amount / 0.9) * 0.1)}</span>
                            <span>Platform (10%)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0 md:w-48">
                        {workSubmitted ? (
                          <div className="space-y-2">
                            <Link to={`/jobs/${p.jobId}`} className="block">
                              <Button variant="outline" size="sm" className="w-full gap-1">
                                <FileText className="h-4 w-4" /> Review Work
                              </Button>
                            </Link>
                            <Button
                              variant="hero"
                              size="sm"
                              className="w-full gap-1 shadow-md shadow-amber-200"
                              onClick={() => releaseEscrow(p.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" /> Release Funds
                            </Button>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-blue-50 text-blue-700 text-[10px] text-center italic border border-blue-100">
                            Waiting for freelancer to submit work...
                          </div>
                        )}
                        <p className="text-[9px] text-center text-muted-foreground uppercase tracking-tighter mt-1">
                          Escrow protected since {new Date(p.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminEscrow;


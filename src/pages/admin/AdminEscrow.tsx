import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, CheckCircle2, Shield, XCircle, Loader2, User, Briefcase, IndianRupee, Percent } from "lucide-react";
import { motion } from "framer-motion";

const PLATFORM_FEE_PCT = 30;

const AdminEscrow = () => {
  const { fetchEscrowQueue, releaseEscrow, refundEscrow } = useAdmin();
  const [escrowPayments, setEscrowPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    const data = await fetchEscrowQueue();
    setEscrowPayments(data);
    setLoading(false);
  };

  useEffect(() => { loadQueue(); }, []);

  const handleRelease = async (jobId: string) => {
    setActionLoading(jobId);
    await releaseEscrow(jobId);
    setActionLoading(null);
    await loadQueue();
  };

  const handleRefund = async (jobId: string) => {
    setActionLoading(jobId);
    await refundEscrow(jobId);
    setActionLoading(null);
    await loadQueue();
  };

  // Calculate breakdown based on 30% platform fee
  const getPlatformFee = (total: number) => Math.round(total * PLATFORM_FEE_PCT / 100);
  const getWorkerPayout = (total: number) => total - getPlatformFee(total);

  const totalEscrow = escrowPayments.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const totalPlatformFee = escrowPayments.reduce((sum, p) => sum + getPlatformFee(p.total_amount || 0), 0);
  const totalWorkerPayout = escrowPayments.reduce((sum, p) => sum + getWorkerPayout(p.total_amount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Escrow Payments</h1>
          <p className="text-muted-foreground text-sm">
            Platform takes <span className="font-bold text-primary">30%</span> fee. Worker receives <span className="font-bold text-green-600">70%</span> on release.
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1 text-sm px-3 py-1">
          <Shield className="h-3 w-3" />
          {escrowPayments.length} pending
        </Badge>
      </div>

      {/* Summary Cards */}
      {!loading && escrowPayments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">Total in Escrow</p>
              <p className="text-2xl font-black text-blue-700">₹{totalEscrow.toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <p className="text-xs text-amber-600 font-bold uppercase tracking-wide mb-1">Platform Fee (30%)</p>
              <p className="text-2xl font-black text-amber-700">₹{totalPlatformFee.toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <p className="text-xs text-green-600 font-bold uppercase tracking-wide mb-1">Worker Payout (70%)</p>
              <p className="text-2xl font-black text-green-700">₹{totalWorkerPayout.toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Escrow List */}
      <Card className="shadow-card">
        <CardContent className="p-4 space-y-4">
          {loading ? (
            <div className="h-[160px] flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : escrowPayments.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
              No escrow payments waiting. Accept a bid on a job to create one.
            </div>
          ) : (
            escrowPayments.map((p, i) => {
              const total = p.total_amount || 0;
              const fee = getPlatformFee(total);
              const payout = getWorkerPayout(total);
              const isLoading = actionLoading === p.job_id;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border rounded-xl p-4 bg-card space-y-4"
                >
                  {/* Job title + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Briefcase className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{p.job_title || 'Untitled Job'}</p>
                        <p className="text-[10px] text-muted-foreground">Deadline: {p.job_deadline || '—'}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 bg-amber-50 text-amber-700 border-amber-200">
                      {p.job_status?.replace('_', ' ') || 'In Escrow'}
                    </Badge>
                  </div>

                  {/* Poster & Worker */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-muted/40 rounded-lg p-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Poster</p>
                        <p className="text-xs font-semibold text-foreground">{p.poster_name || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/40 rounded-lg p-2">
                      <User className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Worker</p>
                        <p className="text-xs font-semibold text-foreground">{p.worker_name || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="rounded-lg border bg-muted/20 divide-y">
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <IndianRupee className="h-3 w-3" /> Total Amount Paid
                      </span>
                      <span className="text-sm font-black text-foreground">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-xs text-amber-600 flex items-center gap-1.5">
                        <Percent className="h-3 w-3" /> Platform Fee (30%)
                      </span>
                      <span className="text-sm font-bold text-amber-600">− ₹{fee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2 bg-green-50 rounded-b-lg">
                      <span className="text-xs text-green-700 font-bold flex items-center gap-1.5">
                        <ArrowDownLeft className="h-3 w-3" /> Worker Receives (70%)
                      </span>
                      <span className="text-sm font-black text-green-700">₹{payout.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                      disabled={isLoading}
                      onClick={() => handleRelease(p.job_id)}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Release ₹{payout.toLocaleString('en-IN')} to Worker
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
                      disabled={isLoading}
                      onClick={() => handleRefund(p.job_id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Refund
                    </Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEscrow;

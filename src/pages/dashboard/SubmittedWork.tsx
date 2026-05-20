import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Loader2,
  FileUp,
  Lock,
  AlertCircle,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { NoScreenshotWrapper } from "@/components/NoScreenshotWrapper";
import { getSignedUrl } from "@/utils/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface SubmittedFile {
  id: string;
  job_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  is_submission: boolean;
  downloadUrl?: string;
}

interface SubmittedJob {
  id: string;
  title: string;
  status: string;
  budget: number;
  poster_id: string;
  worker_id: string;
  rejection_reason?: string;
  poster: { full_name: string };
  worker?: { full_name: string };
  files: SubmittedFile[];
}

const SubmittedWork = () => {
  const { user, profile } = useApp();
  const [jobs, setJobs] = useState<SubmittedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialogJob, setRejectDialogJob] = useState<SubmittedJob | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Fetch jobs where user is poster (with submitted/completed status) or worker
      const { data, error } = await (supabase as any)
        .from("jobs")
        .select(
          "*, poster:profiles!jobs_poster_id_fkey(full_name), worker:profiles!jobs_worker_id_fkey(full_name), files:job_files(*)"
        )
        .or(`poster_id.eq.${user.id},worker_id.eq.${user.id}`)
        .in("status", ["submitted", "completed", "rejected"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Attach signed URLs to submission files for completed jobs
      const enriched = await Promise.all(
        (data as SubmittedJob[]).map(async (job) => {
          const enrichedFiles = await Promise.all(
            job.files.map(async (f) => {
              // Download link only available for completed jobs
              if (job.status === "completed") {
                try {
                  const downloadUrl = await getSignedUrl("job-files", f.file_url);
                  return { ...f, downloadUrl };
                } catch {
                  return f;
                }
              }
              return f;
            })
          );
          return { ...job, files: enrichedFiles };
        })
      );

      setJobs(enriched);
    } catch (err) {
      console.error("SubmittedWork fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleAccept = async (job: SubmittedJob) => {
    setActionLoading(true);
    try {
      // Get escrow transaction
      const { data: escrow } = await (supabase as any)
        .from("escrow_transactions")
        .select("id, worker_amount")
        .eq("job_id", job.id)
        .eq("status", "held")
        .single();

      if (escrow) {
        // Release escrow → update status to 'released'
        await (supabase as any)
          .from("escrow_transactions")
          .update({ status: "released", released_at: new Date().toISOString() })
          .eq("id", escrow.id);

        // Credit worker wallet
        await (supabase as any).rpc("increment_wallet", {
          user_id: job.worker_id,
          amount: escrow.worker_amount,
        }).catch(() => {
          // rpc may not exist yet – just log
          console.warn("increment_wallet RPC not found; wallet not updated");
        });

        // Log to admin ledger
        await (supabase as any).from("admin_ledger").insert({
          job_id: job.id,
          type: "escrow_released",
          amount: escrow.worker_amount,
          from_user_id: job.poster_id,
          to_user_id: job.worker_id,
          note: `Work accepted for: ${job.title}`,
        });
      }

      // Update job status to completed
      await (supabase as any)
        .from("jobs")
        .update({ status: "completed" })
        .eq("id", job.id);

      toast.success("Work accepted! Payment released to worker.");
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept work.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectDialogJob) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    setActionLoading(true);
    try {
      const budget = rejectDialogJob.budget;
      const posterRefund = Math.floor(budget * 0.70);
      const workerComp = Math.floor(budget * 0.25);
      const platformFee = budget - posterRefund - workerComp;

      // Update escrow to refunded
      await (supabase as any)
        .from("escrow_transactions")
        .update({ status: "refunded" })
        .eq("job_id", rejectDialogJob.id)
        .eq("status", "held");

      // Update job status to rejected + store reason
      await (supabase as any)
        .from("jobs")
        .update({ status: "rejected", rejection_reason: rejectReason.trim() })
        .eq("id", rejectDialogJob.id);

      // Refund Poster (70%)
      await (supabase as any).rpc("increment_wallet", {
        user_id: rejectDialogJob.poster_id,
        amount: posterRefund,
      }).catch(() => console.warn("increment_wallet RPC not found"));

      // Compensate Worker (25%)
      await (supabase as any).rpc("increment_wallet", {
        user_id: rejectDialogJob.worker_id,
        amount: workerComp,
      }).catch(() => console.warn("increment_wallet RPC not found"));

      // Log Poster Refund to admin ledger
      await (supabase as any).from("admin_ledger").insert({
        job_id: rejectDialogJob.id,
        type: "refund",
        amount: posterRefund,
        from_user_id: rejectDialogJob.poster_id,
        to_user_id: rejectDialogJob.poster_id,
        note: `70% Refund for rejected work: ${rejectReason.trim()}`,
      });

      // Log Worker Compensation to admin ledger
      await (supabase as any).from("admin_ledger").insert({
        job_id: rejectDialogJob.id,
        type: "escrow_released",
        amount: workerComp,
        from_user_id: rejectDialogJob.poster_id,
        to_user_id: rejectDialogJob.worker_id,
        note: `25% Compensation for rejected work.`,
      });

      // Log Platform Fee to admin ledger
      await (supabase as any).from("admin_ledger").insert({
        job_id: rejectDialogJob.id,
        type: "fee_collected",
        amount: platformFee,
        from_user_id: rejectDialogJob.poster_id,
        note: `5% Platform fee on rejected work.`,
      });

      toast.success("Work rejected. Escrow marked for refund.");
      setRejectDialogJob(null);
      setRejectReason("");
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject work.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Submitted Work</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review submitted deliverables and accept or reject work.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Upload className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p>No submitted work yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {jobs.map((job, i) => {
              const isPoster = job.poster_id === user?.id;
              const isWorker = job.worker_id === user?.id;
              const isCompleted = job.status === "completed";
              const isRejected = job.status === "rejected";
              const submissionFiles = job.files.filter((f) => f.is_submission);
              const briefFiles = job.files.filter((f) => !f.is_submission);

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-primary/10 shadow-card overflow-hidden">
                    <CardContent className="p-5 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="font-display font-bold text-foreground hover:text-primary transition-colors"
                          >
                            {job.title}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isPoster
                              ? `Worker: ${job.worker?.full_name || "—"}`
                              : `Poster: ${job.poster.full_name}`}
                          </p>
                        </div>
                        <Badge
                          variant={
                            isCompleted ? "outline" : isRejected ? "destructive" : "secondary"
                          }
                          className="shrink-0"
                        >
                          {job.status === "submitted" && "Awaiting Review"}
                          {job.status === "completed" && "✓ Accepted"}
                          {job.status === "rejected" && "✗ Rejected"}
                        </Badge>
                      </div>

                      {/* Rejection reason (if any) */}
                      {isRejected && job.rejection_reason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-sm text-red-700">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Rejection Reason:</p>
                            <p>{job.rejection_reason}</p>
                          </div>
                        </div>
                      )}

                      {/* Submission Files */}
                      {submissionFiles.length > 0 && (
                        <NoScreenshotWrapper>
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                              Submitted Files
                            </p>
                            {submissionFiles.map((f) => (
                              <div
                                key={f.id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                    <FileUp className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium truncate max-w-[200px]">
                                      {f.file_name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase">
                                      {f.file_type?.split("/")[1] || "file"}
                                    </p>
                                  </div>
                                </div>

                                {/* Download only available after acceptance */}
                                {isCompleted && f.downloadUrl ? (
                                  <a href={f.downloadUrl} download={f.file_name}>
                                    <Button size="sm" variant="ghost" className="text-primary gap-1">
                                      <Download className="h-3.5 w-3.5" />
                                      Download
                                    </Button>
                                  </a>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] opacity-60">
                                    <Lock className="h-3 w-3 mr-1" />
                                    {isRejected ? "Rejected" : "Locked until accepted"}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </NoScreenshotWrapper>
                      )}

                      {/* Brief / Original files */}
                      {briefFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                            Original Brief Files
                          </p>
                          {briefFiles.map((f) => (
                            <div
                              key={f.id}
                              className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg border text-sm"
                            >
                              <FileUp className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{f.file_name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions for poster on submitted jobs */}
                      {isPoster && job.status === "submitted" && (
                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="hero"
                            className="flex-1 gap-2"
                            disabled={actionLoading}
                            onClick={() => handleAccept(job)}
                          >
                            {actionLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Accept & Release Payment
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 text-destructive border-destructive/30 gap-2"
                            disabled={actionLoading}
                            onClick={() => setRejectDialogJob(job)}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject Work
                          </Button>
                        </div>
                      )}

                      {/* Worker: notify about status */}
                      {isWorker && (
                        <div
                          className={`p-3 rounded-lg border text-sm ${
                            isCompleted
                              ? "bg-green-50 border-green-200 text-green-700"
                              : isRejected
                              ? "bg-red-50 border-red-200 text-red-700"
                              : "bg-amber-50 border-amber-200 text-amber-700"
                          }`}
                        >
                          {isCompleted &&
                            "✓ Your work was accepted! Payment has been released to your wallet."}
                          {isRejected &&
                            "✗ Your work was rejected. See the reason above and contact the poster."}
                          {job.status === "submitted" &&
                            "⏳ Awaiting poster review. You'll be notified once accepted or rejected."}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialogJob} onOpenChange={() => setRejectDialogJob(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submitted Work</DialogTitle>
            <DialogDescription>
              Explain why you are rejecting this submission. The worker will see your reason.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g. The work didn't follow the brief. Specific issues: ..."
            className="min-h-[120px]"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectDialogJob(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading || !rejectReason.trim()}
              onClick={handleReject}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmittedWork;

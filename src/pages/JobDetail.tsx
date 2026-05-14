import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Clock, ArrowLeft, CheckCircle, Info, Loader2, IndianRupee, MessageSquare, AlertTriangle, XCircle, Send, FileUp, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { openRazorpayCheckout } from "@/integrations/payments/razorpay";
import { sendBidNotification, sendBidRejectedNotification, sendPaymentRequiredNotification } from "@/hooks/useNotificationPermission";
import { useJobs } from "@/hooks/useJobs";

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useApp();
  const { fetchJobById, releaseEscrow, declineWork, placeBid, acceptJob, cancelJobForNonPayment } = useJobs();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<any[]>([]);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [paymentDue, setPaymentDue] = useState<string | null>(null);

  // Bid form
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("3");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidSubmitted, setBidSubmitted] = useState(false);

  const loadJob = useCallback(async () => {
    if (!id) return;
    if (!id) return;
    const { data } = await supabase
      .from("jobs")
      .select("*, poster:profiles!jobs_poster_id_fkey(full_name, avatar_url), worker:profiles!jobs_worker_id_fkey(full_name), files:job_files(*)")
      .eq("id", id)
      .single();
    setJob(data);
    if (data?.payment_due_at) setPaymentDue(data.payment_due_at);
    setLoading(false);
  }, [id]);

  const loadBids = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("bids")
      .select("*, bidder:profiles!bids_bidder_id_fkey(full_name, avatar_url)")
      .eq("job_id", id)
      .order("created_at", { ascending: false });
    setBids(data || []);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    loadJob();
    loadBids();
  }, [id, loadJob, loadBids]);

  // Realtime bid updates
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`job-updates-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "jobs", filter: `id=eq.${id}` },
        () => { loadJob(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "bids", filter: `job_id=eq.${id}` },
        () => { loadBids(); loadJob(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, loadBids, loadJob]);

  // 5-minute payment countdown & Auto-rejection
  useEffect(() => {
    if (!paymentDue || job?.status !== 'payment_pending') return;
    const interval = setInterval(async () => {
      const diff = new Date(paymentDue).getTime() - Date.now();
      if (diff <= 0) { 
        setTimeLeft("0:00"); 
        clearInterval(interval);
        // Auto-reject
        await cancelJobForNonPayment(job.id);
        loadJob();
        return; 
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentDue, job?.status, job?.id, cancelJobForNonPayment, loadJob]);

  const isMyJob = job?.poster_id === user?.id;
  const maxBidAmount = 100;
  const myBid = bids.find(b => b.bidder_id === user?.id);
  const acceptedBid = bids.find(b => b.status === "accepted");

  const handleAcceptToView = () => {
    setHasAccepted(true);
    toast.success("You can now view full details and place a bid.");
  };

  const handlePlaceBid = async () => {
    const amount = Number(bidAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid bid amount"); return; }
    if (amount > maxBidAmount) { toast.error(`Max bid is ₹${maxBidAmount}`); return; }
    if (!bidMessage.trim()) { toast.error("Add a message with your bid"); return; }
    
    const { profile } = useApp();
    if (!profile?.id) { 
      toast.error("Your profile is still syncing with the database. Please wait a moment or refresh."); 
      return; 
    }

    setSubmittingBid(true);
    try {
      const result = await placeBid({
        job_id: id!,
        bidder_id: profile.id,
        amount,
        message: bidMessage.trim(),
        delivery_days: Number(deliveryDays) || 3,
        status: "pending",
      });

      if (result) {
        sendBidNotification(job?.title || "Job", amount, user?.email || "Worker");
        setBidAmount(""); setBidMessage(""); setDeliveryDays("3");
        setSubmittingBid(false);
        setBidSubmitted(true);
        toast.success("Bid placed! The poster has been notified.");
        loadBids();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setBidSubmitted(false), 5000);
      } else {
        setSubmittingBid(false);
      }
    } catch (err) {
      console.error("handlePlaceBid Error:", err);
      setSubmittingBid(false);
    }
  };

  const handleAcceptBid = async (bid: any) => {
    const paymentDueAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    // Update bid status
    await supabase.from("bids").update({ status: "accepted" }).eq("id", bid.id);
    // Update job with worker and payment deadline
    await supabase.from("jobs").update({
      worker_id: bid.bidder_id,
      status: "payment_pending", // Use payment_pending first
      payment_due_at: paymentDueAt,
      accepted_bid_id: bid.id,
    } as any).eq("id", id!);

    setPaymentDue(paymentDueAt);
    sendPaymentRequiredNotification(job?.title || "Job", bid.amount);
    toast.success("Bid accepted! Pay within 5 minutes to confirm.");
    loadJob(); loadBids();
  };

  const handleRejectBid = async (bid: any) => {
    await supabase.from("bids").update({ status: "rejected" }).eq("id", bid.id);
    sendBidRejectedNotification(job?.title || "Job", bid.amount);
    toast.success("Bid rejected. Worker has been notified.");
    loadBids();
  };

  const handlePayment = async (bid: any) => {
    openRazorpayCheckout(
      bid.amount,
      job?.title || "Job",
      null,
      async () => {
        // Create escrow
        const platformFee = Math.round(bid.amount * 0.30);
        const workerAmount = bid.amount - platformFee;
        await supabase.from("escrow_transactions").insert({
          job_id: id!,
          poster_id: user!.id,
          worker_id: bid.bidder_id,
          total_amount: bid.amount,
          platform_fee: platformFee,
          worker_amount: workerAmount,
          status: "held",
        });
        await supabase.from("jobs").update({ status: "accepted", instructions_locked: false } as any).eq("id", id!);
        await supabase.from("admin_ledger").insert({
          job_id: id!,
          type: "fee_collected",
          amount: platformFee,
          from_user_id: user!.id,
          note: `30% platform fee for: ${job?.title}`,
        } as any);
        toast.success(`Payment confirmed! Job is now in progress.`);
        setPaymentDue(null);
        loadJob();
      },
      () => toast.error("Payment failed or cancelled.")
    );
  };

  const handleDirectAccept = async () => {
    if (!user?.id) { toast.error("Please sign in to accept jobs"); return; }
    
    setSubmittingBid(true);
    const result = await acceptJob(id!, user.id);
    if (result) {
      toast.success("Job accepted directly! Please pay within 5 minutes to confirm.");
      loadJob();
    }
    setSubmittingBid(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Job not found</h1>
          <Link to="/jobs"><Button variant="hero" className="mt-4">Browse Jobs</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/jobs" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Left ── */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              <div className="flex gap-2 mb-3 flex-wrap">
                <Badge variant="category">{job.category}</Badge>
                {job.status === "open" && <Badge variant="outline">Open for Bids</Badge>}
                {job.status === "accepted" && <Badge className="bg-amber-500">Awaiting Payment {timeLeft && `(${timeLeft})`}</Badge>}
                {job.status === "in_progress" && <Badge className="bg-green-500">In Progress</Badge>}
                {job.status === "submitted" && <Badge className="bg-blue-500">Work Submitted</Badge>}
                {job.status === "completed" && <Badge className="bg-primary">Completed</Badge>}
              </div>

              <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">{job.title}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />
                  Due {job.deadline ? new Date(job.deadline).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" }) : "—"}
                </span>
                <span className="flex items-center gap-1"><IndianRupee className="h-4 w-4" />Budget: ₹{job.budget}</span>
              </div>

              <div className="mt-6">
                <h2 className="mb-2 font-display text-lg font-semibold">Description</h2>
                <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">{job.description}</p>
              </div>

              {job.skills?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
              )}

              {/* Accept to view (worker) */}
              {!isMyJob && !hasAccepted && job.status === "open" && !myBid && (
                <div className="mt-8 p-6 border-2 border-dashed border-primary/30 rounded-2xl text-center space-y-3 bg-primary/5">
                  <Info className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-bold text-foreground">Accept to View Full Details & Bid</h3>
                  <p className="text-sm text-muted-foreground">Click below to unlock the full job instructions and place your bid.</p>
                  <Button variant="hero" onClick={handleAcceptToView}>Accept & View Job</Button>
                </div>
              )}

              {/* Poster Action Banner (Payment Pending) */}
              {isMyJob && job.status === "payment_pending" && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 bg-primary/10 border-2 border-primary/30 rounded-3xl space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0">
                      <IndianRupee className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground">Worker Accepted! Secure the Funds</h3>
                      <p className="text-sm text-muted-foreground">A worker has claimed this job. Please deposit the budget into escrow within {timeLeft || '5 minutes'} to start the project. Funds are only released when you approve the work.</p>
                    </div>
                  </div>
                  <Button variant="hero" className="w-full h-12 text-lg shadow-lg shadow-primary/20" onClick={() => handlePayment({ amount: job.budget, bidder_id: job.worker_id })}>
                    Pay ₹{job.budget} & Start Project
                  </Button>
                </motion.div>
              )}

              {/* Files & Brief Preview */}
              <div className="mt-8">
                <h2 className="mb-4 font-display text-lg font-bold flex items-center gap-2">
                  <FileUp className="h-5 w-5 text-primary" /> Project Files & Brief
                </h2>
                {job.files && job.files.length > 0 ? (
                  <div className="grid gap-3">
                    {job.files.map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border group">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <FileUp className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{file.file_name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{file.file_type.split('/')[1] || 'file'}</p>
                          </div>
                        </div>
                        {isMyJob || (myBid?.status === 'accepted' && job.status !== 'open') ? (
                          <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10" asChild>
                            <a href={`${supabase.storage.from('job-files').getPublicUrl(file.file_url).data.publicUrl}`} download={file.file_name}>
                              Download
                            </a>
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-[10px] opacity-60">
                            <Lock className="h-3 w-3 mr-1" /> Locked
                          </Badge>
                        )}
                        {job.status === "payment_pending" && (
                          <Badge variant="warning" className="animate-pulse bg-orange-500 hover:bg-orange-600">
                            <Clock className="mr-1 h-3 w-3" /> 
                            Action Required: Payment Pending {timeLeft ? `(${timeLeft})` : ''}
                          </Badge>
                        )}
                        {job.status === "rejected" && (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" /> Rejected (Payment Missed)
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No files attached to this job.</p>
                )}
              </div>

              {/* Instructions (after accepting) */}
              {(hasAccepted || isMyJob || myBid) && job.instructions && (
                <div className="mt-6 p-4 bg-muted/30 rounded-xl border">
                  <h2 className="mb-2 font-display text-base font-semibold">Instructions</h2>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.instructions}</p>
                </div>
              )}

              {/* Bid Success Message */}
              <AnimatePresence>
                {bidSubmitted && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mt-8">
                    <Card className="border-green-300 bg-green-50 shadow-lg">
                      <CardContent className="p-6 text-center space-y-3">
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-display font-bold text-green-800 text-lg">Bid Submitted Successfully!</h3>
                        <p className="text-sm text-green-700">The project poster has been notified. You'll receive a notification if your bid is accepted.</p>
                        <Button variant="outline" size="sm" onClick={() => setBidSubmitted(false)}>Dismiss</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions: Direct Accept OR Bid */}
              {!isMyJob && job.status === "open" && !myBid && !bidSubmitted && user?.id && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
                  {/* Direct Accept Option */}
                  <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                      <h3 className="font-bold text-foreground">Skip Bidding?</h3>
                      <p className="text-sm text-muted-foreground">Accept this job immediately for the full budget of ₹{job.budget}.</p>
                    </div>
                    <Button variant="hero" className="shrink-0" onClick={handleDirectAccept} disabled={submittingBid}>
                      Accept Directly for ₹{job.budget}
                    </Button>
                  </div>

                  <div className="relative py-4 flex items-center">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Or Place a custom bid</span>
                    <div className="flex-grow border-t border-muted"></div>
                  </div>

                  {/* Bid form */}
                  <Card className="border-primary/20 shadow-card">
                    <CardContent className="p-6 space-y-4">
                      <h2 className="font-display text-lg font-bold flex items-center gap-2">
                        <Send className="h-5 w-5 text-primary" /> Place Your Bid
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Budget: <span className="font-bold text-foreground">₹{job.budget}</span> · Max bid: <span className="font-bold text-foreground">₹{maxBidAmount}</span>
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium mb-1 block">Your Bid (₹) *</label>
                          <Input type="number" placeholder={`Up to ₹${maxBidAmount}`} value={bidAmount} min={1} max={maxBidAmount}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              if (v > maxBidAmount) { toast.error(`Max bid is ₹${maxBidAmount}`); setBidAmount(String(maxBidAmount)); }
                              else setBidAmount(e.target.value);
                            }} />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Delivery Days *</label>
                          <Input type="number" placeholder="e.g. 3" value={deliveryDays} min={1} onChange={(e) => setDeliveryDays(e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">Message to Poster *</label>
                        <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="Describe your approach and experience..." value={bidMessage} onChange={(e) => setBidMessage(e.target.value)} />
                      </div>
                      <Button variant="hero" className="w-full gap-2" onClick={handlePlaceBid} disabled={submittingBid}>
                        {submittingBid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Submit Bid
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* My bid status */}
              {!isMyJob && myBid && (
                <div className={`mt-6 p-4 rounded-xl border ${myBid.status === "accepted" ? "bg-green-50 border-green-200" : myBid.status === "rejected" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                  <div className="flex items-center gap-2">
                    {myBid.status === "accepted" && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {myBid.status === "rejected" && <XCircle className="h-5 w-5 text-red-600" />}
                    {myBid.status === "pending" && <Clock className="h-5 w-5 text-amber-600" />}
                    <div>
                      <p className="font-bold text-sm">
                        {myBid.status === "accepted" && "Your bid was accepted! Waiting for payment."}
                        {myBid.status === "rejected" && "Your bid was rejected."}
                        {myBid.status === "pending" && "Bid submitted — waiting for poster response"}
                      </p>
                      <p className="text-xs text-muted-foreground">Bid: ₹{myBid.amount} · {myBid.delivery_days} days</p>
                    </div>
                  </div>
                  {myBid.status === "rejected" && (
                    <p className="text-xs text-red-600 mt-2">The poster rejected your bid. Browse other jobs.</p>
                  )}
                </div>
              )}

              {/* Bids list (poster) */}
              {isMyJob && (
                <div className="mt-8 space-y-4">
                  <h2 className="font-display text-lg font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" /> Bids Received ({bids.length})
                  </h2>
                  {bids.length === 0 ? (
                    <div className="p-6 border border-dashed rounded-xl text-center text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No bids yet.</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {bids.map((bid, i) => (
                        <motion.div key={bid.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <Card className={`border ${bid.status === "accepted" ? "border-green-300 bg-green-50" : bid.status === "rejected" ? "border-red-200 bg-red-50/30 opacity-60" : "border-primary/20"}`}>
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                                    {bid.bidder?.full_name?.charAt(0)?.toUpperCase() || "W"}
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm">{bid.bidder?.full_name || "Worker"}</p>
                                    <p className="text-[10px] text-muted-foreground">Delivery: {bid.delivery_days} days</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-lg">₹{bid.amount}</p>
                                  <Badge variant="outline" className={`text-[9px] ${bid.status === "accepted" ? "bg-green-100 text-green-700 border-green-300" : bid.status === "rejected" ? "bg-red-100 text-red-700 border-red-300" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                    {bid.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">{bid.message}</p>

                              {bid.status === "pending" && !acceptedBid && (
                                <div className="flex gap-2 pt-1">
                                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1" onClick={() => handleAcceptBid(bid)}>
                                    <CheckCircle className="h-3.5 w-3.5" /> Accept Bid
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1 text-destructive border-destructive/30 gap-1" onClick={() => handleRejectBid(bid)}>
                                    <XCircle className="h-3.5 w-3.5" /> Reject
                                  </Button>
                                </div>
                              )}

                              {bid.status === "accepted" && paymentDue && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <span className="text-xs font-bold text-amber-700">Pay within:</span>
                                    <span className="text-lg font-black text-amber-800">{timeLeft}</span>
                                  </div>
                                  <Button variant="hero" className="w-full gap-2 bg-amber-600 hover:bg-amber-700" onClick={() => handlePayment(bid)}>
                                    <IndianRupee className="h-4 w-4" /> Pay ₹{bid.amount} Now
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              )}

              {/* Approve/Decline work */}
              {isMyJob && job.status === "submitted" && (
                <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-4">
                  <h3 className="font-display font-bold text-lg">Review Work Submission</h3>
                  <div className="flex gap-3">
                    <Button variant="hero" onClick={() => releaseEscrow(job.id, user?.id || "")}>Approve & Release Payment</Button>
                    <Button variant="outline" className="text-destructive" onClick={() => declineWork(job.id, "Work did not meet requirements")}>Decline Work</Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-6">
            <Card className="shadow-card overflow-hidden border-primary/10">
              <CardContent className="p-0">
                <div className="p-8 text-center text-white bg-gradient-to-br from-primary to-primary/80">
                  <p className="text-xs uppercase font-black tracking-widest opacity-60 mb-1">Project Budget</p>
                  <div className="font-display text-4xl font-black">₹{job.budget}</div>
                  <p className="text-xs opacity-70 mt-1">Max bid: ₹100</p>
                </div>
                <div className="p-6 space-y-4">
                  {isMyJob && paymentDue && acceptedBid && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Pay Within</p>
                      <p className="text-3xl font-display font-black text-amber-800">{timeLeft}</p>
                    </div>
                  )}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-sm shrink-0">
                        {(job.poster?.full_name || "U").substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Posted By</p>
                        <p className="font-bold text-sm">{job.poster?.full_name || "Anonymous"}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Star className="h-2.5 w-2.5 fill-accent text-accent" /> 4.5 rating
                        </div>
                      </div>
                    </div>
                  </div>
                  {isMyJob && (
                    <div className="flex items-center justify-between text-sm border-t pt-3">
                      <span className="text-muted-foreground">Total Bids</span>
                      <span className="font-bold">{bids.length}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {!isMyJob && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                    <AlertTriangle className="h-4 w-4" /> Bidding Rules
                  </div>
                  <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                    <li>Max bid: ₹100 only</li>
                    <li>One bid per job</li>
                    <li>Poster must pay within 10 mins of accepting</li>
                    <li>You'll be notified if bid is rejected</li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;

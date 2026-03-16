import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Clock, Users, ArrowLeft, Send, CheckCircle, XCircle, Info, Zap, AlertTriangle, BookOpen, FileText, Download, Lock, Timer, Upload } from "lucide-react";
import { mockBids, AttachedFile } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PaymentTimer = ({ deadline }: { deadline: number }) => {
  const [remaining, setRemaining] = useState(deadline - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const r = deadline - Date.now();
      setRemaining(r > 0 ? r : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isUrgent = remaining < 30000;

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border-2 ${isUrgent ? 'border-red-500 bg-red-50 animate-pulse' : 'border-amber-400 bg-amber-50'}`}>
      <Timer className={`h-5 w-5 ${isUrgent ? 'text-red-600' : 'text-amber-600'}`} />
      <div>
        <p className={`text-sm font-bold ${isUrgent ? 'text-red-700' : 'text-amber-700'}`}>
          Payment Required: {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
        <p className="text-xs text-muted-foreground">
          {isUrgent ? 'Hurry! Project will be auto-deleted!' : 'Complete payment to Admin before timeout'}
        </p>
      </div>
    </div>
  );
};

const WatermarkedImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <div className="relative group overflow-hidden rounded-lg border bg-muted">
      <img src={src} alt={alt} className="w-full h-auto max-h-[400px] object-contain" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 select-none overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-3 gap-8 rotate-[-30deg]">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="text-4xl font-display font-black whitespace-nowrap text-foreground opacity-50 uppercase tracking-tighter">
              TASKLY PROTECT
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
        <Lock className="h-3 w-3" /> Protected Preview
      </div>
    </div>
  );
};

const JobDetail = () => {
  const { id } = useParams();
  const { jobs, myPostedJobs, currentUser, deleteJob, acceptJob, completePayment, submitWork, getPaymentTimeRemaining } = useApp();
  const allJobs = [...myPostedJobs, ...jobs];
  const job = allJobs.find((j) => j.id === id);
  const isMyJob = myPostedJobs.some((j) => j.id === id);
  
  // File submission
  const submitFileRef = useRef<HTMLInputElement>(null);
  const [submittingWork, setSubmittingWork] = useState(false);

  const handlePlaceBid = () => {
    // This function is not used in the provided snippet, but keeping it for context
    // if (!bidAmount || !bidMessage.trim()) {
    //   toast.error("Please enter an amount and message");
    //   return;
    // }
    // if (!id) return;
    // placeBid(id, Number(bidAmount), bidMessage.trim(), Number(bidDays) || 3);
    // setBidAmount("");
    // setBidMessage("");
    // setBidDays("");
  };

  const handleSubmitWork = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !id) return;
    setSubmittingWork(true);
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const attachedFile: AttachedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
      };
      submitWork(id, attachedFile);
      setSubmittingWork(false);
    };
    reader.readAsDataURL(file);
  };

  const isAcceptedWorker = job?.acceptedBidderName === currentUser.name;
  const canAccessInstructions = isAcceptedWorker && job?.filesUnlocked;

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Job not found</h1>
          <Link to="/jobs">
            <Button variant="hero" className="mt-4">Browse Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Link to="/jobs" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex gap-2 mb-3 items-center flex-wrap">
                <Badge variant="category">{job.category}</Badge>
                {job.status === "payment_pending" && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 animate-pulse">⏳ Escrow Pending</Badge>
                )}
                {job.status === "in_progress" && (
                  <Badge className="bg-blue-500 hover:bg-blue-600">🔨 In Progress</Badge>
                )}
                {job.status === "completed" && (
                  <Badge className="bg-green-500 hover:bg-green-600">✅ Completed</Badge>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">{job.title}</h1>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Due {new Date(job.deadline).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="mb-2 font-display text-lg font-semibold text-foreground">Description</h2>
                <p className="leading-relaxed text-muted-foreground">{job.description}</p>
              </div>

              <div className="mt-6">
                <h2 className="mb-2 font-display text-lg font-semibold text-foreground">Skills Required</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              {/* Task Instructions Section */}
              <div className="mt-8 border-t pt-8">
                <h2 className="mb-4 font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Task Instructions & Files
                </h2>
                
                {canAccessInstructions ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-primary/5 text-sm leading-relaxed mb-4">
                      {job.instructions || "No specific text instructions provided. Please use the files below."}
                    </div>
                    {job.attachedFiles && job.attachedFiles.length > 0 && (
                      <div className="space-y-2">
                        {job.attachedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-green-50 border-green-200">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 text-green-600 shrink-0" />
                              <span className="truncate text-sm font-medium">{file.name}</span>
                              <span className="text-xs text-muted-foreground shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <a href={file.dataUrl} download={file.name}>
                              <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-300 hover:bg-green-100">
                                <Download className="h-3 w-3" /> Download
                              </Button>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed bg-muted/50 text-center">
                    <div className="mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-1">Instructions Locked</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-4">
                      {isAcceptedWorker 
                        ? "Waiting for the client to complete payment to Admin to unlock instructions and files."
                        : "Accept this job and wait for client payment to unlock specific task instructions and files."}
                    </p>
                    {!isAcceptedWorker && !isMyJob && job.status === "open" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="hero" className="gap-2">
                            <Zap className="h-4 w-4" /> Accept Job to Unlock
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you ready to take this task?</AlertDialogTitle>
                            <AlertDialogDescription>
                              By accepting, you commit to completing this task by the deadline. 
                              The instructions will unlock as soon as you accept, and the escrow payment will be secured.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => acceptJob(job.id)}>
                              Accept & Start Now
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )}
              </div>

              {/* Submitted Work with Watermark for Poster */}
              {job.submittedWork && (
                <div className="mt-8 border-t pt-8">
                  <h2 className="mb-4 font-display text-lg font-semibold text-foreground flex items-center gap-2">
                    📦 Submitted Work
                  </h2>
                  
                  {isMyJob ? (
                    <div className="space-y-4">
                      {job.submittedWork.type.startsWith("image/") ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                            <Info className="h-4 w-4" /> Protected Preview (Watermarked)
                          </p>
                          <WatermarkedImage 
                            src={job.submittedWork.dataUrl} 
                            alt="Submitted Work Preview" 
                          />
                          <p className="text-xs text-muted-foreground">
                            High-quality, clean version will be sent to your email after you **Release Funds** to the worker.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg border bg-muted text-center italic text-muted-foreground flex flex-col items-center gap-2">
                          <Lock className="h-6 w-6" />
                          <p>Original file locked until escrow release.</p>
                          <p className="text-xs not-italic">Release funds in the Admin Panel to receive the final file.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50 border-blue-200">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="truncate text-sm font-medium">{job.submittedWork.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">({(job.submittedWork.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <div className="text-xs font-semibold text-blue-700 bg-blue-100/50 px-2 py-1 rounded">
                        Submitted ✅
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Work Section - for accepted worker */}
              {isAcceptedWorker && job.status === "in_progress" && canAccessInstructions && !job.submittedWork && (
                <div className="mt-8 p-6 rounded-xl border-2 border-primary/30 bg-primary/5">
                  <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Submit Your Work
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your completed file. For images, a large watermark will be added automatically to protect your work until payment release.
                  </p>
                  <Button 
                    variant="hero" 
                    className="w-full gap-2 py-6 text-lg" 
                    onClick={() => submitFileRef.current?.click()}
                    disabled={submittingWork}
                  >
                    <Upload className="h-5 w-5" />
                    {submittingWork ? "Uploading..." : "Click to Upload & Submit"}
                  </Button>
                  <input
                    ref={submitFileRef}
                    type="file"
                    className="hidden"
                    onChange={handleSubmitWork}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip,.rar,.psd,.ai,.fig"
                  />
                </div>
              )}

              {job.isTeamTask && job.teamRoles && job.teamRoles.length > 0 && (
                <div className="mt-6">
                  <h2 className="mb-2 font-display text-lg font-semibold text-foreground">Team Roles Needed</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.teamRoles.map((role) => (
                      <Badge key={role} variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                        <Users className="w-3 h-3 mr-1" /> {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </div>

          <div className="space-y-6">
            <Card className="shadow-card overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 text-center text-white bg-primary">
                  <div className="font-display text-3xl font-bold">₹{job.budget}</div>
                  <p className="text-sm opacity-90">Budget</p>
                </div>

                <div className="p-6">
                  <div className="mb-6 flex flex-col gap-2">
                    {job.isUrgent && (
                      <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-2 rounded text-sm font-medium">
                        <AlertTriangle className="w-4 h-4" /> Urgent Task
                      </div>
                    )}
                    {job.isQuickTask && (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded text-sm font-medium">
                        <Zap className="w-4 h-4" /> 10 Minute Quick Task
                      </div>
                    )}
                    {job.isMentoring && (
                      <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded text-sm font-medium">
                        <BookOpen className="w-4 h-4" /> Mentoring Session
                      </div>
                    )}
                    {job.campusOnly && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded text-sm font-medium">
                        🎓 Campus Exclusive ({job.campusName})
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="mb-4 flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                      {job.postedBy.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{job.postedBy.name}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        {job.postedBy.rating} rating
                      </div>
                    </div>
                  </div>

                  {/* Payment Timer */}
                  {job.status === "payment_pending" && job.paymentDeadline && (
                    <div className="mb-4">
                      <PaymentTimer deadline={job.paymentDeadline} />
                    </div>
                  )}

                  {/* Platform fee notice */}
                  <div className="mb-4 rounded-lg border border-accent/30 bg-accent/5 p-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Platform Fee:</span> Only <span className="font-bold text-primary">90%</span> of the bid amount will be received by the freelancer. 10% goes to the platform as service fee.
                      </p>
                    </div>
                  </div>

                  {/* Info badges/notices for accepted worker */}
                  {isAcceptedWorker && job.status === "in_progress" && (
                    <div className="rounded-lg bg-green-50 border-green-200 p-3">
                      <p className="text-sm font-bold text-green-700">💰 Payment Secured!</p>
                      <p className="text-xs text-green-600 mt-1">Submit your work using the form on the left.</p>
                    </div>
                  )}

                  {/* Job poster controls */}
                  {isMyJob && (
                    <div className="space-y-4 mt-4">
                      {job.status === "open" && (
                        <div className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
                          This is your job. Once a worker accepts it, the escrow payment will be secured automatically.
                        </div>
                      )}
                      {job.status === "in_progress" && (
                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-center">
                          <p className="text-sm font-medium text-blue-700">🔨 In Progress</p>
                          <p className="text-xs text-blue-600 mt-1">Escrow funds (₹{job.budget}) are currently being held by Taskly Protect.</p>
                        </div>
                      )}
                      {job.status === "completed" && (
                        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                          <p className="text-sm font-medium text-green-700">✅ Project Completed!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;

import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, Clock, Loader2, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
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
import { useChat } from "@/hooks/useChat";
import { useEffect } from "react";
import UnreadBadge from "@/components/UnreadBadge";

const statusConfig = {
  open: { label: "Open", variant: "default" as const, icon: Clock },
  payment_pending: { label: "Escrow Pending", variant: "warning" as const, icon: Clock },
  in_progress: { label: "In Progress", variant: "hero" as const, icon: Loader2 },
  completed: { label: "Completed", variant: "outline" as const, icon: CheckCircle },
  submitted: { label: "Submitted", variant: "secondary" as const, icon: Clock },
};

const MyJobs = () => {
  const { myPostedJobs, deleteJob, profile } = useApp();
  const { subscribeToAllMessages } = useChat();
  const [filter, setFilter] = useState<"all" | "open" | "payment_pending" | "in_progress" | "completed" | "submitted">("all");
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});

  const fetchUnreadCounts = async () => {
    if (!profile?.id || myPostedJobs.length === 0) return;
    
    const counts: { [key: string]: number } = {};
    for (const job of myPostedJobs) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', job.id)
        .neq('sender_id', profile.id)
        .eq('is_read', false);
      
      counts[job.id] = count || 0;
    }
    setUnreadCounts(counts);
  };

  useEffect(() => {
    fetchUnreadCounts();
    const unsubscribe = subscribeToAllMessages(() => {
        fetchUnreadCounts();
    });
    return () => unsubscribe();
  }, [profile?.id, myPostedJobs.length, subscribeToAllMessages]);

  const filtered = filter === "all" ? myPostedJobs : myPostedJobs.filter((j) => j.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Posted Jobs</h1>
          <p className="text-muted-foreground">{myPostedJobs.length} total jobs</p>
        </div>
        <Link to="/post-job">
          <Button variant="hero" size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" /> Post Job
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "open", "payment_pending", "in_progress", "submitted", "completed"] as const).map((f) => (
          <Badge
            key={f}
            variant={filter === f ? "default" : "category"}
            className="cursor-pointer capitalize"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f.replace("_", " ")}
          </Badge>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p>No jobs found.</p>
          <Link to="/post-job">
            <Button variant="hero" className="mt-4">Post Your First Job</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job, i) => {
            const sc = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.open;
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="shadow-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={sc.variant as any} className="shrink-0">
                            <sc.icon className="mr-1 h-3 w-3" />
                            {sc.label}
                          </Badge>
                          <Badge variant="category" className="shrink-0">{job.category}</Badge>
                        </div>
                        <Link to={`/jobs/${job.id}`}>
                          <h3 className="font-display font-semibold text-foreground hover:text-primary transition-colors truncate">
                            {job.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="font-display font-bold text-primary text-sm">₹{job.budget}</span>
                          <span>Due {new Date(job.deadline).toLocaleDateString()}</span>
                          {unreadCounts[job.id] > 0 && (
                            <div className="flex items-center gap-1.5 bg-red-50 px-2 py-0.5 rounded border border-red-100 animate-pulse">
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                <span className="text-[10px] font-bold text-red-600 uppercase">New Message</span>
                                <UnreadBadge count={unreadCounts[job.id]} className="scale-75 origin-left" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link to={`/jobs/${job.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this job?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete "{job.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteJob(job.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyJobs;

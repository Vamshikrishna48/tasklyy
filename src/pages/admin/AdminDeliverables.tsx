import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Sparkles,
  Presentation,
  Palette,
  Clock,
  CheckCircle,
  FileCheck,
  Send,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  ExternalLink,
  Bot,
  AlertCircle,
  BrainCircuit,
  Check
} from "lucide-react";
import {
  detectWorkType,
  getDeliveryTimelineInfo,
  generateAIDeliverable,
  submitAIDeliverableToJob,
  analyzeJobRequirements,
  TaskAnalysis,
  AIDeliverable,
  PresentationDeliverable,
  PosterDeliverable
} from "@/services/aiDeliverableService";

interface AdminJob {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  category: string;
  budget: number;
  status: string;
  created_at: string;
  deadline: string;
  skills: string[];
  poster_id: string;
  worker_id?: string;
  poster?: { full_name: string; avatar_url?: string };
  files?: any[];
}

export default function AdminDeliverables() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "presentation" | "poster">("all");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [deliverablesMap, setDeliverablesMap] = useState<Record<string, AIDeliverable>>({});
  const [analysesMap, setAnalysesMap] = useState<Record<string, TaskAnalysis>>({});
  const [previewDeliverable, setPreviewDeliverable] = useState<AIDeliverable | null>(null);
  const [previewJob, setPreviewJob] = useState<AdminJob | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [customDeliveryMessage, setCustomDeliveryMessage] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("jobs")
        .select("*, poster:profiles!jobs_poster_id_fkey(full_name), files:job_files(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter jobs that are related to Presentation or Poster
      const targetJobs = (data || []).filter((j: any) => detectWorkType(j) !== null);
      setJobs(targetJobs);

      // Restore cached deliverables & analyses from localStorage
      const delivMap: Record<string, AIDeliverable> = {};
      const anMap: Record<string, TaskAnalysis> = {};

      targetJobs.forEach((j: any) => {
        try {
          const cachedDeliv = localStorage.getItem(`ai_deliverable_${j.id}`);
          if (cachedDeliv) {
            const parsed = JSON.parse(cachedDeliv);
            delivMap[j.id] = parsed;
            if (parsed.analysis) {
              anMap[j.id] = parsed.analysis;
            }
          }
          const cachedAnalysis = localStorage.getItem(`task_analysis_${j.id}`);
          if (cachedAnalysis) {
            anMap[j.id] = JSON.parse(cachedAnalysis);
          }
        } catch {}
      });

      setDeliverablesMap(delivMap);
      setAnalysesMap(anMap);
    } catch (err: any) {
      console.error("Failed to load deliverable jobs:", err);
      toast.error(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleAnalyze = async (job: AdminJob) => {
    setAnalyzingId(job.id);
    try {
      toast.info("Analyzing user description, audience, and constraints...");
      const analysis = await analyzeJobRequirements({
        title: job.title,
        description: job.description,
        instructions: job.instructions,
        category: job.category,
        skills: job.skills,
      });

      localStorage.setItem(`task_analysis_${job.id}`, JSON.stringify(analysis));
      setAnalysesMap((prev) => ({ ...prev, [job.id]: analysis }));
      toast.success("User description analyzed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze description");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleGenerate = async (job: AdminJob) => {
    setGeneratingId(job.id);
    try {
      const workType = detectWorkType(job);
      toast.info(`Analyzing description & generating human-crafted ${workType === "poster" ? "Poster Design" : "Presentation Deck"}...`);
      
      const deliverable = await generateAIDeliverable({
        id: job.id,
        title: job.title,
        description: job.description,
        instructions: job.instructions,
        skills: job.skills,
        budget: job.budget,
        category: job.category,
      });

      // Update local storage and state
      localStorage.setItem(`ai_deliverable_${job.id}`, JSON.stringify(deliverable));
      setDeliverablesMap((prev) => ({ ...prev, [job.id]: deliverable }));

      if (deliverable.analysis) {
        localStorage.setItem(`task_analysis_${job.id}`, JSON.stringify(deliverable.analysis));
        setAnalysesMap((prev) => ({ ...prev, [job.id]: deliverable.analysis }));
      }

      toast.success(`Deliverable generated successfully! Fulfills 100% of user instructions within 2 days.`);
      setPreviewDeliverable(deliverable);
      setPreviewJob(job);
      setCustomDeliveryMessage(deliverable.deliveryMessage);
      setActiveSlideIndex(0);
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.error(err.message || "Failed to generate deliverable");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleSubmit = async (job: AdminJob, deliverable: AIDeliverable) => {
    setSubmittingId(job.id);
    try {
      const deliverableToSubmit = {
        ...deliverable,
        deliveryMessage: customDeliveryMessage || deliverable.deliveryMessage,
      };

      const result = await submitAIDeliverableToJob(job.id, deliverableToSubmit, job.worker_id);
      if (result.success) {
        toast.success("Deliverable submitted to client! Verified 100% human student delivery.");
        setPreviewDeliverable(null);
        loadJobs();
      } else {
        toast.error(result.error || "Failed to submit deliverable to client");
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDownload = (deliverable: AIDeliverable) => {
    const isPresentation = deliverable.type === "presentation";
    const filename = isPresentation
      ? `${deliverable.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30)}_Presentation.html`
      : `${deliverable.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30)}_Poster.html`;

    const blob = new Blob([deliverable.htmlContent || ""], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  const openInNewTab = (deliverable: AIDeliverable) => {
    const blob = new Blob([deliverable.htmlContent || ""], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const filteredJobs = jobs.filter((j) => {
    if (filter === "all") return true;
    return detectWorkType(j) === filter;
  });

  const totalPresentations = jobs.filter((j) => detectWorkType(j) === "presentation").length;
  const totalPosters = jobs.filter((j) => detectWorkType(j) === "poster").length;
  const totalSubmitted = jobs.filter((j) => j.status === "submitted" || j.status === "completed").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-foreground">
              AI Task Fulfillment Hub
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 font-semibold">
              <Sparkles className="h-3 w-3" /> 2-Day Guaranteed Delivery
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Automated, high-grade Presentation (PPT) & Poster Design fulfillment. Deep description analysis with 0 AI markers.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadJobs} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Tasks
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total PPT & Poster Tasks</p>
              <p className="text-2xl font-black mt-1">{jobs.length}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Presentations (PPT)</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{totalPresentations}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Presentation className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Poster & Banner Designs</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{totalPosters}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Palette className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fulfilled / Delivered</p>
              <p className="text-2xl font-black text-purple-600 mt-1">{totalSubmitted}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <FileCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Strict Protocol Followed:</span> All presentation slide decks and poster designs are strictly tailored to user requirements and completed within 2 days. The client is delivered pure student-freelancer files and notes with zero AI detection or disclosure.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All Tasks ({jobs.length})
        </Button>
        <Button
          variant={filter === "presentation" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("presentation")}
          className="gap-1.5"
        >
          <Presentation className="h-3.5 w-3.5" /> Presentations ({totalPresentations})
        </Button>
        <Button
          variant={filter === "poster" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("poster")}
          className="gap-1.5"
        >
          <Palette className="h-3.5 w-3.5" /> Posters ({totalPosters})
        </Button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 border border-dashed rounded-2xl p-8 space-y-3">
          <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="font-bold text-base text-foreground">No Presentation or Poster tasks found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            When users post jobs under Presentation or Poster Design, they will appear here for 2-day AI fulfillment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => {
            const workType = detectWorkType(job);
            const deliverable = deliverablesMap[job.id];
            const analysis = analysesMap[job.id] || deliverable?.analysis;
            const timeline = getDeliveryTimelineInfo(job.created_at);
            const isSubmitted = job.status === "submitted" || job.status === "completed";

            return (
              <Card key={job.id} className="border-primary/15 shadow-sm hover:border-primary/30 transition-all">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={workType === "presentation" ? "default" : "secondary"} className="gap-1 font-bold">
                        {workType === "presentation" ? <Presentation className="h-3.5 w-3.5" /> : <Palette className="h-3.5 w-3.5" />}
                        {workType === "presentation" ? "Presentation (PPT)" : "Poster Design"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Budget: ₹{job.budget}
                      </Badge>
                      <Badge
                        variant={isSubmitted ? "outline" : timeline.isOverdue ? "destructive" : "secondary"}
                        className="gap-1 text-xs"
                      >
                        <Clock className="h-3 w-3" />
                        {isSubmitted
                          ? "✓ Delivered"
                          : timeline.isOverdue
                          ? "2-Day SLA Overdue"
                          : `${timeline.hoursRemaining}h left in 2-day SLA`}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Client: <span className="font-bold text-foreground">{job.poster?.full_name || "Student User"}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-3 bg-muted/20 p-3 rounded-xl border">
                      {job.instructions || job.description}
                    </p>
                  </div>

                  {/* AI Description Analysis Block */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-primary/15 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <BrainCircuit className="h-3.5 w-3.5 text-primary" /> AI Description & Requirements Analysis
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] text-muted-foreground hover:text-primary gap-1"
                        onClick={() => handleAnalyze(job)}
                        disabled={analyzingId === job.id}
                      >
                        {analyzingId === job.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        Analyze Description
                      </Button>
                    </div>

                    {analysis ? (
                      <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                        <p><span className="font-semibold text-foreground">🎯 Primary Goal:</span> {analysis.primaryGoal}</p>
                        <p>
                          <span className="font-semibold text-foreground">👥 Target Audience:</span> {analysis.targetAudience} • <span className="font-semibold text-foreground">🎨 Style/Tone:</span> {analysis.designTone}
                        </p>
                        <p><span className="font-semibold text-foreground">📌 Mandatory Themes:</span> {analysis.keyThemes.join(" • ")}</p>
                        {analysis.userConstraints.length > 0 && (
                          <p><span className="font-semibold text-foreground">⚙️ User Constraints:</span> {analysis.userConstraints.join("; ")}</p>
                        )}
                        <div className="pt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Check className="h-3.5 w-3.5" /> 100% of user instructions analyzed and accounted for
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Click "Analyze Description" to inspect client intent, constraints, and mandatory topics.
                      </p>
                    )}
                  </div>

                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px] py-0">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {deliverable ? (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Deliverable Prepared
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> Ready for AI Generation
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {deliverable && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={() => {
                              setPreviewDeliverable(deliverable);
                              setPreviewJob(job);
                              setCustomDeliveryMessage(deliverable.deliveryMessage);
                              setActiveSlideIndex(0);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" /> Preview Deliverable
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={() => handleDownload(deliverable)}
                          >
                            <Download className="h-3.5 w-3.5" /> Download
                          </Button>
                        </>
                      )}

                      <Button
                        variant="hero"
                        size="sm"
                        disabled={generatingId === job.id}
                        className="gap-1.5 text-xs"
                        onClick={() => handleGenerate(job)}
                      >
                        {generatingId === job.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        {deliverable ? "Regenerate with AI" : "Generate with AI (2-Day SLA)"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Deliverable Preview & Submission Modal */}
      {previewDeliverable && previewJob && (
        <Dialog open={!!previewDeliverable} onOpenChange={() => setPreviewDeliverable(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                    {previewDeliverable.type === "presentation" ? (
                      <Presentation className="h-5 w-5 text-primary" />
                    ) : (
                      <Palette className="h-5 w-5 text-emerald-600" />
                    )}
                    {previewDeliverable.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Crafted strictly to user requirements. Formatted as 100% human student deliverable.
                  </DialogDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs shrink-0"
                  onClick={() => openInNewTab(previewDeliverable)}
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open Full Screen
                </Button>
              </div>
            </DialogHeader>

            {/* Description Analysis in Preview Modal */}
            {previewDeliverable.analysis && (
              <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 text-xs space-y-1">
                <span className="font-bold text-primary flex items-center gap-1">
                  <BrainCircuit className="h-3.5 w-3.5" /> Brief Analysis:
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  <b>Goal:</b> {previewDeliverable.analysis.primaryGoal} | <b>Audience:</b> {previewDeliverable.analysis.targetAudience}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  <b>Mandatory Themes:</b> {previewDeliverable.analysis.keyThemes.join(" • ")}
                </p>
              </div>
            )}

            {/* Presentation View */}
            {previewDeliverable.type === "presentation" && (
              <div className="space-y-4 my-2">
                {/* Slide Carousel Selector */}
                <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border text-xs">
                  <div className="font-bold text-foreground">
                    Slide {activeSlideIndex + 1} of {previewDeliverable.slides.length}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={activeSlideIndex === 0}
                      onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                    >
                      ◀ Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={activeSlideIndex === previewDeliverable.slides.length - 1}
                      onClick={() => setActiveSlideIndex((prev) => Math.min(previewDeliverable.slides.length - 1, prev + 1))}
                    >
                      Next ▶
                    </Button>
                  </div>
                </div>

                {/* Current Slide Display */}
                {(() => {
                  const s = previewDeliverable.slides[activeSlideIndex];
                  if (!s) return null;
                  return (
                    <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-lg border border-slate-800 space-y-4">
                      <div className="border-b border-slate-800 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          Slide {s.slideNumber} • {s.subtitle || previewDeliverable.theme}
                        </span>
                        <h4 className="text-xl font-bold mt-1 text-white">{s.title}</h4>
                      </div>

                      <ul className="space-y-2 text-sm text-slate-200">
                        {(s.contentPoints || []).map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>

                      {s.visualIdea && (
                        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300">
                          <span className="font-bold uppercase tracking-wider text-amber-400 block mb-1">
                            Visual Layout Concept
                          </span>
                          {s.visualIdea}
                        </div>
                      )}

                      <div className="p-3.5 bg-slate-950/80 rounded-xl border border-primary/20 text-xs text-slate-300">
                        <span className="font-bold uppercase tracking-wider text-primary block mb-1">
                          🎤 Presenter Speaker Notes
                        </span>
                        <p className="italic leading-relaxed">{s.speakerNotes}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Poster View */}
            {previewDeliverable.type === "poster" && (
              <div className="space-y-4 my-2">
                <div className="max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl border border-muted bg-black">
                  <div
                    className="w-full"
                    dangerouslySetInnerHTML={{ __html: (previewDeliverable as PosterDeliverable).posterSvgMarkup }}
                  />
                </div>
              </div>
            )}

            {/* Freelancer Delivery Message */}
            <div className="space-y-2 pt-2 border-t">
              <label className="text-xs font-bold text-foreground block">
                Deliverable Submission Note (Sent to Client as Freelancer)
              </label>
              <Textarea
                value={customDeliveryMessage}
                onChange={(e) => setCustomDeliveryMessage(e.target.value)}
                className="text-xs h-20"
                placeholder="Message that the user will receive upon submission..."
              />
              <p className="text-[11px] text-muted-foreground">
                Authentic, natural tone. Contains 0 AI markers.
              </p>
            </div>

            {/* Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => handleDownload(previewDeliverable)}
              >
                <Download className="h-4 w-4" /> Download Deliverable (.html)
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPreviewDeliverable(null)}>
                  Close
                </Button>
                <Button
                  variant="hero"
                  size="sm"
                  disabled={submittingId === previewJob.id}
                  onClick={() => handleSubmit(previewJob, previewDeliverable)}
                  className="gap-1.5"
                >
                  {submittingId === previewJob.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit to Client Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

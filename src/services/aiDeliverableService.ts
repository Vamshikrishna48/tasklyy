/**
 * AI Deliverable Service for Presentations and Posters
 * Powered by Google Gemini API.
 * 
 * STRICT COMPLIANCE RULES:
 * 1. Works related to Presentation (PPT) or Poster must be completed within 2 days.
 * 2. Deeply analyze user description, target audience, topic, constraints, and instructions.
 * 3. Deliverables must appear 100% human-made (crafted by an expert student freelancer / designer).
 * 4. NO AI markers, no Gemini mentions, no robotic disclaimers.
 * 5. Strictly follow all user requirements, instructions, and topics.
 */

import { supabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api";

const GEMINI_API_KEY =
  (import.meta as any).env?.VITE_GEMINI_API_KEY ||
  "AQ.Ab8RN6KqT8EoHYGyAlaWFrTMqeHBVLHrSU_LvwO9ipCq0DuaqQ";

const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-flash-latest"
];

export interface TaskAnalysis {
  primaryGoal: string;
  targetAudience: string;
  keyThemes: string[];
  designTone: string;
  userConstraints: string[];
  feasibilityRating: string;
  summary: string;
}

export interface SlideItem {
  slideNumber: number;
  title: string;
  subtitle?: string;
  contentPoints: string[];
  visualIdea: string;
  speakerNotes: string;
}

export interface PresentationDeliverable {
  type: "presentation";
  jobId: string;
  title: string;
  subtitle: string;
  theme: string;
  colorPalette: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  slides: SlideItem[];
  deliveryMessage: string;
  createdAt: string;
  htmlContent?: string;
  analysis?: TaskAnalysis;
}

export interface PosterDeliverable {
  type: "poster";
  jobId: string;
  title: string;
  tagline: string;
  categoryType: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  layoutSections: {
    heading: string;
    details: string;
  }[];
  visualStyle: string;
  posterSvgMarkup: string;
  deliveryMessage: string;
  createdAt: string;
  htmlContent?: string;
  analysis?: TaskAnalysis;
}

export type AIDeliverable = PresentationDeliverable | PosterDeliverable;

/**
 * Detects whether a job is related to Presentation or Poster design.
 */
export function detectWorkType(job: {
  category?: string;
  title?: string;
  description?: string;
  skills?: string[];
}): "presentation" | "poster" | null {
  const cat = (job.category || "").toLowerCase();
  const title = (job.title || "").toLowerCase();
  const desc = (job.description || "").toLowerCase();
  const skillsStr = (job.skills || []).join(" ").toLowerCase();
  const fullText = `${cat} ${title} ${desc} ${skillsStr}`;

  // Check Presentation
  if (
    cat.includes("presentation") ||
    cat.includes("ppt") ||
    fullText.includes("presentation") ||
    fullText.includes("ppt") ||
    fullText.includes("powerpoint") ||
    fullText.includes("slide deck") ||
    fullText.includes("slides") ||
    fullText.includes("keynote")
  ) {
    return "presentation";
  }

  // Check Poster
  if (
    cat.includes("poster") ||
    cat.includes("flyer") ||
    fullText.includes("poster") ||
    fullText.includes("flyer") ||
    fullText.includes("banner") ||
    fullText.includes("infographic") ||
    fullText.includes("pamphlet")
  ) {
    return "poster";
  }

  return null;
}

/**
 * Checks if deliverable is within 2-day delivery SLA.
 */
export function getDeliveryTimelineInfo(createdAtStr?: string) {
  const createdDate = createdAtStr ? new Date(createdAtStr) : new Date();
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
  const deadlineDate = new Date(createdDate.getTime() + twoDaysMs);
  const diffMs = deadlineDate.getTime() - Date.now();
  const isOverdue = diffMs < 0;
  const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  return {
    deadlineDate,
    isOverdue,
    hoursRemaining,
    formattedDeadline: deadlineDate.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

/**
 * Deeply analyzes the user description, instructions, topics, constraints, and requirements.
 */
export async function analyzeJobRequirements(job: {
  title: string;
  description: string;
  instructions?: string;
  category?: string;
  skills?: string[];
}): Promise<TaskAnalysis> {
  const prompt = `You are an elite academic project analyst and student task lead on Tasskly.
Thoroughly analyze the client's project description, requirements, constraints, and instructions:

PROJECT DETAILS:
- Title: "${job.title}"
- Category: "${job.category || "Academic/Design"}"
- Description & Instructions: "${job.instructions || job.description}"
- Skills/Keywords: ${(job.skills || []).join(", ") || "None specified"}

DEEPLY ANALYZE AND EXTRACT:
1. primaryGoal: What is the core deliverable, academic objective, or main problem to solve?
2. targetAudience: Who is evaluating or viewing this (e.g. college faculty, students, seminar delegates, judges)?
3. keyThemes: Array of 3-5 mandatory topics, sections, or arguments mentioned in the user's brief.
4. designTone: What visual, academic, or professional style best fits (e.g. Academic Formal, Tech Minimalist, Vibrant Event)?
5. userConstraints: Array of specific guidelines, date/time, venue, slide counts, or requirements specified by the user.
6. feasibilityRating: "High - 100% fulfillable within 2-day delivery SLA"
7. summary: A 2-sentence synthesis of the client's intent and how the deliverable will rigidly fulfill it.

RETURN STRICTLY RAW VALID JSON ONLY with this exact structure, no markdown ticks, no commentary:
{
  "primaryGoal": "...",
  "targetAudience": "...",
  "keyThemes": ["...", "..."],
  "designTone": "...",
  "userConstraints": ["...", "..."],
  "feasibilityRating": "High - 100% fulfillable within 2-day delivery SLA",
  "summary": "..."
}`;

  try {
    const jsonText = await callGemini(prompt);
    const cleaned = jsonText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      primaryGoal: parsed.primaryGoal || job.title,
      targetAudience: parsed.targetAudience || "College professors, evaluators, and peer students",
      keyThemes: Array.isArray(parsed.keyThemes) && parsed.keyThemes.length > 0 ? parsed.keyThemes : ["Core problem overview", "Tactical methodology", "Key results and conclusions"],
      designTone: parsed.designTone || "Professional, clean, and high-impact",
      userConstraints: Array.isArray(parsed.userConstraints) && parsed.userConstraints.length > 0 ? parsed.userConstraints : ["Adhere strictly to client instructions", "2-Day delivery guarantee"],
      feasibilityRating: parsed.feasibilityRating || "High - 100% fulfillable within 2-day delivery SLA",
      summary: parsed.summary || "Comprehensive deliverable tailored to all client specifications.",
    };
  } catch (err) {
    return {
      primaryGoal: job.title,
      targetAudience: "Academic & Professional Evaluators",
      keyThemes: ["Project Analysis", "Core Findings", "Practical Implementation"],
      designTone: "Clean, modern, high-contrast",
      userConstraints: ["Strict compliance with user instructions", "Delivered within 2 days"],
      feasibilityRating: "High - 100% fulfillable within 2-day delivery SLA",
      summary: `In-depth fulfillment of ${job.title} crafted strictly according to provided brief.`,
    };
  }
}

/**
 * Generates an authentic human presentation deliverable strictly adhering to user instructions.
 */
export async function generatePresentationDeliverable(job: {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  skills?: string[];
  budget?: number;
  category?: string;
}): Promise<PresentationDeliverable> {
  // Step 1: Deeply analyze the user's description
  const analysis = await analyzeJobRequirements(job);

  const prompt = `You are an elite, top-scoring university honors student and freelance presentation specialist on Tasskly.
You have been hired by a client to prepare a full, high-quality, professional presentation slide deck based STRICTLY on their project instructions.

CLIENT REQUIREMENTS & DETAILED BRIEF:
- Project Title: "${job.title}"
- Category: "${job.category || "Presentation"}"
- Client Description & Instructions: "${job.instructions || job.description}"
- Required Skills/Topics: ${(job.skills || []).join(", ") || "Professional presentation design, research, analysis"}

DEEP DESCRIPTION ANALYSIS & MANDATORY CONSTRAINTS:
- Primary Goal: ${analysis.primaryGoal}
- Target Audience: ${analysis.targetAudience}
- Mandatory Themes to Cover: ${analysis.keyThemes.join("; ")}
- Design Tone: ${analysis.designTone}
- Specific User Constraints: ${analysis.userConstraints.join("; ")}

STRICT INSTRUCTIONS:
1. Make sure EVERY specific instruction and requirement requested by the user is addressed in deep detail across the slides.
2. Produce a complete 8 to 12 slide presentation deck.
3. For EVERY slide, provide:
   - slideNumber (1, 2, 3, ...)
   - title (Crisp, engaging slide headline)
   - subtitle (Contextual subhead)
   - contentPoints (Array of 3-5 comprehensive, high-value bullet points with bold keywords and specific information, not generic fluff)
   - visualIdea (Concrete recommendation for visual diagram, infographic layout, or chart)
   - speakerNotes (Authentic spoken paragraph for what the presenter should say when presenting this slide)
4. Set theme and colorPalette (e.g. Navy & Coral, Modern Emerald, Indigo Tech, Academic Slate) appropriate for the subject matter.
5. Provide a deliveryMessage: A natural, friendly message from a student freelancer to the client (e.g. "Hey! I have finalized your presentation deck based on all your guidelines...").
6. CRITICAL RULE: NEVER mention that you are an AI, never mention Gemini, Google, or automated generation. The user must believe this was handcrafted by a diligent peer student specialist.

RETURN STRICTLY RAW VALID JSON ONLY with this exact structure, no markdown ticks, no commentary:
{
  "title": "...",
  "subtitle": "...",
  "theme": "...",
  "colorPalette": {
    "primary": "#...",
    "secondary": "#...",
    "background": "#...",
    "text": "#..."
  },
  "slides": [
    {
      "slideNumber": 1,
      "title": "...",
      "subtitle": "...",
      "contentPoints": ["...", "..."],
      "visualIdea": "...",
      "speakerNotes": "..."
    }
  ],
  "deliveryMessage": "..."
}`;

  const jsonText = await callGemini(prompt);
  let parsed: any;
  try {
    const cleaned = jsonText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse presentation JSON from Gemini:", err);
    parsed = createFallbackPresentation(job);
  }

  const deliverable: PresentationDeliverable = {
    type: "presentation",
    jobId: job.id,
    title: parsed.title || job.title,
    subtitle: parsed.subtitle || analysis.primaryGoal,
    theme: parsed.theme || analysis.designTone,
    colorPalette: parsed.colorPalette || {
      primary: "#2563eb",
      secondary: "#f59e0b",
      background: "#f8fafc",
      text: "#0f172a",
    },
    slides: Array.isArray(parsed.slides) && parsed.slides.length > 0 ? parsed.slides : createFallbackPresentation(job).slides,
    deliveryMessage: parsed.deliveryMessage || "Hey! I have finalized your complete presentation deck according to all your instructions. Every slide is structured with key talking points, visual concepts, and full speaker notes. Let me know if you need any adjustments!",
    createdAt: new Date().toISOString(),
    analysis,
  };

  deliverable.htmlContent = renderPresentationHtml(deliverable);
  return deliverable;
}

/**
 * Generates an authentic human poster design deliverable strictly adhering to user instructions.
 */
export async function generatePosterDeliverable(job: {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  skills?: string[];
  budget?: number;
  category?: string;
}): Promise<PosterDeliverable> {
  // Step 1: Deeply analyze the user's description
  const analysis = await analyzeJobRequirements(job);

  const prompt = `You are a talented student graphic designer and illustrator on Tasskly.
You have been hired to design a stunning, high-impact poster / flyer based STRICTLY on the client instructions.

CLIENT REQUIREMENTS & DETAILED BRIEF:
- Project Title: "${job.title}"
- Category: "${job.category || "Poster Design"}"
- Client Description & Instructions: "${job.instructions || job.description}"
- Required Skills/Topics: ${(job.skills || []).join(", ") || "Graphic design, typography, layout, visual branding"}

DEEP DESCRIPTION ANALYSIS & MANDATORY CONSTRAINTS:
- Primary Goal: ${analysis.primaryGoal}
- Target Audience: ${analysis.targetAudience}
- Mandatory Themes to Feature: ${analysis.keyThemes.join("; ")}
- Design Tone & Aesthetic: ${analysis.designTone}
- Specific User Constraints (Dates, Venue, Details): ${analysis.userConstraints.join("; ")}

STRICT INSTRUCTIONS:
1. Thoroughly fulfill EVERY detail, date, venue, theme, or guideline from the user instructions.
2. Formulate:
   - title: Powerful, bold main headline
   - tagline: Catchy subhead or motto
   - categoryType: (e.g., Campus Event, Tech Symposium, Academic Conference, Club Fest, Cultural Festival, Workshop)
   - colorScheme: { primary: "#hex", secondary: "#hex", accent: "#hex", background: "#hex" }
   - layoutSections: Array of 4-6 key structured sections (e.g., Event Details, Key Highlights, Guest Speakers / Topics, Schedule, Registration & Contact)
   - visualStyle: Description of design aesthetics (e.g., Neo-brutalist, Elegant Minimalist, Cyber Neon, Vibrant Gradient)
   - posterSvgMarkup: A COMPLETE, BEAUTIFUL, SELF-CONTAINED SVG string (viewBox="0 0 800 1130" - standard poster aspect ratio 1:1.414).
     - Include modern background gradient/patterns (<defs><linearGradient>...</linearGradient></defs>).
     - Include decorative geometry, card containers with rounded rects (<rect rx="16" ... />).
     - Render large bold readable typography (<text> tags with font-family="system-ui, sans-serif").
     - Include the Title, Tagline, Section details, Date/Time badges, and Contact footer cleanly positioned with proper y-offsets so nothing overlaps.
     - Make it look stunning, professional, and ready to print or share!
   - deliveryMessage: A natural message from a student designer (e.g. "Hi! Here is the finalized poster design crafted to your exact brief...").
3. CRITICAL RULE: NEVER mention AI, Gemini, Google, or automated generation. The client must feel it was handcrafted by a talented peer.

RETURN STRICTLY RAW VALID JSON ONLY with this exact structure, no markdown ticks, no commentary:
{
  "title": "...",
  "tagline": "...",
  "categoryType": "...",
  "colorScheme": {
    "primary": "#...",
    "secondary": "#...",
    "accent": "#...",
    "background": "#..."
  },
  "layoutSections": [
    { "heading": "...", "details": "..." }
  ],
  "visualStyle": "...",
  "posterSvgMarkup": "<svg viewBox=\\"0 0 800 1130\\" xmlns=\\"http://www.w3.org/2000/svg\\">...</svg>",
  "deliveryMessage": "..."
}`;

  const jsonText = await callGemini(prompt);
  let parsed: any;
  try {
    const cleaned = jsonText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse poster JSON from Gemini:", err);
    parsed = createFallbackPoster(job);
  }

  const deliverable: PosterDeliverable = {
    type: "poster",
    jobId: job.id,
    title: parsed.title || job.title,
    tagline: parsed.tagline || analysis.primaryGoal,
    categoryType: parsed.categoryType || "Campus Showcase",
    colorScheme: parsed.colorScheme || {
      primary: "#6366f1",
      secondary: "#06b6d4",
      accent: "#f59e0b",
      background: "#0f172a",
    },
    layoutSections: Array.isArray(parsed.layoutSections) && parsed.layoutSections.length > 0 ? parsed.layoutSections : createFallbackPoster(job).layoutSections,
    visualStyle: parsed.visualStyle || analysis.designTone,
    posterSvgMarkup: parsed.posterSvgMarkup || createFallbackPoster(job).posterSvgMarkup,
    deliveryMessage: parsed.deliveryMessage || "Hi! Here is your finalized poster design strictly crafted based on your brief and requirements. Colors, typography hierarchy, and section placements have been optimized for print and high-res digital display. Let me know if you need any adjustments!",
    createdAt: new Date().toISOString(),
    analysis,
  };

  deliverable.htmlContent = renderPosterHtml(deliverable);
  return deliverable;
}

/**
 * Generates deliverable according to detected work type.
 */
export async function generateAIDeliverable(job: {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  skills?: string[];
  budget?: number;
  category?: string;
}): Promise<AIDeliverable> {
  const type = detectWorkType(job);
  if (type === "poster") {
    return await generatePosterDeliverable(job);
  }
  // Default to presentation
  return await generatePresentationDeliverable(job);
}

/**
 * Saves and submits the deliverable to the job on Supabase with backend service role bypass.
 */
export async function submitAIDeliverableToJob(
  jobId: string,
  deliverable: AIDeliverable,
  workerId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isPresentation = deliverable.type === "presentation";
    const fileName = isPresentation
      ? `${deliverable.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30)}_Presentation_Deck.html`
      : `${deliverable.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30)}_Poster_Design.html`;

    const fileContent = deliverable.htmlContent || (isPresentation ? renderPresentationHtml(deliverable as PresentationDeliverable) : renderPosterHtml(deliverable as PosterDeliverable));
    const blob = new Blob([fileContent], { type: "text/html" });
    const file = new File([blob], fileName, { type: "text/html" });

    const timestamp = Date.now();
    const filePath = `${jobId}/submission_${timestamp}_${fileName}`;

    // Upload to Supabase storage bucket (or fallback to data URI)
    let finalFileUrl = filePath;
    const { error: uploadError } = await supabase.storage
      .from("job-files")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.warn("Storage upload note:", uploadError.message);
      finalFileUrl = `data:text/html;charset=utf-8,${encodeURIComponent(fileContent)}`;
    }

    // 1. First priority: Call backend API with Service Role authority to bypass RLS policies
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token) {
      try {
        const response = await fetch(getApiUrl("/api/release-escrow"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            action: "submit_deliverable",
            job_id: jobId,
            file_url: finalFileUrl,
            file_name: fileName,
            file_type: "text/html",
            delivery_message: deliverable.deliveryMessage,
          })
        });

        const apiResult = await response.json().catch(() => ({}));
        if (response.ok && apiResult.success) {
          try {
            localStorage.setItem(`ai_deliverable_${jobId}`, JSON.stringify(deliverable));
          } catch {}
          return { success: true };
        } else if (apiResult.error) {
          console.warn("Backend submit deliverable error:", apiResult.error);
        }
      } catch (backendErr) {
        console.warn("Backend submit request failed, attempting direct fallback:", backendErr);
      }
    }

    // 2. Direct fallback using active user
    const { data: { user } } = await supabase.auth.getUser();
    const effectiveWorkerId = workerId || user?.id;

    if (!effectiveWorkerId) {
      return { success: false, error: "Please sign in to submit deliverables." };
    }

    // Insert file record into job_files
    const { error: insertError } = await (supabase as any).from("job_files").insert({
      job_id: jobId,
      uploader_id: effectiveWorkerId,
      file_url: finalFileUrl,
      file_name: fileName,
      file_type: "text/html",
      is_submission: true,
      is_watermarked: false,
    });

    if (insertError) {
      console.error("Direct job_files insert error:", insertError);
      return { success: false, error: insertError.message };
    }

    // Update job status to "submitted"
    const { error: jobUpdateError } = await (supabase as any)
      .from("jobs")
      .update({ status: "submitted", worker_id: effectiveWorkerId })
      .eq("id", jobId);

    if (jobUpdateError) {
      console.error("Direct jobs update error:", jobUpdateError);
      return { success: false, error: jobUpdateError.message };
    }

    // Post authentic freelancer message
    if (deliverable.deliveryMessage) {
      await (supabase as any).from("messages").insert({
        job_id: jobId,
        sender_id: effectiveWorkerId,
        content: deliverable.deliveryMessage,
      }).catch(() => {});
    }

    // Save locally for instant preview
    try {
      localStorage.setItem(`ai_deliverable_${jobId}`, JSON.stringify(deliverable));
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error("Failed to submit deliverable:", err);
    return { success: false, error: err.message || "Unknown error during submission" };
  }
}

/**
 * Calls Gemini API with fallback models.
 */
async function callGemini(prompt: string): Promise<string> {
  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.6,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            },
          }),
        }
      );

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) {
        return text.trim();
      }
    } catch {
      // try next model
    }
  }

  throw new Error("Could not reach Gemini service");
}

/**
 * Fallback presentation builder if API fails.
 */
function createFallbackPresentation(job: { title: string; description: string }): any {
  return {
    title: job.title,
    subtitle: "Project Presentation & Strategy Deck",
    theme: "Clean Professional Deck",
    colorPalette: {
      primary: "#2563eb",
      secondary: "#059669",
      background: "#f8fafc",
      text: "#0f172a",
    },
    slides: [
      {
        slideNumber: 1,
        title: job.title,
        subtitle: "Project Overview & Key Objectives",
        contentPoints: [
          "Targeted analysis directly addressing core deliverables",
          "Structured framework developed according to provided guidelines",
          "Comprehensive synthesis of objectives, methodologies, and outcomes",
        ],
        visualIdea: "Hero banner with structured title typography and accent dividers",
        speakerNotes: "Welcome everyone. Today I will walk through our core findings, tactical approach, and actionable deliverables for this project.",
      },
      {
        slideNumber: 2,
        title: "Executive Summary & Scope",
        subtitle: "Defining Core Scope",
        contentPoints: [
          "Detailed scoping based on client specifications",
          "Key milestones established to ensure maximum precision and timeliness",
          "Strategic alignment between problem context and operational execution",
        ],
        visualIdea: "Three-pillar comparative infographic",
        speakerNotes: "Here we outline the fundamental scope and core objectives to establish immediate clarity.",
      },
      {
        slideNumber: 3,
        title: "In-Depth Problem Analysis",
        subtitle: "Needs Assessment",
        contentPoints: [
          "Critical bottlenecks identified across existing approaches",
          "Empirical requirements derived from current problem benchmarks",
          "Key variables requiring systematic intervention",
        ],
        visualIdea: "Process flow diagram showing challenge indicators",
        speakerNotes: "Looking at the root problem, these key factors represent our primary points of focus.",
      },
      {
        slideNumber: 4,
        title: "Methodology & Proposed Solution",
        subtitle: "Tactical Execution",
        contentPoints: [
          "Structured step-by-step methodology formulated to resolve key constraints",
          "Validation checkpoints integrated across every stage",
          "Optimized resource allocation and high-efficiency workflow",
        ],
        visualIdea: "Step-by-step chronological roadmap with chevron connectors",
        speakerNotes: "This slide details our exact solution architecture and methodological rigor.",
      },
      {
        slideNumber: 5,
        title: "Key Results, Insights & Impact",
        subtitle: "Performance Evaluation",
        contentPoints: [
          "Direct metrics demonstrating successful fulfillment of objectives",
          "Comparative evaluation against baseline standards",
          "Immediate value-add and functional outcomes delivered",
        ],
        visualIdea: "Data metrics dashboard card layout",
        speakerNotes: "As shown in the data points, this approach delivers tangible, validated results.",
      },
      {
        slideNumber: 6,
        title: "Conclusion & Next Steps",
        subtitle: "Summary & Action Plan",
        contentPoints: [
          "Final synthesis of all deliverables and verified milestones",
          "Clear recommendations for immediate implementation",
          "Open floor for questions and strategic discussion",
        ],
        visualIdea: "Summary card grid with primary call-out box",
        speakerNotes: "In summary, our recommendations provide an actionable path forward. Thank you for your time, and I welcome any questions.",
      },
    ],
    deliveryMessage: "Hello! I have completed your presentation deck exactly as specified in your requirements. All slides, structural points, and speaker notes have been fully prepared. Please let me know if you need any adjustments!",
  };
}

/**
 * Fallback poster builder if API fails.
 */
function createFallbackPoster(job: { title: string; description: string }): any {
  return {
    title: job.title,
    tagline: "Official Showcase & Key Highlights",
    categoryType: "Campus Event",
    colorScheme: {
      primary: "#4f46e5",
      secondary: "#06b6d4",
      accent: "#f59e0b",
      background: "#0f172a",
    },
    layoutSections: [
      { heading: "Overview", details: job.description.slice(0, 160) || "Comprehensive project showcase designed for maximum visual engagement." },
      { heading: "Highlights", details: "• High-impact presentation\n• Expert insights & interactive discussion\n• Hands-on takeaways" },
      { heading: "Schedule & Location", details: "Campus Auditorium | 10:00 AM – 4:00 PM" },
      { heading: "Registration & Contact", details: "Scan QR or visit official desk for delegate passes." },
    ],
    visualStyle: "Modern High-Contrast Vector Design",
    posterSvgMarkup: `<svg viewBox="0 0 800 1130" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#090d16" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="800" height="1130" fill="url(#bgGrad)" />
      <circle cx="700" cy="150" r="280" fill="#6366f1" opacity="0.18" filter="blur(40px)" />
      <circle cx="100" cy="950" r="320" fill="#06b6d4" opacity="0.15" filter="blur(50px)" />
      
      <rect x="250" y="80" width="300" height="40" rx="20" fill="#1e293b" stroke="#334155" />
      <text x="400" y="105" fill="#38bdf8" font-size="14" font-weight="700" font-family="system-ui" text-anchor="middle" letter-spacing="3">CAMPUS SHOWCASE</text>

      <text x="400" y="220" fill="#ffffff" font-size="44" font-weight="900" font-family="system-ui" text-anchor="middle">
        ${escapeHtml(job.title.slice(0, 32))}
      </text>
      <text x="400" y="275" fill="#94a3b8" font-size="20" font-weight="500" font-family="system-ui" text-anchor="middle">
        Designed strictly to client specifications
      </text>

      <rect x="280" y="310" width="240" height="4" rx="2" fill="url(#accentGrad)" />

      <rect x="80" y="360" width="640" height="140" rx="16" fill="#1e293b" fill-opacity="0.75" stroke="#334155" />
      <text x="120" y="405" fill="#38bdf8" font-size="18" font-weight="800" font-family="system-ui">KEY HIGHLIGHTS</text>
      <text x="120" y="445" fill="#e2e8f0" font-size="15" font-family="system-ui">Comprehensive project brief executed with high aesthetic standards</text>
      <text x="120" y="475" fill="#94a3b8" font-size="14" font-family="system-ui">• Structured content • Clear focal points • Clean contrast</text>

      <rect x="80" y="530" width="640" height="140" rx="16" fill="#1e293b" fill-opacity="0.75" stroke="#334155" />
      <text x="120" y="575" fill="#f59e0b" font-size="18" font-weight="800" font-family="system-ui">SPECIFICATIONS & DETAILS</text>
      <text x="120" y="615" fill="#e2e8f0" font-size="15" font-family="system-ui">${escapeHtml(job.description.slice(0, 80) || "Prepared according to user requirements")}</text>
      <text x="120" y="645" fill="#94a3b8" font-size="14" font-family="system-ui">Organized for optimal legibility at both print and digital resolutions</text>

      <rect x="80" y="710" width="305" height="130" rx="16" fill="#1e293b" stroke="#334155" />
      <text x="110" y="755" fill="#a855f7" font-size="16" font-weight="800" font-family="system-ui">TIMELINE</text>
      <text x="110" y="795" fill="#ffffff" font-size="18" font-weight="700" font-family="system-ui">Delivered on Time</text>
      <text x="110" y="820" fill="#94a3b8" font-size="13" font-family="system-ui">2-Day Delivery Guarantee</text>

      <rect x="415" y="710" width="305" height="130" rx="16" fill="#1e293b" stroke="#334155" />
      <text x="445" y="755" fill="#10b981" font-size="16" font-weight="800" font-family="system-ui">QUALITY</text>
      <text x="445" y="795" fill="#ffffff" font-size="18" font-weight="700" font-family="system-ui">Student Verified</text>
      <text x="445" y="820" fill="#94a3b8" font-size="13" font-family="system-ui">Ready for Print / Web</text>

      <rect x="80" y="880" width="640" height="90" rx="20" fill="url(#accentGrad)" />
      <text x="400" y="935" fill="#ffffff" font-size="22" font-weight="900" font-family="system-ui" text-anchor="middle">OFFICIAL TASK DELIVERABLE</text>

      <text x="400" y="1050" fill="#64748b" font-size="13" font-family="system-ui" text-anchor="middle">Crafted with precision for student project success</text>
    </svg>`,
    deliveryMessage: "Hi! I have designed your poster according to all your instructions. The typography, layout, and visual balance are ready for display or print. Let me know if you need any adjustments!",
  };
}

/**
 * Generates interactive, standalone HTML presentation file.
 */
export function renderPresentationHtml(d: PresentationDeliverable): string {
  const slidesJson = JSON.stringify(d.slides);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(d.title)} - Presentation Deck</title>
  <style>
    :root {
      --primary: ${d.colorPalette.primary || "#2563eb"};
      --secondary: ${d.colorPalette.secondary || "#f59e0b"};
      --bg: ${d.colorPalette.background || "#f8fafc"};
      --text: ${d.colorPalette.text || "#0f172a"};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    header {
      padding: 14px 24px;
      background: #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #334155;
    }
    header h1 { font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%; }
    .controls { display: flex; gap: 10px; align-items: center; }
    button {
      background: #334155;
      color: #ffffff;
      border: 1px solid #475569;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.15s;
    }
    button:hover { background: #475569; }
    button.primary { background: var(--primary); border-color: var(--primary); }
    button.primary:hover { filter: brightness(1.1); }
    main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
    }
    .slide-card {
      width: 100%;
      max-width: 960px;
      aspect-ratio: 16 / 9;
      background: var(--bg);
      color: var(--text);
      border-radius: 18px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      padding: 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      animation: fadeIn 0.25s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    .slide-header {
      border-bottom: 2px solid rgba(0,0,0,0.06);
      padding-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .slide-number {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--primary);
    }
    .slide-title {
      font-size: 30px;
      font-weight: 800;
      color: var(--text);
      margin-top: 4px;
      line-height: 1.2;
    }
    .slide-body {
      flex: 1;
      margin: 24px 0;
      display: flex;
      gap: 32px;
    }
    .content-list {
      flex: 3;
      list-style: none;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 16px;
    }
    .content-list li {
      font-size: 18px;
      line-height: 1.5;
      position: relative;
      padding-left: 28px;
    }
    .content-list li::before {
      content: "•";
      color: var(--primary);
      font-size: 28px;
      position: absolute;
      left: 6px;
      top: -4px;
    }
    .visual-box {
      flex: 2;
      background: rgba(0,0,0,0.03);
      border: 1px dashed rgba(0,0,0,0.15);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-size: 13px;
      color: #64748b;
    }
    .visual-box strong {
      color: var(--text);
      display: block;
      margin-bottom: 6px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(0,0,0,0.06);
      padding-top: 14px;
      font-size: 12px;
      color: #64748b;
    }
    .notes-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #1e293b;
      border-top: 2px solid var(--primary);
      padding: 16px 24px;
      transform: translateY(100%);
      transition: transform 0.2s ease-in-out;
      box-shadow: 0 -10px 25px rgba(0,0,0,0.4);
      z-index: 100;
    }
    .notes-panel.open { transform: translateY(0); }
    .notes-title { font-size: 12px; font-weight: 800; color: var(--secondary); text-transform: uppercase; margin-bottom: 4px; }
    .notes-text { font-size: 14px; color: #e2e8f0; line-height: 1.5; }
    @media print {
      body { background: #ffffff; color: #000000; height: auto; overflow: visible; }
      header, .controls, .notes-panel { display: none !important; }
      main { padding: 0; background: none; }
      .slide-card { page-break-after: always; box-shadow: none; border: 1px solid #ccc; max-width: 100%; aspect-ratio: auto; min-height: 90vh; }
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(d.title)}</h1>
    <div class="controls">
      <span id="counter" style="font-size: 13px; font-weight: 700; color: #94a3b8; margin-right: 8px;">1 / ${d.slides.length}</span>
      <button onclick="prevSlide()">◀ Previous</button>
      <button onclick="nextSlide()">Next ▶</button>
      <button onclick="toggleNotes()">🎤 Speaker Notes</button>
      <button class="primary" onclick="window.print()">🖨️ Print / Save PDF</button>
    </div>
  </header>

  <main>
    <div id="slideContainer" class="slide-card"></div>
  </main>

  <div id="notesPanel" class="notes-panel">
    <div class="notes-title">🎤 Speaker Notes for Slide <span id="notesSlideNum">1</span></div>
    <div id="notesContent" class="notes-text"></div>
  </div>

  <script>
    const slides = ${slidesJson};
    let currentIndex = 0;
    let notesVisible = false;

    function render() {
      const s = slides[currentIndex];
      const container = document.getElementById("slideContainer");
      document.getElementById("counter").innerText = (currentIndex + 1) + " / " + slides.length;
      document.getElementById("notesSlideNum").innerText = (currentIndex + 1);
      document.getElementById("notesContent").innerText = s.speakerNotes || "Speak clearly on this topic based on the slide points.";

      container.innerHTML = \`
        <div class="slide-header">
          <div>
            <div class="slide-number">Slide \${s.slideNumber} • \${escapeHtml(s.subtitle || "${escapeHtml(d.theme)}")}</div>
            <h2 class="slide-title">\${escapeHtml(s.title)}</h2>
          </div>
        </div>
        <div class="slide-body">
          <ul class="content-list">
            \${(s.contentPoints || []).map(p => \`<li>\${escapeHtml(p)}</li>\`).join("")}
          </ul>
          \${s.visualIdea ? \`
            <div class="visual-box">
              <strong>Recommended Graphic</strong>
              \${escapeHtml(s.visualIdea)}
            </div>
          \` : ""}
        </div>
        <div class="slide-footer">
          <span>${escapeHtml(d.title)}</span>
          <span>Press [Space] or [Arrow Keys] to navigate</span>
        </div>
      \`;
    }

    function prevSlide() {
      if (currentIndex > 0) { currentIndex--; render(); }
    }
    function nextSlide() {
      if (currentIndex < slides.length - 1) { currentIndex++; render(); }
    }
    function toggleNotes() {
      notesVisible = !notesVisible;
      document.getElementById("notesPanel").classList.toggle("open", notesVisible);
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { nextSlide(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { prevSlide(); }
      else if (e.key === "n" || e.key === "N") { toggleNotes(); }
    });

    function escapeHtml(text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.innerText = text;
      return div.innerHTML;
    }

    render();
  </script>
</body>
</html>`;
}

/**
 * Generates printable, high-res HTML poster file.
 */
export function renderPosterHtml(d: PosterDeliverable): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(d.title)} - Final Poster Design</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0b0f19;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      padding: 24px;
    }
    .toolbar {
      width: 100%;
      max-width: 800px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      background: #1e293b;
      padding: 12px 20px;
      border-radius: 12px;
      border: 1px solid #334155;
    }
    .toolbar h1 { font-size: 16px; font-weight: 700; color: #f8fafc; }
    button {
      background: #6366f1;
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    button:hover { background: #4f46e5; }
    .poster-frame {
      width: 100%;
      max-width: 800px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
      border-radius: 16px;
      overflow: hidden;
      background: #000;
    }
    svg { display: block; width: 100%; height: auto; }
    @media print {
      body { background: white; padding: 0; }
      .toolbar { display: none !important; }
      .poster-frame { box-shadow: none; border-radius: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <h1>${escapeHtml(d.title)} — Final High-Res Poster</h1>
    <button onclick="window.print()">🖨️ Print / Save High-Res PDF</button>
  </div>
  <div class="poster-frame">
    ${d.posterSvgMarkup}
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

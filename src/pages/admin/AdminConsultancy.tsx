import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  IndianRupee,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Copy,
  ExternalLink,
  RefreshCw,
  Video,
  Download,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Check,
  Calendar,
  Layers,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export interface ConsultancyBooking {
  bookingId: string;
  razorpayPaymentId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  mentorName: string;
  mentorRole: string;
  mentorCompanyOrCollege: string;
  mentorAvatar: string;
  topic: string;
  date: string;
  time: string;
  meetUrl: string;
  amountPaid: number;
  currency: string;
  paidAt: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected" | "refunded";
  userNote?: string;
  refundProcessedAt?: string;
  approvedAt?: string;
  paymentMethod?: string;
}

const DEFAULT_SEED_BOOKINGS: ConsultancyBooking[] = [
  {
    bookingId: "TSK-94821",
    razorpayPaymentId: "pay_Pz92kd81hN4",
    userName: "Rohan Sharma",
    userEmail: "rohan.sharma99@gmail.com",
    userPhone: "+91 98765 43210",
    mentorName: "Aarav Sharma",
    mentorRole: "Senior SDE · IIT Bombay '21",
    mentorCompanyOrCollege: "IIT Bombay / Google",
    mentorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    topic: "Seat Allotment & College Choice",
    date: "Tomorrow, 19 Oct",
    time: "06:00 PM",
    meetUrl: "https://meet.google.com/tsk-aarav-cns",
    amountPaid: 499,
    currency: "₹",
    paidAt: "04:32 PM",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "pending",
    paymentMethod: "UPI (Google Pay)",
    userNote: "Need clarity on IIT Bombay Electrical vs IIT Madras CSE seat allotment in Round 3."
  },
  {
    bookingId: "TSK-82194",
    razorpayPaymentId: "pay_Ok19df77mQ2",
    userName: "Ananya Deshmukh",
    userEmail: "ananya.deshmukh@outlook.com",
    userPhone: "+91 98234 11223",
    mentorName: "Sneha Rao",
    mentorRole: "Admissions Lead · BITS Pilani '19",
    mentorCompanyOrCollege: "BITS Pilani / Columbia",
    mentorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
    topic: "College vs Course Trade-off",
    date: "Tuesday, 20 Oct",
    time: "04:00 PM",
    meetUrl: "https://meet.google.com/tsk-sneha-cns",
    amountPaid: 499,
    currency: "₹",
    paidAt: "02:15 PM",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    status: "approved",
    approvedAt: "02:30 PM",
    paymentMethod: "UPI (PhonePe)",
    userNote: "Comparing Tier-1 core branch vs Tier-2 CSE branch campus placement outcomes."
  },
  {
    bookingId: "TSK-73192",
    razorpayPaymentId: "pay_Lm88qq31zP0",
    userName: "Karthik Nair",
    userEmail: "karthik.nair.eng@gmail.com",
    userPhone: "+91 99441 55667",
    mentorName: "Priya Patel",
    mentorRole: "Product Manager · Stanford '22",
    mentorCompanyOrCollege: "Stanford / Microsoft",
    mentorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
    topic: "Study Abroad & Masters Roadmap",
    date: "Wednesday, 21 Oct",
    time: "08:00 PM",
    meetUrl: "https://meet.google.com/tsk-priya-cns",
    amountPaid: 499,
    currency: "₹",
    paidAt: "11:45 AM",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: "approved",
    approvedAt: "12:00 PM",
    paymentMethod: "Credit Card (HDFC)",
    userNote: "Profile evaluation for Fall '27 MS in CS in US with GRE 324 and 8.9 CGPA."
  },
  {
    bookingId: "TSK-61048",
    razorpayPaymentId: "pay_Gh44aa99xW1",
    userName: "Vikas Reddy",
    userEmail: "vikas.reddy@gmail.com",
    userPhone: "+91 91234 56780",
    mentorName: "Rohan Verma",
    mentorRole: "Machine Learning Engineer · IIT Delhi '20",
    mentorCompanyOrCollege: "IIT Delhi / Meta",
    mentorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
    topic: "College Admissions Guidance",
    date: "Sunday, 17 Oct",
    time: "02:00 PM",
    meetUrl: "https://meet.google.com/tsk-rohan-cns",
    amountPaid: 499,
    currency: "₹",
    paidAt: "09:30 AM",
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    status: "refunded",
    refundProcessedAt: "11:40 AM (Credited in 2.1 hrs)",
    paymentMethod: "UPI (Paytm)",
    userNote: "Student had unexpected semester lab exam conflict. Member declined and full ₹499 refunded within 2 hours."
  }
];

export const AdminConsultancy = () => {
  const [bookings, setBookings] = useState<ConsultancyBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "refunded">("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<ConsultancyBooking | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);

  // Load from localStorage or seed
  const loadBookings = () => {
    try {
      const stored = localStorage.getItem("tasskly_consultancy_bookings");
      const legacySessions = localStorage.getItem("tasskly_student_sessions");

      let parsed: ConsultancyBooking[] = [];
      if (stored) {
        parsed = JSON.parse(stored);
      } else if (legacySessions) {
        parsed = JSON.parse(legacySessions).map((s: any) => ({
          ...s,
          status: s.status || "pending",
          createdAt: s.createdAt || new Date().toISOString()
        }));
      }

      if (!parsed || parsed.length === 0) {
        parsed = DEFAULT_SEED_BOOKINGS;
        localStorage.setItem("tasskly_consultancy_bookings", JSON.stringify(DEFAULT_SEED_BOOKINGS));
      }

      setBookings(parsed);
    } catch (e) {
      console.error("Error loading consultancy bookings:", e);
      setBookings(DEFAULT_SEED_BOOKINGS);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const saveBookings = (newBookings: ConsultancyBooking[]) => {
    setBookings(newBookings);
    localStorage.setItem("tasskly_consultancy_bookings", JSON.stringify(newBookings));
    localStorage.setItem("tasskly_student_sessions", JSON.stringify(newBookings));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Member Approval Action
  const handleApprove = (bookingId: string) => {
    setIsProcessingAction(bookingId);
    setTimeout(() => {
      const updated = bookings.map((b) => {
        if (b.bookingId === bookingId) {
          return {
            ...b,
            status: "approved" as const,
            approvedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
        }
        return b;
      });
      saveBookings(updated);
      setIsProcessingAction(null);
      toast.success(`Session confirmed! Member approval notification email sent to student.`);
    }, 400);
  };

  // Reject & 2-3h Refund Action
  const handleRejectAndRefund = (bookingId: string) => {
    setIsProcessingAction(bookingId);
    setTimeout(() => {
      const updated = bookings.map((b) => {
        if (b.bookingId === bookingId) {
          return {
            ...b,
            status: "refunded" as const,
            refundProcessedAt: `Refund Dispatched (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - credited within 2-3h)`
          };
        }
        return b;
      });
      saveBookings(updated);
      setIsProcessingAction(null);
      toast.info(`Session declined by member. ₹499 refund initiated via Razorpay Escrow (credited in 2–3 hours).`);
    }, 400);
  };

  // Resend Email notification simulation
  const handleResendReceipt = (booking: ConsultancyBooking) => {
    toast.success(`Receipt & session details re-sent to ${booking.userEmail}!`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      toast.error("No bookings to export.");
      return;
    }
    const headers = [
      "Booking ID",
      "Razorpay Payment ID",
      "Student Name",
      "Student Email",
      "Student Phone",
      "Mentor Name",
      "Mentor Role",
      "Topic",
      "Date",
      "Time",
      "Amount Paid",
      "Status",
      "Paid At"
    ];

    const rows = bookings.map((b) => [
      `"${b.bookingId}"`,
      `"${b.razorpayPaymentId}"`,
      `"${b.userName}"`,
      `"${b.userEmail}"`,
      `"${b.userPhone}"`,
      `"${b.mentorName}"`,
      `"${b.mentorRole}"`,
      `"${b.topic}"`,
      `"${b.date}"`,
      `"${b.time}"`,
      `"₹${b.amountPaid}"`,
      `"${b.status.toUpperCase()}"`,
      `"${b.paidAt}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tasskly_consultancy_paid_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully.");
  };

  // Filtered list
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "pending" && b.status !== "pending") return false;
        if (statusFilter === "approved" && b.status !== "approved") return false;
        if (statusFilter === "refunded" && b.status !== "refunded" && b.status !== "rejected") return false;
      }
      // Topic filter
      if (topicFilter !== "all" && !b.topic.toLowerCase().includes(topicFilter.toLowerCase())) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.userName.toLowerCase().includes(q);
        const matchEmail = b.userEmail.toLowerCase().includes(q);
        const matchPhone = b.userPhone.toLowerCase().includes(q);
        const matchMentor = b.mentorName.toLowerCase().includes(q);
        const matchBookingId = b.bookingId.toLowerCase().includes(q);
        const matchPaymentId = b.razorpayPaymentId.toLowerCase().includes(q);
        const matchTopic = b.topic.toLowerCase().includes(q);
        return matchName || matchEmail || matchPhone || matchMentor || matchBookingId || matchPaymentId || matchTopic;
      }
      return true;
    });
  }, [bookings, statusFilter, topicFilter, searchQuery]);

  // Aggregate stats
  const totalPaidCount = bookings.length;
  const totalEscrowCollected = bookings.reduce((sum, b) => sum + (b.amountPaid || 499), 0);
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const approvedCount = bookings.filter((b) => b.status === "approved").length;
  const refundedCount = bookings.filter((b) => b.status === "refunded" || b.status === "rejected").length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold text-xs gap-1.5 py-0.5">
              <Sparkles className="h-3 w-3" />
              1-on-1 Mentorship Escrow
            </Badge>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-xs">
              Flat ₹499 / Session
            </Badge>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
            Paid Consultancy Users
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl mt-1">
            Students who completed ₹499 Razorpay payments. Sessions are confirmed <strong>when and only when the member approves</strong>. If rejected, 100% is refunded within <strong>2–3 hours</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBookings}
            className="gap-2 text-xs font-semibold rounded-xl"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExportCSV}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-xs font-semibold rounded-xl shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV ({filteredBookings.length})
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">Total Paid Bookings</span>
            <div className="font-display text-2xl font-black text-foreground">{totalPaidCount}</div>
            <span className="text-[11px] text-muted-foreground font-mono">100% via Razorpay</span>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-blue-200 bg-blue-50/40">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-blue-800 font-medium block">Total Escrow Funds</span>
            <div className="font-display text-2xl font-black text-blue-700">₹{totalEscrowCollected.toLocaleString("en-IN")}</div>
            <span className="text-[11px] text-blue-600 font-mono">Protected in Escrow</span>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-amber-200 bg-amber-50/40">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-900 font-medium block">Awaiting Approval</span>
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="font-display text-2xl font-black text-amber-700">{pendingCount}</div>
            <span className="text-[11px] text-amber-800 font-mono">Needs Member Action</span>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-emerald-200 bg-emerald-50/40">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-emerald-900 font-medium block">Confirmed Sessions</span>
            <div className="font-display text-2xl font-black text-emerald-700">{approvedCount}</div>
            <span className="text-[11px] text-emerald-800 font-mono">Approved by Members</span>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-rose-200 bg-rose-50/40">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-rose-900 font-medium block">Refunded (2–3h)</span>
            <div className="font-display text-2xl font-black text-rose-700">{refundedCount}</div>
            <span className="text-[11px] text-rose-800 font-mono">100% Returned</span>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, phone, booking ID, or Razorpay ID..."
              className="pl-9 text-xs h-10 rounded-xl bg-slate-50 border-slate-200"
            />
          </div>

          {/* Milestone filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium shrink-0 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Topic:
            </span>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="text-xs h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none"
            >
              <option value="all">All Topics</option>
              <option value="Seat">Seat Allotment</option>
              <option value="College">College Selection</option>
              <option value="Admissions">Admissions</option>
              <option value="Course">Course Selection</option>
              <option value="Abroad">Study Abroad</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === "pending"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            <Clock className="h-3 w-3" />
            Pending Member Approval ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === "approved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            Approved &amp; Confirmed ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter("refunded")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === "refunded"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
            }`}
          >
            <XCircle className="h-3 w-3" />
            Refunded / Declined ({refundedCount})
          </button>
        </div>
      </div>

      {/* Bookings Table / Card List */}
      <Card className="shadow-xs border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                <th className="p-3.5 pl-4">Student &amp; Payment</th>
                <th className="p-3.5">Assigned Mentor</th>
                <th className="p-3.5">Topic &amp; Schedule</th>
                <th className="p-3.5">Amount (₹499)</th>
                <th className="p-3.5">Member Approval Status</th>
                <th className="p-3.5 pr-4 text-right">Escrow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No consultancy bookings match your filter.</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting a different status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const isPending = b.status === "pending";
                  const isApproved = b.status === "approved";
                  const isRefunded = b.status === "refunded" || b.status === "rejected";

                  return (
                    <tr
                      key={b.bookingId}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* 1. Student Details */}
                      <td className="p-3.5 pl-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{b.userName}</span>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border">
                              {b.bookingId}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            <a href={`mailto:${b.userEmail}`} className="hover:underline hover:text-blue-600 truncate max-w-[180px]">
                              {b.userEmail}
                            </a>
                          </div>

                          {b.userPhone && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                              <span>{b.userPhone}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 text-[10px] font-mono text-blue-600 bg-blue-50/70 px-2 py-0.5 rounded border border-blue-100 w-fit mt-1">
                            <span>Razorpay: {b.razorpayPaymentId}</span>
                            <button
                              onClick={() => handleCopy(b.razorpayPaymentId, b.bookingId)}
                              className="text-slate-400 hover:text-blue-700 ml-1"
                              title="Copy Payment ID"
                            >
                              {copiedId === b.bookingId ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 2. Mentor Details */}
                      <td className="p-3.5 align-top">
                        <div className="flex items-start gap-2.5">
                          <img
                            src={b.mentorAvatar}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{b.mentorName}</p>
                            <p className="text-[11px] text-slate-500 truncate">{b.mentorRole}</p>
                            <span className="text-[10px] font-mono text-slate-400 block truncate">
                              {b.mentorCompanyOrCollege}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Topic & Schedule */}
                      <td className="p-3.5 align-top">
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-800 block line-clamp-1">
                            {b.topic}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span>{b.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{b.time} (45 mins)</span>
                          </div>

                          {b.meetUrl && (
                            <a
                              href={b.meetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1"
                            >
                              <Video className="h-3 w-3" />
                              <span>Google Meet Link</span>
                              <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* 4. Amount */}
                      <td className="p-3.5 align-top">
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-900 text-sm text-emerald-600 block">
                            ₹{b.amountPaid}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            {b.paymentMethod || "Razorpay SSL"}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Paid at {b.paidAt}
                          </span>
                        </div>
                      </td>

                      {/* 5. Member Approval Status */}
                      <td className="p-3.5 align-top">
                        {isPending && (
                          <div className="space-y-1">
                            <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 font-bold text-[11px] gap-1 px-2.5 py-0.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Awaiting Member Approval
                            </Badge>
                            <p className="text-[10px] text-slate-500 leading-tight">
                              Student received email receipt. Confirmed only when member approves.
                            </p>
                          </div>
                        )}

                        {isApproved && (
                          <div className="space-y-1">
                            <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 font-bold text-[11px] gap-1 px-2.5 py-0.5">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Member Approved &amp; Confirmed
                            </Badge>
                            {b.approvedAt && (
                              <p className="text-[10px] text-slate-400 font-mono">
                                Approved at {b.approvedAt}
                              </p>
                            )}
                          </div>
                        )}

                        {isRefunded && (
                          <div className="space-y-1">
                            <Badge className="bg-rose-500/15 text-rose-700 border-rose-500/30 font-bold text-[11px] gap-1 px-2.5 py-0.5">
                              <XCircle className="h-3.5 w-3.5" />
                              Declined · Refunded (2–3h)
                            </Badge>
                            <p className="text-[10px] text-rose-600 font-mono leading-tight">
                              {b.refundProcessedAt || "100% ₹499 refunded in 2–3 hours"}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* 6. Action Controls */}
                      <td className="p-3.5 pr-4 align-top text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {isPending && (
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                disabled={isProcessingAction === b.bookingId}
                                onClick={() => handleApprove(b.bookingId)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-8 px-2.5 rounded-lg shadow-xs gap-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isProcessingAction === b.bookingId}
                                onClick={() => handleRejectAndRefund(b.bookingId)}
                                className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-[11px] h-8 px-2 rounded-lg gap-1"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject &amp; Refund
                              </Button>
                            </div>
                          )}

                          {isApproved && (
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResendReceipt(b)}
                                className="text-slate-600 hover:text-slate-900 text-[11px] h-8 px-2 rounded-lg gap-1"
                              >
                                <Mail className="h-3 w-3" />
                                Resend Mail
                              </Button>
                              <a
                                href={b.meetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-8 px-2.5 rounded-lg"
                              >
                                <Video className="h-3.5 w-3.5" />
                                Join Call
                              </a>
                            </div>
                          )}

                          {isRefunded && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toast.info(`Refund receipt verified. ₹499 returned to student via Razorpay transaction ${b.razorpayPaymentId}.`)}
                              className="text-slate-500 text-[11px] h-8 px-2 rounded-lg"
                            >
                              Refund Verified
                            </Button>
                          )}

                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline mt-0.5"
                          >
                            View Receipt &amp; Notes
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Booking Detail Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        {selectedBooking && (
          <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="p-6 bg-slate-900 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                  Consultancy Booking Receipt
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {selectedBooking.bookingId}
                </span>
              </div>
              <DialogTitle className="text-xl font-bold text-white mt-1">
                {selectedBooking.userName}
              </DialogTitle>
              <DialogDescription className="text-slate-300 text-xs">
                {selectedBooking.topic} with {selectedBooking.mentorName}
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Payment Status Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Amount Paid</span>
                  <span className="font-extrabold text-base text-emerald-600">₹{selectedBooking.amountPaid}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Approval Status</span>
                  <span className="font-bold text-slate-800 capitalize">{selectedBooking.status}</span>
                </div>
              </div>

              {/* Student Details */}
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <p className="font-bold text-slate-800 uppercase text-[10px] font-mono tracking-wider">Student Contact</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <span className="font-semibold">{selectedBooking.userEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone</span>
                    <span className="font-semibold">{selectedBooking.userPhone || "Not provided"}</span>
                  </div>
                </div>
              </div>

              {/* Mentor & Slot */}
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <p className="font-bold text-slate-800 uppercase text-[10px] font-mono tracking-wider">Session Breakdown</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mentor</span>
                    <span className="font-semibold">{selectedBooking.mentorName}</span>
                    <span className="text-[10px] text-slate-400 block">{selectedBooking.mentorCompanyOrCollege}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Scheduled Slot</span>
                    <span className="font-semibold">{selectedBooking.date}</span>
                    <span className="text-[10px] text-slate-500 block">{selectedBooking.time}</span>
                  </div>
                </div>
              </div>

              {/* Razorpay Transaction Details */}
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <p className="font-bold text-slate-800 uppercase text-[10px] font-mono tracking-wider">Payment Metadata</p>
                <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Razorpay Payment ID:</span>
                    <span className="font-bold text-blue-700">{selectedBooking.razorpayPaymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Method:</span>
                    <span className="font-medium text-slate-700">{selectedBooking.paymentMethod || "UPI / Card"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Paid At:</span>
                    <span className="font-medium text-slate-700">{selectedBooking.paidAt}</span>
                  </div>
                </div>
              </div>

              {/* Student Note */}
              <div className="space-y-1">
                <p className="font-bold text-slate-800 uppercase text-[10px] font-mono tracking-wider">Student Note / Goal</p>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs italic">
                  {selectedBooking.userNote || "No custom note provided by the student."}
                </p>
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-2 flex items-center justify-end gap-2">
                {selectedBooking.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleApprove(selectedBooking.bookingId);
                        setSelectedBooking(null);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Approve Session
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        handleRejectAndRefund(selectedBooking.bookingId);
                        setSelectedBooking(null);
                      }}
                      className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject &amp; Refund ₹499
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AdminConsultancy;

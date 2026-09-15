import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserCheck, UserX, Shield, Mail, CheckCircle, Clock,
  AlertTriangle, Eye, X, Check, Briefcase, IndianRupee, ImageOff, Trash2, Loader2, CreditCard
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";

import { getApiUrl } from "@/lib/api";

const AdminUsers = () => {
  const {
    fetchAllUsers, fetchPendingVerifications, approveVerification,
    rejectVerification, getSignedUrls, deleteUserAndHistory
  } = useAdmin();

  const [users, setUsers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [upiUpdatingId, setUpiUpdatingId] = useState<string | null>(null);

  // UPI Rejection modal states
  const [rejectingUpiUser, setRejectingUpiUser] = useState<any>(null);
  const [upiRejectReason, setUpiRejectReason] = useState("");

  const filteredUsers = users.filter((u) => {
    if (levelFilter === "all") return true;
    return String(u.level) === levelFilter;
  });

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [docUrls, setDocUrls] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // User detail modal & deletion states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleApproveUpi = async (userId: string) => {
    setUpiUpdatingId(userId);
    try {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({
          upi_verified: true,
          upi_verification_status: "verified",
          upi_verified_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) throw error;
      toast.success("UPI ID manually approved! ✅");
      loadData();
      if (selectedUser?.id === userId) {
        setSelectedUser((prev: any) => ({
          ...prev,
          upi_verified: true,
          upi_verification_status: "verified"
        }));
      }
    } catch (e: any) {
      toast.error("Failed to approve UPI ID: " + e.message);
    } finally {
      setUpiUpdatingId(null);
    }
  };

  const handleConfirmRejectUpi = async () => {
    if (!rejectingUpiUser) return;
    const user = rejectingUpiUser;
    setUpiUpdatingId(user.id);
    try {
      // 1. Update status in database
      const { error } = await (supabase as any)
        .from("profiles")
        .update({
          upi_verified: false,
          upi_verification_status: "rejected"
        })
        .eq("id", user.id);

      if (error) throw error;

      // 2. Dispatch formal email notification to user
      if (user.email) {
        try {
          await fetch(getApiUrl("/api/send-upi-rejection-email"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email.trim(),
              userName: user.full_name || "Member",
              upiId: user.upi_id || "",
              reason: upiRejectReason || "UPI VPA handle could not be verified with banking network or name mismatch."
            }),
          });
        } catch (emailErr) {
          console.warn("Could not dispatch UPI rejection email:", emailErr);
        }
      }

      toast.success(`UPI ID rejected. Formal notification sent to ${user.email} ✉️`);
      setRejectingUpiUser(null);
      setUpiRejectReason("");
      loadData();

      if (selectedUser?.id === user.id) {
        setSelectedUser((prev: any) => ({
          ...prev,
          upi_verified: false,
          upi_verification_status: "rejected"
        }));
      }
    } catch (e: any) {
      toast.error("Failed to reject UPI ID: " + e.message);
    } finally {
      setUpiUpdatingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    const success = await deleteUserAndHistory(selectedUser.id);
    setDeleting(false);
    if (success) {
      setIsDeletingUser(false);
      setSelectedUser(null);
      loadData();
    }
  };

  const loadData = async () => {
    setLoading(true);
    const [allUsers, pendingRequests] = await Promise.all([
      fetchAllUsers(),
      fetchPendingVerifications()
    ]);
    setUsers(allUsers);
    setPending(pendingRequests);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleViewDocs = async (req: any) => {
    setSelectedRequest(req);
    setIsRejecting(false);
    const urls = await getSignedUrls([req.front_image_url, req.back_image_url, req.selfie_url]);
    setDocUrls({ front: urls[0], back: urls[1], selfie: urls[2] });
  };

  const handleApprove = async (req?: any) => {
    const target = req || selectedRequest;
    if (!target) return;
    const success = await approveVerification(target.user_id, target.id);
    if (success) { setSelectedRequest(null); loadData(); }
  };

  const handleReject = async (req?: any) => {
    const target = req || selectedRequest;
    if (!target || !adminNote) { toast.error("Please provide a reason for rejection"); return; }
    const success = await rejectVerification(target.user_id, target.id, adminNote);
    if (success) { setSelectedRequest(null); setIsRejecting(false); setAdminNote(""); loadData(); }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground text-sm">Review verification requests and monitor user activity.</p>
      </div>

      {/* ── Verification Queue ── */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Pending Verifications
          <Badge variant="secondary" className="ml-2">{pending.length}</Badge>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground italic col-span-full py-4 px-1">
                All clear! No pending verification requests.
              </p>
            ) : (
              pending.map((req) => (
                <motion.div key={req.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className="shadow-sm border-primary/20 bg-primary/5 h-full flex flex-col">
                    <CardContent className="p-4 space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                          {req.full_name?.charAt(0) || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{req.full_name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{req.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 py-2 border-y border-primary/10">
                        <div>
                          <p className="text-[8px] font-black text-muted-foreground uppercase">ID Type</p>
                          <p className="text-[10px] font-bold text-foreground uppercase">{req.id_type?.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-muted-foreground uppercase">Submitted</p>
                          <p className="text-[10px] font-bold text-foreground">{format(new Date(req.created_at), 'dd MMM')}</p>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-2 border-primary/20 hover:bg-primary/10" onClick={() => handleViewDocs(req)}>
                        <Eye className="h-3.5 w-3.5" /> View Documents
                      </Button>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 text-[10px] h-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(req)}>
                          <CheckCircle className="mr-1 h-3 w-3" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-[10px] h-8 text-destructive hover:bg-destructive/10"
                          onClick={() => { setSelectedRequest(req); setIsRejecting(true); }}>
                          <UserX className="mr-1 h-3 w-3" /> Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Users Table ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-display font-bold text-foreground flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-accent" />
            Active Marketplace Members
          </h2>

          {/* Level Filters */}
          <div className="flex gap-1.5 p-1 bg-muted/60 rounded-xl border self-start">
            <button
              onClick={() => setLevelFilter("all")}
              className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                levelFilter === "all"
                  ? "bg-white text-foreground shadow-sm font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
              <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] font-black shrink-0">
                {users.length}
              </Badge>
            </button>
            <button
              onClick={() => setLevelFilter("1")}
              className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                levelFilter === "1"
                  ? "bg-white text-blue-700 shadow-sm font-black border border-blue-100"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Lvl 1
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 px-1.5 py-0 h-4 text-[9px] font-black shrink-0">
                {users.filter(u => String(u.level) === "1").length}
              </Badge>
            </button>
            <button
              onClick={() => setLevelFilter("2")}
              className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                levelFilter === "2"
                  ? "bg-white text-amber-700 shadow-sm font-black border border-amber-100"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Lvl 2
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 px-1.5 py-0 h-4 text-[9px] font-black shrink-0">
                {users.filter(u => String(u.level) === "2").length}
              </Badge>
            </button>
            <button
              onClick={() => setLevelFilter("3")}
              className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                levelFilter === "3"
                  ? "bg-white text-green-700 shadow-sm font-black border border-green-100"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Lvl 3
              <Badge variant="secondary" className="bg-green-50 text-green-700 px-1.5 py-0 h-4 text-[9px] font-black shrink-0">
                {users.filter(u => String(u.level) === "3").length}
              </Badge>
            </button>
          </div>
        </div>

        <Card className="shadow-card border-none overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm text-left border-collapse">
                <thead className="bg-muted/50 text-muted-foreground font-medium text-[10px] uppercase tracking-wider border-b">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Level</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">UPI ID</th>
                    <th className="px-5 py-4">Active Project</th>
                    <th className="px-5 py-4">Jobs Posted</th>
                    <th className="px-5 py-4">Jobs Worked</th>
                    <th className="px-5 py-4">Wallet</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.length === 0 && !loading ? (
                    <tr><td colSpan={11} className="px-6 py-12 text-center text-muted-foreground italic">No users found under this filter.</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/5 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                              {user.full_name?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-foreground text-sm">{user.full_name}</div>
                              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Mail className="h-2 w-2" /> {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="outline" className={`text-[9px] font-black h-5 uppercase
                            ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              user.role === 'poster' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="outline" className={`text-[9px] font-black h-5 uppercase
                            ${user.level === 3 ? 'bg-green-50 text-green-700 border-green-200 animate-pulse' :
                              user.level === 2 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            Lvl {user.level || 1}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="outline" className={`text-[9px] font-black h-5 uppercase
                            ${user.verification_status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' :
                              user.verification_status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-muted text-muted-foreground'}`}>
                            {user.verification_status === 'verified' ? <CheckCircle className="h-2 w-2 mr-1" /> :
                             user.verification_status === 'pending' ? <Clock className="h-2 w-2 mr-1" /> :
                             <AlertTriangle className="h-2 w-2 mr-1" />}
                            {user.verification_status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          {user.upi_id ? (
                            <div className="space-y-1">
                              <span className="text-xs font-mono text-foreground font-semibold">{user.upi_id}</span>
                              <div>
                                <Badge
                                  variant="outline"
                                  className={`text-[8px] font-black uppercase py-0 px-1 ${
                                    user.upi_verification_status === "verified" || user.upi_verified === true
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : user.upi_verification_status === "rejected"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  {user.upi_verification_status === "verified" || user.upi_verified === true
                                    ? "Verified ✅"
                                    : user.upi_verification_status === "rejected"
                                    ? "Rejected ❌"
                                    : "Pending Review ⏳"}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-destructive font-bold">Not set</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {user.active_project ? (
                            <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                              <Briefcase className="h-3 w-3 text-primary shrink-0" />
                              <span className="truncate max-w-[120px]">{user.active_project}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">None</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center text-sm font-bold text-foreground">
                          {user.total_jobs_posted || 0}
                        </td>
                        <td className="px-5 py-4 text-center text-sm font-bold text-foreground">
                          {user.total_jobs_worked || 0}
                        </td>
                        <td className="px-5 py-4 font-display font-bold text-foreground text-sm">
                          ₹{user.wallet_balance?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground tabular-nums">
                          {format(new Date(user.created_at), 'dd MMM yyyy')}
                        </td>
                        <td className="px-5 py-4">
                          <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => setSelectedUser(user)}>
                            <Eye className="h-3 w-3" /> View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Document Review Modal ── */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => { if (!open) { setSelectedRequest(null); setIsRejecting(false); setAdminNote(""); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Review: {selectedRequest?.full_name}</DialogTitle>
            <DialogDescription>Check the submitted documents carefully for authenticity.</DialogDescription>
          </DialogHeader>

          {!isRejecting ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Front of ID</Label>
                  <div className="aspect-[3/2] rounded-xl bg-muted overflow-hidden border flex items-center justify-center">
                    {docUrls?.front
                      ? <img src={docUrls.front} className="w-full h-full object-contain" alt="Front ID" />
                      : <div className="flex flex-col items-center gap-2 text-muted-foreground"><ImageOff className="h-8 w-8" /><p className="text-xs">No document uploaded</p></div>
                    }
                  </div>
                </div>
                {selectedRequest?.id_type !== 'student_id' && (
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Back of ID</Label>
                    <div className="aspect-[3/2] rounded-xl bg-muted overflow-hidden border flex items-center justify-center">
                      {docUrls?.back
                        ? <img src={docUrls.back} className="w-full h-full object-contain" alt="Back ID" />
                        : <div className="flex flex-col items-center gap-2 text-muted-foreground"><ImageOff className="h-8 w-8" /><p className="text-xs">No document uploaded</p></div>
                      }
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Selfie / Photo</Label>
                  <div className="aspect-[3/2] rounded-xl bg-muted overflow-hidden border flex items-center justify-center">
                    {docUrls?.selfie
                      ? <img src={docUrls.selfie} className="w-full h-full object-contain" alt="Selfie" />
                      : <div className="flex flex-col items-center gap-2 text-muted-foreground"><ImageOff className="h-8 w-8" /><p className="text-xs">No document uploaded</p></div>
                    }
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 space-y-2 text-xs">
                  <div><span className="text-muted-foreground">ID Type:</span> <strong className="capitalize">{selectedRequest?.id_type?.replace('_', ' ')}</strong></div>
                  <div><span className="text-muted-foreground">ID Number:</span> <strong className="font-mono">{selectedRequest?.id_number}</strong></div>
                  <div><span className="text-muted-foreground">Submitted:</span> <span>{selectedRequest?.created_at ? format(new Date(selectedRequest.created_at), 'dd MMM yyyy, hh:mm a') : 'N/A'}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <Label className="text-sm font-semibold">Reason for Rejection <span className="text-destructive">*</span></Label>
              <Input
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. ID photo is blurry / expired document"
                className="w-full"
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            {!isRejecting ? (
              <>
                <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => setIsRejecting(true)}>
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove()}>
                  <Check className="h-4 w-4 mr-1" /> Approve Verification
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsRejecting(false)}>Back</Button>
                <Button variant="destructive" onClick={() => handleReject()}>Confirm Rejection</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── User Detail Modal ── */}
      <Dialog open={!!selectedUser && !isDeletingUser} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              User Profile Details
            </DialogTitle>
            <DialogDescription>
              Detailed marketplace record and payout configuration.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} className="h-full w-full rounded-full object-cover" alt="avatar" />
                  ) : (
                    (selectedUser.full_name || "U").substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground truncate">{selectedUser.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Mail className="h-3 w-3 shrink-0" /> {selectedUser.email}
                  </p>
                  {selectedUser.phone && (
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 shrink-0" /> {selectedUser.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Card className="bg-muted/30">
                  <CardContent className="p-3">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Role / Level</p>
                    <p className="font-bold text-foreground capitalize">{selectedUser.role || 'Member'} • Lvl {selectedUser.level || 1}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-3">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">ID Verification</p>
                    <Badge variant="outline" className={`text-[9px] font-black uppercase
                      ${selectedUser.verification_status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' :
                        selectedUser.verification_status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-muted text-muted-foreground'}`}>
                      {selectedUser.verification_status}
                    </Badge>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-3">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Jobs Posted</p>
                    <p className="text-sm font-black text-foreground">{selectedUser.total_jobs_posted || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 col-span-2">
                  <CardContent className="p-3">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Jobs Worked</p>
                    <p className="text-sm font-black text-foreground">{selectedUser.total_jobs_worked || 0}</p>
                  </CardContent>
                </Card>
              </div>

              {/* UPI ID Card with Manual Verification Action Buttons */}
              <Card className={
                selectedUser.upi_verification_status === "verified" || selectedUser.upi_verified === true
                  ? "bg-green-50/80 border-green-200"
                  : selectedUser.upi_verification_status === "rejected"
                  ? "bg-red-50/80 border-red-200"
                  : selectedUser.upi_id
                  ? "bg-amber-50/80 border-amber-200"
                  : "bg-red-50/80 border-red-200"
              }>
                <CardContent className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground">UPI ID Payout Configuration</p>
                      <p className="text-sm font-mono font-bold text-foreground">
                        {selectedUser.upi_id || 'Not set — user has not added UPI'}
                      </p>
                    </div>
                    {selectedUser.upi_id && (
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-black uppercase py-0.5 px-2 ${
                          selectedUser.upi_verification_status === "verified" || selectedUser.upi_verified === true
                            ? "bg-green-100 text-green-800 border-green-300"
                            : selectedUser.upi_verification_status === "rejected"
                            ? "bg-red-100 text-red-800 border-red-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        {selectedUser.upi_verification_status === "verified" || selectedUser.upi_verified === true
                          ? "Verified ✅"
                          : selectedUser.upi_verification_status === "rejected"
                          ? "Rejected ❌"
                          : "Pending Admin Review ⏳"}
                      </Badge>
                    )}
                  </div>

                  {selectedUser.upi_id && (
                    <div className="flex items-center gap-2 pt-2 border-t border-muted/40">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 gap-1 font-bold shadow-xs"
                        disabled={upiUpdatingId === selectedUser.id || selectedUser.upi_verification_status === "verified" || selectedUser.upi_verified === true}
                        onClick={() => handleApproveUpi(selectedUser.id)}
                      >
                        <Check className="h-3.5 w-3.5" /> Approve UPI ID
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7 gap-1 font-bold"
                        disabled={upiUpdatingId === selectedUser.id || selectedUser.upi_verification_status === "rejected"}
                        onClick={() => {
                          setRejectingUpiUser(selectedUser);
                          setUpiRejectReason("");
                        }}
                      >
                        <X className="h-3.5 w-3.5" /> Reject UPI ID
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedUser.active_project && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[10px] text-blue-600 font-black uppercase">Active Project</p>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600 shrink-0" />
                      <p className="text-sm font-bold text-blue-800">{selectedUser.active_project}</p>
                    </div>
                    {selectedUser.bid_price && (
                      <div className="flex items-center justify-between pt-1 border-t border-blue-200">
                        <span className="text-xs text-blue-600 font-bold">Accepted Bid Price</span>
                        <span className="text-base font-black text-green-700 flex items-center gap-1">
                          <IndianRupee className="h-3.5 w-3.5" />{selectedUser.bid_price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <div>Account ID: <span className="font-mono">{selectedUser.id}</span></div>
                <div>Joined: {format(new Date(selectedUser.created_at), 'dd MMMM yyyy')}</div>
              </div>
            </div>
          )}
          <DialogFooter className="flex items-center justify-between gap-2 border-t pt-4">
            <Button
              variant="destructive"
              className="gap-1.5 font-bold text-xs"
              onClick={() => setIsDeletingUser(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete User & History
            </Button>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject UPI ID Modal ── */}
      <Dialog open={!!rejectingUpiUser} onOpenChange={(open) => !open && setRejectingUpiUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
              <CreditCard className="h-5 w-5 text-destructive" />
              Reject UPI ID & Send Formal Notice
            </DialogTitle>
            <DialogDescription className="pt-1">
              Reject the submitted UPI ID (<strong className="font-mono text-foreground">{rejectingUpiUser?.upi_id}</strong>) for user <strong>{rejectingUpiUser?.full_name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label className="text-xs font-bold text-foreground">Rejection Reason (Emailed to User)</Label>
            <Input
              value={upiRejectReason}
              onChange={(e) => setUpiRejectReason(e.target.value)}
              placeholder="e.g. Invalid VPA handle / Name mismatch with bank record"
              className="text-sm"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              A formal email notice with instructions to update their UPI ID will be dispatched to <strong className="text-foreground">{rejectingUpiUser?.email}</strong>.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectingUpiUser(null)} disabled={!!upiUpdatingId}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRejectUpi}
              disabled={!!upiUpdatingId}
              className="gap-2 font-bold"
            >
              {upiUpdatingId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {upiUpdatingId ? "Sending Notice..." : "Confirm & Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Delete User Modal ── */}
      <Dialog open={isDeletingUser} onOpenChange={(open) => !open && !deleting && setIsDeletingUser(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete User & Entire History?
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to permanently delete <strong className="text-foreground">{selectedUser?.full_name}</strong> (<span className="font-mono text-xs">{selectedUser?.email}</span>)?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-xs text-destructive space-y-2 font-medium">
            <p className="font-bold uppercase tracking-wider text-[10px]">⚠️ Warning: Irreversible Action</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>All jobs posted by this user will be deleted.</li>
              <li>All bids, submissions, and active assignments will be deleted.</li>
              <li>All escrow records, verification docs, and notifications will be wiped from the database.</li>
              <li>This user profile will be completely erased.</li>
            </ul>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeletingUser(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleting} className="gap-2 font-bold">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleting ? "Deleting Everything..." : "Permanently Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;

import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserCheck, UserX, Shield, Mail, CheckCircle, Clock,
  AlertTriangle, Eye, X, Check, Briefcase, IndianRupee, ImageOff
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";

const AdminUsers = () => {
  const {
    fetchAllUsers, fetchPendingVerifications, approveVerification,
    rejectVerification, getSignedUrls
  } = useAdmin();

  const [users, setUsers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [docUrls, setDocUrls] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // User detail modal
  const [selectedUser, setSelectedUser] = useState<any>(null);

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
        <h2 className="font-display font-bold text-foreground flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-accent" />
          Active Marketplace Members
        </h2>
        <Card className="shadow-card border-none overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-muted/50 text-muted-foreground font-medium text-[10px] uppercase tracking-wider border-b">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Active Project</th>
                    <th className="px-5 py-4">Accepted Bid</th>
                    <th className="px-5 py-4">Wallet</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.length === 0 && !loading ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No users registered yet.</td></tr>
                  ) : (
                    users.map((user) => (
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
                          {user.active_project ? (
                            <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                              <Briefcase className="h-3 w-3 text-primary shrink-0" />
                              <span className="truncate max-w-[140px]">{user.active_project}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No active project</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {user.bid_price ? (
                            <div className="flex items-center gap-1 text-sm font-black text-green-700">
                              <IndianRupee className="h-3 w-3" />
                              {user.bid_price.toLocaleString('en-IN')}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
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
                  <Label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Selfie with ID</Label>
                  <div className="aspect-[3/2] rounded-xl bg-muted overflow-hidden border flex items-center justify-center">
                    {docUrls?.selfie
                      ? <img src={docUrls.selfie} className="w-full h-full object-contain" alt="Selfie" />
                      : <div className="flex flex-col items-center gap-2 text-muted-foreground"><ImageOff className="h-8 w-8" /><p className="text-xs">No selfie uploaded</p></div>
                    }
                  </div>
                </div>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground">ID Number:</span>
                      <span className="text-sm font-black text-foreground">{selectedRequest?.id_number || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground">ID Type:</span>
                      <span className="text-sm font-black text-foreground uppercase">{selectedRequest?.id_type?.replace('_', ' ') || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground">Submitted:</span>
                      <span className="text-sm font-black text-foreground">{selectedRequest?.created_at ? format(new Date(selectedRequest.created_at), 'dd MMM yyyy') : '—'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="py-8 space-y-4 max-w-md mx-auto text-center">
              <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg">Reject Verification</h3>
              <p className="text-sm text-muted-foreground">Specify why the documents were rejected. This will be shown to the user.</p>
              <div className="text-left space-y-2 pt-4">
                <Label>Rejection Reason</Label>
                <Input placeholder="e.g. Image blurry, ID expired, Number mismatch" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} autoFocus />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {!isRejecting ? (
              <>
                <Button variant="outline" onClick={() => setIsRejecting(true)}><X className="mr-2 h-4 w-4" /> Reject Request</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove()}><Check className="mr-2 h-4 w-4" /> Approve & Verify</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setIsRejecting(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleReject()}>Confirm Rejection</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── User Detail Modal ── */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Full profile and project information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-2">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xl">
                  {selectedUser.full_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground">{selectedUser.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-muted/30">
                  <CardContent className="p-3">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Verification</p>
                    <Badge variant="outline" className={`text-[10px] font-black uppercase
                      ${selectedUser.verification_status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' :
                        selectedUser.verification_status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-muted text-muted-foreground'}`}>
                      {selectedUser.verification_status}
                    </Badge>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-3">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Wallet Balance</p>
                    <p className="text-sm font-black text-foreground">₹{selectedUser.wallet_balance?.toLocaleString('en-IN') || 0}</p>
                  </CardContent>
                </Card>
              </div>

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

              <div className="text-xs text-muted-foreground">
                Joined: {format(new Date(selectedUser.created_at), 'dd MMMM yyyy')}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;

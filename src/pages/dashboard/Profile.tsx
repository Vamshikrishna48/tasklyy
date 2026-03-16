import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { UserCircle, Mail, Phone, Star, Briefcase, Calendar } from "lucide-react";

const Profile = () => {
  const { currentUser } = useApp();

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Your Information</h1>
        <p className="text-muted-foreground mt-1">View and manage your profile details.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {currentUser.avatar}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">{currentUser.name}</h2>
                <p className="text-sm text-muted-foreground">Student Member</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Email</p>
                  <p className="text-sm font-semibold text-foreground">{currentUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Contact</p>
                  <p className="text-sm font-semibold text-foreground">{currentUser.contact || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Rating</p>
                  <p className="text-sm font-semibold text-foreground">⭐ {currentUser.rating} / 5.0</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Completed Jobs</p>
                  <p className="text-sm font-semibold text-foreground">{currentUser.completedJobs} jobs</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <UserCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">University</p>
                  <p className="text-sm font-semibold text-foreground">{currentUser.campus || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Member Since</p>
                  <p className="text-sm font-semibold text-foreground">2026</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;

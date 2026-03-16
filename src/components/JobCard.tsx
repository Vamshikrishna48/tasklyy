import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, Zap, AlertTriangle, BookOpen } from "lucide-react";
import { Job } from "@/data/mockData";
import { motion } from "framer-motion";

interface JobCardProps {
  job: Job;
  index?: number;
}

const JobCard = ({ job, index = 0 }: JobCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/jobs/${job.id}`}>
        <Card className="group cursor-pointer shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex flex-col gap-2 items-start">
                <Badge variant="category">{job.category}</Badge>
                {job.rescueMode && (
                  <Badge className="bg-orange-500 animate-pulse hover:bg-orange-600">
                    Rescue Mode Activated!
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <span className="font-display text-lg font-bold text-primary block">
                  {job.paymentType === "skill" ? "Skill Swap" : `₹${job.budget}`}
                </span>
                {job.paymentType === "skill" && (
                  <span className="text-xs text-muted-foreground block max-w-[120px] truncate" title={job.skillExchangeDetails}>
                    Offers: {job.skillExchangeDetails}
                  </span>
                )}
              </div>
            </div>

            <h3 className="mb-2 font-display text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
              {job.title}
            </h3>

            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
              {job.description}
            </p>

            <div className="mb-3 flex flex-wrap gap-1.5">
              {job.isUrgent && (
                <Badge variant="outline" className="text-xs border-rose-500 text-rose-600 bg-rose-50 gap-1 pb-0.5">
                  <AlertTriangle className="w-3 h-3" /> Urgent {job.urgentTime && `(${job.urgentTime})`}
                </Badge>
              )}
              {job.isQuickTask && (
                <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 bg-amber-50 gap-1 pb-0.5">
                  <Zap className="w-3 h-3" /> 10 Min Task
                </Badge>
              )}
              {job.isMentoring && (
                <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 bg-blue-50 gap-1 pb-0.5">
                  <BookOpen className="w-3 h-3" /> Mentoring
                </Badge>
              )}
              {job.campusOnly && (
                <Badge variant="outline" className="text-xs border-green-500 text-green-600 bg-green-50 gap-1 pb-0.5">
                  🎓 Campus Only
                </Badge>
              )}
              {job.isTeamTask && (
                <Badge variant="outline" className="text-xs border-purple-500 text-purple-600 bg-purple-50 gap-1 pb-0.5">
                  <Users className="w-3 h-3" /> Team ({job.teamRoles?.length})
                </Badge>
              )}
              {job.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {job.postedBy.avatar}
                </div>
                <div className="text-xs">
                  <span className="font-medium text-foreground">{job.postedBy.name}</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    {job.postedBy.rating}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default JobCard;

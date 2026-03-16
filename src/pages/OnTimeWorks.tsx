import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import JobCard from "@/components/JobCard";
import Navbar from "@/components/Navbar";

const OnTimeWorks = () => {
  const [search, setSearch] = useState("");
  
  // Advanced Filters moved here
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { jobs, currentUser } = useApp();

  // ONLY include jobs that have one of the special toggles
  const specialJobs = jobs.filter(job => 
    job.isUrgent || 
    job.isQuickTask || 
    job.campusOnly || 
    job.isMentoring || 
    job.isTeamTask
  );

  const filteredJobs = specialJobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());
      
    const matchesUrgent = activeFilter !== "urgent" || job.isUrgent;
    const matchesQuick = activeFilter !== "quick" || job.isQuickTask;
    const matchesCampus = activeFilter !== "campus" || (job.campusOnly && job.campusName === currentUser.campus);
    const matchesMentoring = activeFilter !== "mentoring" || job.isMentoring;
    const matchesTeam = activeFilter !== "team" || job.isTeamTask;

    return matchesSearch && matchesUrgent && matchesQuick && matchesCampus && matchesMentoring && matchesTeam;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold flex items-center gap-2 text-foreground">
            <Clock className="w-8 h-8 text-primary" /> On Time Works
          </h1>
          <p className="mt-1 text-muted-foreground">
            {filteredJobs.length} special task{filteredJobs.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search urgent tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <Badge
            variant={activeFilter === "urgent" ? "default" : "outline"}
            className={`cursor-pointer ${activeFilter === "urgent" ? "bg-rose-500 hover:bg-rose-600" : ""}`}
            onClick={() => setActiveFilter(activeFilter === "urgent" ? null : "urgent")}
          >
            🚨 Emergency Help (Urgent)
          </Badge>
          <Badge
            variant={activeFilter === "quick" ? "default" : "outline"}
            className={`cursor-pointer ${activeFilter === "quick" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
            onClick={() => setActiveFilter(activeFilter === "quick" ? null : "quick")}
          >
            ⚡ 10 Minute Quick Task
          </Badge>
          <Badge
            variant={activeFilter === "campus" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveFilter(activeFilter === "campus" ? null : "campus")}
          >
            🎓 Campus Only ({currentUser.campus})
          </Badge>
          <Badge
            variant={activeFilter === "team" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveFilter(activeFilter === "team" ? null : "team")}
          >
            👥 Team Task
          </Badge>
          <Badge
            variant={activeFilter === "mentoring" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveFilter(activeFilter === "mentoring" ? null : "mentoring")}
          >
            📚 Mentoring / Learning Mode
          </Badge>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No special tasks found matching your criteria.</p>
            <Button variant="ghost" className="mt-4" onClick={() => { 
                setSearch(""); 
                setActiveFilter(null);
              }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnTimeWorks;

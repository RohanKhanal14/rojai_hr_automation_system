"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getMyApplicationsAction, ApplicationSummary } from "@/lib/actions";
import { useAuth } from "@/lib/auth-context";
import CandidateNavbar from "@/components/CandidateNavbar";
import {
  FileText,
  Briefcase,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  Star,
  ChevronRight,
  Target,
  Sparkles,
  Calendar,
  Building2,
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: "submitted" | "under-review" | "interview" | "rejected" | "offered";
  atsScore?: number;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  submitted: {
    label: "Submitted",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    dot: "bg-slate-400",
  },
  "under-review": {
    label: "Under Review",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },
  interview: {
    label: "Interview",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    dot: "bg-purple-400",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    dot: "bg-red-400",
  },
  offered: {
    label: "Offered 🎉",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
};

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  isLoading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  isLoading: boolean;
}) {
  return (
    <Card className="relative p-5 border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet-500/30 transition-all duration-300 overflow-hidden group">
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${bgClass} blur-2xl`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">
            {label}
          </p>
          <p className="text-3xl font-bold text-white">
            {isLoading ? (
              <span className="inline-block w-8 h-8 rounded-md bg-white/10 animate-pulse" />
            ) : (
              value
            )}
          </p>
        </div>
        <div
          className={`p-2.5 rounded-xl ${bgClass.replace("blur-2xl", "")} border border-white/5`}
        >
          <Icon size={20} className={colorClass} />
        </div>
      </div>
    </Card>
  );
}

function ATSRing({ score }: { score?: number }) {
  if (typeof score !== "number") return null;
  const pct = Math.min(100, Math.max(0, Math.round(score)));
  const color =
    pct >= 70
      ? "text-emerald-400"
      : pct >= 40
      ? "text-amber-400"
      : "text-red-400";
  return (
    <span className={`text-xs font-semibold ${color}`}>{pct}% ATS</span>
  );
}

export default function CandidateDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplied: 0,
    underReview: 0,
    interviewsPending: 0,
    decisionsReceived: 0,
  });

  const candidateName =
    user?.candidateId?.fullName?.split(" ")[0] || "there";

  const mapApiStatusToUI = (
    apiStatus: string
  ): Application["status"] => {
    const statusMap: { [key: string]: Application["status"] } = {
      Applied: "submitted",
      Shortlisted: "interview",
      "Under-Review": "under-review",
      "Interview Scheduled": "interview",
      "Interview Completed": "interview",
      "Not Selected": "rejected",
    };
    return statusMap[apiStatus] || "submitted";
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const result = await getMyApplicationsAction();

        if (result.success) {
          const fetchedApps: Application[] = (result.data.applications || [])
            .filter((app: ApplicationSummary) => app.jobId)
            .map((app: ApplicationSummary) => ({
              id: app._id,
              jobTitle: app.jobId?.position || "Unknown Position",
              company: app.jobId?.department || "Unknown Department",
              appliedDate: app.appliedAt || new Date().toISOString(),
              status: mapApiStatusToUI(app.status),
              atsScore: app.atsScore,
            }));

          setApplications(fetchedApps);

          setStats({
            totalApplied: fetchedApps.length,
            underReview: fetchedApps.filter(
              (a) => a.status === "under-review"
            ).length,
            interviewsPending: fetchedApps.filter(
              (a) => a.status === "interview"
            ).length,
            decisionsReceived: fetchedApps.filter(
              (a) => a.status === "rejected" || a.status === "offered"
            ).length,
          });
        } else {
          toast.error(result.message || "Failed to fetch applications");
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to fetch applications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const statItems = [
    {
      label: "Jobs Applied",
      value: stats.totalApplied.toString(),
      icon: Briefcase,
      colorClass: "text-violet-400",
      bgClass: "bg-violet-500/10",
    },
    {
      label: "Under Review",
      value: stats.underReview.toString(),
      icon: Clock,
      colorClass: "text-amber-400",
      bgClass: "bg-amber-500/10",
    },
    {
      label: "Interviews",
      value: stats.interviewsPending.toString(),
      icon: FileText,
      colorClass: "text-blue-400",
      bgClass: "bg-blue-500/10",
    },
    {
      label: "Decisions",
      value: stats.decisionsReceived.toString(),
      icon: CheckCircle2,
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <CandidateNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero greeting */}
        <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-violet-400" />
              <span className="text-xs text-violet-400 font-medium uppercase tracking-wider">
                Candidate Portal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {candidateName}
              </span>{" "}
              👋
            </h1>
            <p className="text-slate-400 text-base max-w-lg">
              Track your applications, interview progress, and discover new
              opportunities — all in one place.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((stat) => (
            <StatCard key={stat.label} {...stat} isLoading={isLoading} />
          ))}
        </div>

        {/* Browse Jobs CTA */}
        <div className="relative rounded-2xl overflow-hidden border border-violet-500/30 bg-gradient-to-r from-violet-600/15 via-purple-600/10 to-transparent p-6 sm:p-8">
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-violet-500/20 border border-violet-500/20">
                <Target size={22} className="text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Looking for more opportunities?
                </h3>
                <p className="text-slate-400 text-sm">
                  Browse active job openings and apply now
                </p>
              </div>
            </div>
            <Link href="/candidate/jobs" className="shrink-0">
              <Button className="bg-violet-600 hover:bg-violet-500 text-white gap-2 px-6 shadow-lg shadow-violet-500/20">
                Browse Jobs
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Applications Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white">My Applications</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Track the status of all your job applications
              </p>
            </div>
            {applications.length > 0 && (
              <span className="text-xs text-slate-500 bg-white/5 border border-white/5 rounded-full px-3 py-1">
                {applications.length} total
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/[0.02] border border-white/5 p-5 animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2.5">
                      <div className="h-4 w-44 bg-white/5 rounded-md" />
                      <div className="flex gap-3">
                        <div className="h-3 w-24 bg-white/5 rounded-md" />
                        <div className="h-3 w-20 bg-white/5 rounded-md" />
                      </div>
                    </div>
                    <div className="h-7 w-24 bg-white/5 rounded-lg shrink-0 hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4 border border-violet-500/20">
                <Briefcase size={28} className="text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No applications yet
              </h3>
              <p className="text-slate-500 text-sm text-center max-w-xs mb-6">
                Start applying to jobs to track your progress here
              </p>
              <Link href="/candidate/jobs">
                <Button className="bg-violet-600 hover:bg-violet-500 text-white gap-2">
                  <Plus size={18} />
                  Browse Jobs
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {applications.map((app) => {
                const cfg = statusConfig[app.status] || statusConfig.submitted;
                return (
                  <Link
                    key={app.id}
                    href={`/candidate/applications/${app.id}`}
                    className="block"
                  >
                    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/20 transition-all duration-200 cursor-pointer">
                      <div className="flex items-start gap-4 min-w-0">
                        {/* Company initial icon */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/10 flex items-center justify-center shrink-0">
                          <Building2 size={18} className="text-violet-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                              {app.jobTitle}
                            </h3>
                            {typeof app.atsScore === "number" && (
                              <ATSRing score={app.atsScore} />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 size={12} />
                              {app.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(app.appliedDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-14 sm:ml-0">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                          />
                          {cfg.label}
                        </span>
                        <ChevronRight
                          size={18}
                          className="text-slate-600 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips section */}
        {!isLoading && (
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            {[
              {
                icon: TrendingUp,
                color: "text-violet-400",
                bg: "bg-violet-500/10",
                title: "Boost Your ATS Score",
                tip: "Tailor your CV keywords to match each job description for a higher ATS match rate.",
              },
              {
                icon: Star,
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                title: "Interview Prep",
                tip: "Research the company culture, review role requirements and prepare STAR-format answers.",
              },
              {
                icon: Briefcase,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                title: "Keep Applying",
                tip: "Applying to multiple relevant positions increases your chances of landing the right role.",
              },
            ].map(({ icon: Icon, color, bg, title, tip }) => (
              <div
                key={title}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
              >
                <div
                  className={`w-9 h-9 rounded-lg ${bg} border border-white/5 flex items-center justify-center mb-3`}
                >
                  <Icon size={18} className={color} />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  {title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

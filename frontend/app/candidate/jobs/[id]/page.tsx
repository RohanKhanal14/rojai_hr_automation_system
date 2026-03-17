"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getJobByIdAction, getMyApplicationsAction, type Job, type JobSalary } from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CandidateNavbar from "@/components/CandidateNavbar";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  AlertCircle,
  Clock,
  Loader2,
  CheckCircle2,
  Star,
  ChevronRight,
  Building2,
  Zap,
} from "lucide-react";

function formatSalary(salary?: JobSalary): string {
  if (!salary) return "";
  if (salary.type === "negotiable") return "Negotiable";
  const period = salary.period === "yearly" ? "/yr" : "/mo";
  if (salary.type === "fixed")
    return `NPR ${salary.max?.toLocaleString()}${period}`;
  return `NPR ${salary.min?.toLocaleString()} – ${salary.max?.toLocaleString()}${period}`;
}

function daysLeft(deadline: string): string {
  const diff = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / 86400000
  );
  if (diff < 0) return "Closed";
  if (diff === 0) return "Last day";
  return `${diff} days left`;
}

function parseDescriptionToList(text: string): string[] | null {
  if (!text) return null;
  const lines = text
    .split(/\n/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter((l) => l.length > 5);
  if (lines.length >= 3) return lines;
  return null;
}

export default function CandidateJobDetailPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    getJobByIdAction(params.id).then((res) => {
      if (res.success) {
        setJob(res.data.jobsInfo);
      } else {
        setError(res.message);
      }
      setLoading(false);
    });
    // Check if candidate has already applied for this job
    getMyApplicationsAction().then((res) => {
      if (res.success) {
        const hasApplied = res.data.applications.some(
          (app) => app.jobId?._id === params.id
        );
        setAlreadyApplied(hasApplied);
      }
    });
  }, [params?.id]);

  const salaryText = useMemo(() => formatSalary(job?.salary), [job?.salary]);
  const deadlineText = job ? daysLeft(job.deadline) : "";
  const isClosed = deadlineText === "Closed";
  const isUrgent =
    job &&
    !isClosed &&
    (deadlineText === "Last day" || parseInt(deadlineText) <= 3);

  const descriptionList = useMemo(
    () => (job?.description ? parseDescriptionToList(job.description) : null),
    [job?.description]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27]">
        <CandidateNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
          {/* Back link skeleton */}
          <div className="h-4 w-36 bg-white/5 rounded-md" />

          {/* Hero card skeleton */}
          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-white/5" />
              <div className="space-y-2.5 flex-1">
                <div className="h-7 w-64 bg-white/5 rounded-lg" />
                <div className="h-4 w-32 bg-white/5 rounded-md" />
              </div>
              <div className="h-7 w-20 bg-white/5 rounded-lg shrink-0" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 bg-white/5 rounded-md" />
                  <div className="h-4 w-24 bg-white/5 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* About section skeleton */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="h-5 w-36 bg-white/5 rounded-md mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-4 h-4 rounded-full bg-white/5 shrink-0 mt-0.5" />
                  <div className="h-4 bg-white/5 rounded-md" style={{ width: `${70 + Math.random() * 25}%` }} />
                </div>
              ))}
            </div>
          </div>

          {/* Skills skeleton */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="h-5 w-32 bg-white/5 rounded-md mb-4" />
            <div className="flex flex-wrap gap-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-9 w-24 bg-white/5 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Hiring process skeleton */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="h-5 w-64 bg-white/5 rounded-md mb-6" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
                  <div className="h-4 bg-white/5 rounded-md" style={{ width: `${50 + Math.random() * 30}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#0a0e27]">
        <CandidateNavbar />
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <p className="text-red-400 font-medium mb-2">
            {error || "Position not found."}
          </p>
          <p className="text-slate-500 text-sm mb-6">
            This position may have been removed or is no longer available.
          </p>
          <Link href="/candidate/jobs">
            <Button variant="outline">Back to Positions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] pb-28">
      <CandidateNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back link */}
        <Link
          href="/candidate/jobs"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-violet-400 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Positions
        </Link>

        {/* Urgency alert */}
        {isUrgent && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <Clock size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Deadline Approaching
              </p>
              <p className="text-xs text-amber-500 mt-0.5">
                Only <strong>{deadlineText}</strong> to apply for this position.
              </p>
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-8">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-violet-500/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Building2 size={24} className="text-violet-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {job.position}
                  </h1>
                  <p className="text-violet-400 font-medium">{job.department}</p>
                </div>
              </div>
              <Badge
                className={`shrink-0 border text-sm px-3 py-1 ${
                  isClosed
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
              >
                {isClosed ? "Closed" : job.status || "Active"}
              </Badge>
            </div>

            {/* Key metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Experience
                </p>
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Briefcase size={14} className="text-violet-400" />
                  {job.experienceLevel}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Location
                </p>
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <MapPin size={14} className="text-violet-400" />
                  {job.remote ? "Remote" : job.location ?? "N/A"}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Deadline
                </p>
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Calendar size={14} className="text-violet-400" />
                  {new Date(job.deadline).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
              {salaryText && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    Salary
                  </p>
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <DollarSign size={14} className="text-violet-400" />
                    {salaryText}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About this role */}
        <Card className="p-6 border-white/5 bg-white/[0.02]">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Zap size={16} className="text-violet-400" />
            About This Role
          </h2>
          {descriptionList ? (
            <ul className="space-y-2">
              {descriptionList.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                  <CheckCircle2
                    size={15}
                    className="text-violet-500 shrink-0 mt-0.5"
                  />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 leading-relaxed text-sm whitespace-pre-wrap">
              {job.description}
            </p>
          )}
        </Card>

        {/* Skills */}
        {((job.mustHaveSkills && job.mustHaveSkills.length > 0) ||
          (job.niceToHaveSkills && job.niceToHaveSkills.length > 0)) && (
          <Card className="p-6 border-white/5 bg-white/[0.02]">
            {job.mustHaveSkills && job.mustHaveSkills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                    <Star size={14} className="text-amber-400" />
                  </div>
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {job.mustHaveSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-br from-violet-500/15 to-purple-500/10 text-violet-200 border border-violet-500/20 hover:border-violet-400/40 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
              <div>
                {job.mustHaveSkills && job.mustHaveSkills.length > 0 && (
                  <div className="border-t border-white/5 mb-6" />
                )}
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-500/15 border border-slate-500/20 flex items-center justify-center">
                    <Star size={14} className="text-slate-400" />
                  </div>
                  Nice-to-Have Skills
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {job.niceToHaveSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/[0.04] text-slate-300 border border-white/[0.08] hover:border-white/20 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* What you can expect card */}
        <Card className="p-6 border-white/5 bg-white/[0.02] overflow-hidden">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 size={14} className="text-emerald-400" />
            </div>
            What to Expect in the Hiring Process
          </h3>
          <div className="relative space-y-0">
            {/* Vertical connector line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-violet-500/40 via-purple-500/30 to-emerald-500/40" />
            {[
              { step: "Submit your application and CV", icon: "📄", color: "from-blue-500/20 to-blue-600/10 border-blue-500/20" },
              { step: "Automated ATS screening for keyword match", icon: "⚡", color: "from-violet-500/20 to-violet-600/10 border-violet-500/20" },
              { step: "HR review and shortlisting", icon: "👁️", color: "from-purple-500/20 to-purple-600/10 border-purple-500/20" },
              { step: "AI-powered structured interview", icon: "🎙️", color: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20" },
              { step: "Final decision notification", icon: "🎉", color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20" },
            ].map(({ step, icon, color }, i) => (
              <div key={i} className="relative flex items-center gap-4 py-3 group">
                <div className={`relative z-10 w-8 h-8 rounded-full bg-gradient-to-br ${color} border flex items-center justify-center shrink-0 text-sm group-hover:scale-110 transition-transform duration-200`}>
                  {icon}
                </div>
                <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sticky Apply Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-[#0a0e27]/95 backdrop-blur-xl px-4 py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-white text-sm">{job.position}</p>
            <p className="text-xs text-slate-500">
              {isClosed
                ? "Applications are closed"
                : `Deadline: ${new Date(job.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
            </p>
          </div>
          {isClosed ? (
            <Button
              disabled
              className="w-full sm:w-auto sm:min-w-48 bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"
            >
              Position Closed
            </Button>
          ) : alreadyApplied ? (
            <Button
              disabled
              className="w-full sm:w-auto sm:min-w-48 bg-emerald-500/10 text-emerald-400 cursor-not-allowed border border-emerald-500/20 gap-2"
            >
              <CheckCircle2 size={18} />
              Already Applied
            </Button>
          ) : (
            <Link
              href={`/candidate/jobs/${job._id}/apply`}
              className="w-full sm:w-auto sm:min-w-48"
            >
              <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white gap-2 shadow-lg shadow-violet-500/20">
                Apply Now
                <ChevronRight size={18} />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

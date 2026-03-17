"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getApplicationByIdAction,
  type ApplicationDetail,
  type ApplicationStatus,
} from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CandidateNavbar from "@/components/CandidateNavbar";
import {
  ArrowLeft,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Zap,
  ChevronRight,
  Loader2,
  MessageSquare,
  Trophy,
  AlertCircle,
} from "lucide-react";

const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string; step: number; color: string }
> = {
  Applied: {
    label: "Applied",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    step: 2,
    color: "text-blue-400",
  },
  Shortlisted: {
    label: "Shortlisted",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    step: 4,
    color: "text-emerald-400",
  },
  "Not Selected": {
    label: "Not Selected",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
    step: 4,
    color: "text-red-400",
  },
  "Under-Review": {
    label: "Under Review",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    step: 3,
    color: "text-amber-400",
  },
  "Interview Scheduled": {
    label: "Interview Scheduled",
    className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    step: 4,
    color: "text-purple-400",
  },
  "Interview Completed": {
    label: "Interview Completed",
    className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    step: 4,
    color: "text-cyan-400",
  },
};

const TIMELINE = [
  { label: "Submitted", icon: FileText },
  { label: "ATS Scored", icon: Zap },
  { label: "HR Review", icon: Building2 },
  { label: "Decision", icon: CheckCircle2 },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ATSGauge({ score }: { score?: number | null }) {
  if (typeof score !== "number")
    return (
      <p className="text-2xl font-bold text-slate-400">N/A</p>
    );
  const pct = Math.min(100, Math.max(0, Math.round(score)));
  const colorClass =
    pct >= 70
      ? "text-emerald-400"
      : pct >= 40
      ? "text-amber-400"
      : "text-red-400";
  const bgClass =
    pct >= 70
      ? "bg-emerald-500"
      : pct >= 40
      ? "bg-amber-500"
      : "bg-red-500";
  return (
    <div className="space-y-3">
      <p className={`text-3xl font-bold ${colorClass}`}>{pct}%</p>
      <div className="w-full h-2 rounded-full bg-white/10">
        <div
          className={`h-2 rounded-full ${bgClass} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">
        {pct >= 70
          ? "Strong match — your CV aligns well!"
          : pct >= 40
          ? "Moderate match — consider tailoring your CV"
          : "Low match — keywords may need improvement"}
      </p>
    </div>
  );
}

export default function CandidateApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const [application, setApplication] = useState<ApplicationDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    getApplicationByIdAction(params.id).then((res) => {
      if (res.success) {
        setApplication(res.data);
      } else {
        setError(res.message);
      }
      setLoading(false);
    });
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27]">
        <CandidateNavbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
          {/* Back link skeleton */}
          <div className="h-4 w-36 bg-white/5 rounded-md" />

          {/* Hero card skeleton */}
          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent p-8">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5" />
              <div className="space-y-2.5 flex-1">
                <div className="h-6 w-56 bg-white/5 rounded-lg" />
                <div className="h-4 w-32 bg-white/5 rounded-md" />
                <div className="h-3 w-40 bg-white/5 rounded-md" />
              </div>
              <div className="h-8 w-28 bg-white/5 rounded-lg shrink-0" />
            </div>
          </div>

          {/* Timeline skeleton */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="h-3 w-36 bg-white/5 rounded-md mb-6" />
            <div className="flex items-start justify-between">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-10 h-10 rounded-full bg-white/5" />
                  <div className="h-3 w-16 bg-white/5 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* ATS + AI Summary skeleton */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 rounded bg-white/5" />
                  <div className="h-4 w-28 bg-white/5 rounded-md" />
                </div>
                <div className="h-8 w-16 bg-white/5 rounded-lg mb-3" />
                <div className="h-2 w-full bg-white/5 rounded-full mb-2" />
                <div className="h-3 w-48 bg-white/5 rounded-md" />
              </div>
            ))}
          </div>

          {/* CV Preview skeleton */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
              <div className="w-4 h-4 rounded bg-white/5" />
              <div className="h-4 w-24 bg-white/5 rounded-md" />
            </div>
            <div className="h-[400px] bg-white/[0.01]" />
          </div>
        </main>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-[#0a0e27]">
        <CandidateNavbar />
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || "Application not found."}</p>
          <Link href="/candidate/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!application.job) {
    return (
      <div className="min-h-screen bg-[#0a0e27]">
        <CandidateNavbar />
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <AlertCircle size={40} className="text-amber-400 mx-auto mb-4" />
          <p className="text-amber-400 mb-2 font-medium">
            Job information unavailable
          </p>
          <p className="text-slate-500 text-sm mb-6">
            This job may have been removed by the employer.
          </p>
          <Link href="/candidate/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const cfg = statusConfig[application.status] ?? statusConfig.Applied;
  const canStartInterview =
    application.status === "Shortlisted" &&
    application.interviewSessionId &&
    application.interviewStatus !== "Completed" &&
    application.interviewStatus !== "Abandoned";

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <CandidateNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back link */}
        <Link
          href="/candidate/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-violet-400 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Hero Header Card */}
        <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/20 flex items-center justify-center">
                  <Building2 size={22} className="text-violet-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {application.job.position}
                  </h1>
                  <p className="text-violet-400 font-medium text-sm">
                    {application.job.department}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Calendar size={14} />
                Applied {formatDate(application.appliedAt)}
              </div>
            </div>
            <Badge
              className={`border text-sm px-3 py-1.5 shrink-0 ${cfg.className}`}
            >
              {cfg.label}
            </Badge>
          </div>
        </div>

        {/* Timeline */}
        <Card className="p-6 border-white/5 bg-white/[0.02]">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
            Application Progress
          </h2>
          <div className="relative flex items-start justify-between">
            {/* Connector line */}
            <div className="absolute top-5 left-0 right-0 h-px bg-white/10 mx-10" />
            {TIMELINE.map((item, idx) => {
              const stepNum = idx + 1;
              const done = stepNum <= cfg.step;
              const active = stepNum === cfg.step;
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="relative flex flex-col items-center gap-2 z-10 flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      active
                        ? "border-violet-500 bg-violet-500/20 shadow-lg shadow-violet-500/30"
                        : done
                        ? "border-violet-500/60 bg-violet-500/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    {done && !active ? (
                      <CheckCircle2
                        size={16}
                        className="text-violet-400"
                      />
                    ) : (
                      <Icon
                        size={16}
                        className={
                          active ? "text-violet-400" : "text-slate-600"
                        }
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium text-center ${
                      done ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ATS + AI Summary — only shown after HR review */}
        {application.status === "Applied" ? (
          <Card className="p-6 border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                <Clock size={14} className="text-violet-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">Evaluation Pending</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your ATS match score and AI summary will be available once the HR team
              completes their review and shortlisting for this position. Check back later!
            </p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-6 border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                  <Zap size={14} className="text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">ATS Match Score</h3>
              </div>
              <ATSGauge score={application.atsScore} />
            </Card>
            <Card className="p-6 border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                  <MessageSquare size={14} className="text-cyan-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">AI Summary</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                {application.cvSummary ?? "No AI summary available yet."}
              </p>
            </Card>
          </div>
        )}

        {/* Interview results (if available) */}
        {(typeof application.interviewScore === "number" ||
          application.interviewSummary ||
          application.interviewRecommendation) && (
          <Card className="p-6 border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={16} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-white">
                Interview Results
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500 mb-2">Interview Score</p>
                <p className="text-2xl font-bold text-white">
                  {typeof application.interviewScore === "number"
                    ? `${Math.round(application.interviewScore)}%`
                    : "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500 mb-2">Recommendation</p>
                <p className="text-sm font-semibold text-white">
                  {application.interviewRecommendation ?? "Pending"}
                </p>
              </div>
            </div>
            {application.interviewSummary && (
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500 mb-2">Interview Feedback</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {application.interviewSummary}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Shortlisted / Interview CTA */}
        {application.status === "Shortlisted" && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Trophy size={18} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white mb-1">
                  🎉 You have been shortlisted!
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  Congratulations! You&apos;ve passed the initial screening. Proceed to the AI interview.
                </p>
                {canStartInterview ? (
                  <Link
                    href={`/candidate/interview/${application.interviewSessionId}`}
                  >
                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
                      {application.interviewStatus === "In-Progress"
                        ? "Resume Interview"
                        : "Start Interview"}
                      <ChevronRight size={16} />
                    </Button>
                  </Link>
                ) : application.interviewStatus === "Completed" ? (
                  <p className="text-sm text-emerald-400 font-medium">
                    ✓ Interview completed — your evaluation has been submitted.
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">
                    Interview setup is in progress. Please refresh in a moment.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CV Preview */}
        <Card className="border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
            <FileText size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-white">CV Preview</h3>
          </div>
          {application.cv.file ? (
            <embed
              src={application.cv.file}
              type="application/pdf"
              className="w-full h-[700px]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText size={32} className="text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">CV preview unavailable.</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

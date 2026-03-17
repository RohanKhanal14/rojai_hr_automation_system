"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getApplicationByIdAction,
  type ApplicationDetail,
} from "@/lib/actions";

const animCSS = `
@keyframes fadeInUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes ringFill{from{stroke-dashoffset:251}to{stroke-dashoffset:var(--ring-offset)}}
`;

const STATUS_BADGE: Record<string, string> = {
  Pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Shortlisted: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Rejected: "text-red-400 bg-red-400/10 border-red-400/20",
  Applied: "text-sky-400 bg-sky-400/10 border-sky-400/20",
};

const STATUS_DOT: Record<string, string> = {
  Pending: "bg-amber-400",
  Shortlisted: "bg-emerald-400",
  Rejected: "bg-red-400",
  Applied: "bg-sky-400",
};

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    getApplicationByIdAction(id).then((res) => {
      if (res.success) setData(res.data);
      else toast.error(res.message);
      setLoading(false);
    });
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070d] flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-400" size={32} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#07070d] flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">Application not found.</p>
        <Link
          href="/hr/dashboard"
          className="text-violet-400 hover:text-violet-300 text-sm"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const job = data.job;
  const candidate = data.candidate;
  const atsScore = Math.round(data.atsScore ?? 0);
  const status = data.status ?? "Applied";
  const cvDataUri = data.cv?.file ?? null;

  return (
    <div className="min-h-screen bg-[#07070d]">
      <style dangerouslySetInnerHTML={{ __html: animCSS }} />

      {/* Nav */}
      <div className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#0c0c18]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/hr/jobs/${job._id}`}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                Application Details
              </h1>
              <p className="text-xs text-zinc-500">
                {candidate?.fullName ?? "Candidate"} — {job.position}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${STATUS_BADGE[status] ?? STATUS_BADGE.Applied}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] ?? STATUS_DOT.Applied}`} />
            {status}
          </span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Candidate Profile + ATS Score */}
            <div
              className="relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden"
              style={{ animation: "fadeInUp .4s ease" }}
            >
              <div className="absolute inset-0 bg-[#0c0c18]/80" />
              <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-start">
                {/* ATS Gauge */}
                <div className="relative w-24 h-24 shrink-0 mx-auto sm:mx-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
                    <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <circle
                      cx="44"
                      cy="44"
                      r="40"
                      fill="none"
                      stroke="url(#atsGrad)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="251"
                      style={{
                        strokeDashoffset: 251 - (251 * atsScore) / 100,
                        transition: "stroke-dashoffset 1.5s ease",
                      }}
                    />
                    <defs>
                      <linearGradient id="atsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {atsScore}%
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wide">
                      ATS
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 min-w-0">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {candidate?.fullName ?? "Unknown"}
                    </h2>
                    <p className="text-sm text-zinc-400">{job.position}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} className="text-zinc-500" />
                      {candidate?.email ?? "—"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} className="text-zinc-500" />
                      {candidate?.phone ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CV Summary */}
            {data.cvSummary && (
              <div
                className="relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden"
                style={{ animation: "fadeInUp .45s ease" }}
              >
                <div className="absolute inset-0 bg-[#0c0c18]/80" />
                <div className="relative z-10">
                  <h3 className="text-sm font-bold text-white mb-3">
                    CV Summary
                  </h3>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {data.cvSummary}
                  </p>
                </div>
              </div>
            )}

            {/* Interview Evaluation */}
            {(data.interviewScore != null || data.interviewSummary) && (
              <div
                className="relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden"
                style={{ animation: "fadeInUp .5s ease" }}
              >
                <div className="absolute inset-0 bg-[#0c0c18]/80" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">
                      Interview Evaluation
                    </h3>
                    {data.interviewScore != null && (
                      <span className="text-sm font-bold text-violet-400">
                        Score: {data.interviewScore}
                      </span>
                    )}
                  </div>

                  {data.interviewSummary && (
                    <p className="text-sm text-zinc-300 mb-4 whitespace-pre-wrap leading-relaxed">
                      {data.interviewSummary}
                    </p>
                  )}

                  {data.interviewRecommendation && (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Recommendation</p>
                      <p className="text-sm text-white font-medium">{data.interviewRecommendation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CV Document */}
            {cvDataUri && (
              <div
                className="relative rounded-2xl border border-white/[0.06] overflow-hidden"
                style={{ animation: "fadeInUp .55s ease" }}
              >
                <div className="absolute inset-0 bg-[#0c0c18]/80" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText size={16} className="text-violet-400" />
                      {data.cv?.originalName ?? "CV Document"}
                    </h3>
                    <a
                      href={cvDataUri}
                      download={data.cv?.originalName ?? "cv.pdf"}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                    >
                      <Download size={12} /> Download
                    </a>
                  </div>
                  <div className="p-4">
                    <div className="aspect-[3/4] rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                      <iframe
                        src={cvDataUri}
                        className="w-full h-full"
                        title="CV"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Candidate Info Card */}
            <div
              className="relative rounded-2xl p-5 border border-white/[0.06] overflow-hidden"
              style={{ animation: "fadeInUp .4s ease" }}
            >
              <div className="absolute inset-0 bg-[#0c0c18]/80" />
              <div className="relative z-10 space-y-3.5">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Candidate
                </h3>
                {[
                  { icon: User, label: "Name", value: candidate?.fullName ?? "—" },
                  { icon: Mail, label: "Email", value: candidate?.email ?? "—" },
                  { icon: Phone, label: "Phone", value: candidate?.phone ?? "—" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                      <item.icon size={14} className="text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-sm text-white font-medium truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Info Card */}
            <div
              className="relative rounded-2xl p-5 border border-white/[0.06] overflow-hidden"
              style={{ animation: "fadeInUp .5s ease" }}
            >
              <div className="absolute inset-0 bg-[#0c0c18]/80" />
              <div className="relative z-10 space-y-3.5">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Job Details
                </h3>
                {[
                  { icon: Briefcase, label: "Position", value: job.position },
                  { icon: Briefcase, label: "Department", value: job.department ?? "—" },
                  {
                    icon: Calendar,
                    label: "Applied",
                    value: new Date(data.appliedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                      <item.icon size={14} className="text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-sm text-white font-medium truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className="relative rounded-2xl p-5 border border-white/[0.06] overflow-hidden"
              style={{ animation: "fadeInUp .55s ease" }}
            >
              <div className="absolute inset-0 bg-[#0c0c18]/80" />
              <div className="relative z-10 space-y-2.5">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                  Actions
                </h3>
                <Link href={`/hr/jobs/${job._id}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 justify-start gap-2 text-sm rounded-xl"
                  >
                    <ExternalLink size={14} /> View Job Posting
                  </Button>
                </Link>
                {cvDataUri && (
                  <a href={cvDataUri} download={data.cv?.originalName ?? "cv.pdf"} className="block">
                    <Button
                      variant="outline"
                      className="w-full border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 justify-start gap-2 text-sm rounded-xl"
                    >
                      <Download size={14} /> Download CV
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

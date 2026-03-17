"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Check,
  Edit,
  Loader2,
  MapPin,
  Trash2,
  Users,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getJobByIdAction,
  deleteJobAction,
  updateJobAction,
  getJobRankingsAction,
  triggerShortlistAction,
  type Job,
  type RankingItem,
} from "@/lib/actions";

const animCSS = `
@keyframes fadeInUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
`;

const STATUS_COLORS: Record<string, string> = {
  Draft: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Published: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Closed: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
};

const NEXT_STATUS: Record<string, string> = {
  Draft: "Published",
  Published: "Closed",
  Closed: "Published",
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [shortlisting, setShortlisting] = useState(false);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    getJobByIdAction(id).then((res) => {
      if (res.success && res.data) setJob(res.data.jobsInfo);
      else toast.error(res.message);
      setLoading(false);
    });
  }, [params?.id]);

  const fetchRankings = async () => {
    if (!job) return;
    setLoadingRankings(true);
    const res = await getJobRankingsAction(job._id);
    if (res.success) {
      setRankings(res.data.rankings);
    } else {
      toast.error(res.message);
    }
    setLoadingRankings(false);
  };

  const handleShortlist = async () => {
    if (!job) return;
    setShortlisting(true);
    const res = await triggerShortlistAction(job._id);
    if (res.success) {
      toast.success(`Shortlisted ${res.data.shortlisted} candidates!`);
      await fetchRankings();
    } else {
      toast.error(res.message);
    }
    setShortlisting(false);
  };

  useEffect(() => {
    if (!job) return;
    fetchRankings();
  }, [job?._id]);

  const handleDelete = async () => {
    if (!job) return;
    setDeleting(true);
    const res = await deleteJobAction(job._id);
    if (res.success) {
      toast.success(res.message);
      router.push("/hr/dashboard");
    } else {
      toast.error(res.message);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!job) return;
    setChangingStatus(true);
    const res = await updateJobAction(job._id, { status: newStatus });
    if (res.success && res.data) {
      setJob(res.data.jobInfo);
      toast.success(`Status changed to ${newStatus}`);
    } else {
      toast.error(res.message);
    }
    setChangingStatus(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070d] flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-400" size={32} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#07070d] flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">Job not found.</p>
        <Link
          href="/hr/dashboard"
          className="text-violet-400 hover:text-violet-300 text-sm"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const deadline = new Date(job.deadline);
  const isExpired = deadline < new Date();
  const daysLeft = Math.ceil(
    (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="min-h-screen bg-[#07070d]">
      <style dangerouslySetInnerHTML={{ __html: animCSS }} />

      {/* Nav */}
      <div className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#0c0c18]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/hr/dashboard"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                {job.position}
              </h1>
              <p className="text-xs text-zinc-500">
                {job.department} · {job.experienceLevel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${STATUS_COLORS[job.status] ?? STATUS_COLORS.Draft}`}
            >
              {job.status}
            </span>
            <Link href={`/hr/jobs/${job._id}/edit`}>
              <Button
                size="sm"
                variant="outline"
                className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 gap-1.5 rounded-xl"
              >
                <Edit size={14} /> Edit
              </Button>
            </Link>
            {(job.status === "Draft" || job.status === "Closed") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 gap-1.5 rounded-xl"
              >
                <Trash2 size={14} /> Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Description */}
            <div
              className="relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden"
              style={{ animation: "fadeInUp .4s ease" }}
            >
              <div className="absolute inset-0 bg-[#0c0c18]/80" />
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-white mb-3">
                  Job Description
                </h3>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Skills */}
            {(job.mustHaveSkills.length > 0 ||
              job.niceToHaveSkills.length > 0) && (
              <div
                className="relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden space-y-5"
                style={{ animation: "fadeInUp .45s ease" }}
              >
                <div className="absolute inset-0 bg-[#0c0c18]/80" />
                <div className="relative z-10 space-y-5">
                  {job.mustHaveSkills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-white mb-3">
                        Must-Have Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.mustHaveSkills.map((s) => (
                          <span
                            key={s}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-violet-400 bg-violet-400/10 border border-violet-400/20"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {job.niceToHaveSkills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-white mb-3">
                        Nice-to-Have Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.niceToHaveSkills.map((s) => (
                          <span
                            key={s}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-sky-400 bg-sky-400/10 border border-sky-400/20"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interview config */}
            <div
              className="relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden"
              style={{ animation: "fadeInUp .5s ease" }}
            >
              <div className="absolute inset-0 bg-[#0c0c18]/80" />
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-white mb-4">
                  AI Interview Configuration
                </h3>
                <div className="grid sm:grid-cols-3 gap-4 mb-5">
                  {[
                    { label: "Questions", value: job.interview.num_questions, gradient: "from-violet-500/15 to-indigo-500/15" },
                    { label: "Tone", value: job.interview.interviewTone, gradient: "from-sky-500/15 to-blue-500/15", capitalize: true },
                    { label: "Shortlist Count", value: job.shortlistCount, gradient: "from-emerald-500/15 to-teal-500/15" },
                  ].map((item) => (
                    <div key={item.label} className={`bg-gradient-to-br ${item.gradient} rounded-xl p-4 border border-white/[0.04]`}>
                      <p className="text-xs text-zinc-500 mb-1">{item.label}</p>
                      <p className={`font-bold text-white ${item.capitalize ? "capitalize text-sm" : "text-lg"}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {job.interview.questions.map((q, i) => (
                    <div key={i} className="flex gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-colors">
                      <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600/40 to-indigo-600/40 text-violet-300 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm text-zinc-300">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rankings */}
            <div
              className="relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden"
              style={{ animation: "fadeInUp .55s ease" }}
            >
              <div className="absolute inset-0 bg-[#0c0c18]/80" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">
                    Ranked Candidates
                  </h3>
                  <Button
                    size="sm"
                    onClick={fetchRankings}
                    disabled={loadingRankings}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs gap-1.5 rounded-xl"
                  >
                    {loadingRankings ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      "Refresh"
                    )}
                  </Button>
                </div>
                {rankings.length > 0 ? (
                  <div className="space-y-2">
                    {rankings.map((rank, idx) => (
                      <div
                        key={rank._id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-all group"
                        style={{ animation: `fadeInUp ${0.3 + idx * 0.05}s ease` }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs flex items-center justify-center shrink-0 font-bold shadow-sm shadow-violet-600/20">
                              {idx + 1}
                            </div>
                            <p className="text-sm font-medium text-white truncate">
                              {rank.candidateId.fullName}
                            </p>
                            <span className="text-xs text-zinc-500 truncate">
                              ({rank.candidateId.phone})
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-1 ml-9">
                            {rank.cvSummary}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 ml-4 shrink-0">
                          <div className="text-right">
                            {/* ATS Score with mini bar */}
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                                  style={{ width: `${Math.round(rank.atsScore)}%` }}
                                />
                              </div>
                              <p className="text-sm font-bold text-violet-400">
                                {Math.round(rank.atsScore)}%
                              </p>
                            </div>
                            <p className="text-xs text-zinc-500">ATS Score</p>
                          </div>
                          <Link href={`/hr/applications/${rank.applicationId}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 rounded-xl"
                            >
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                    {rankings.length > 0 && (
                      <Button
                        onClick={handleShortlist}
                        disabled={shortlisting || rankings.length === 0}
                        className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white gap-2 rounded-xl shadow-lg shadow-emerald-600/20"
                      >
                        {shortlisting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        Shortlist Top {job.shortlistCount} Candidates
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-zinc-500 mb-4">
                      No applications yet
                    </p>
                    <Button
                      size="sm"
                      onClick={fetchRankings}
                      disabled={loadingRankings}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs rounded-xl"
                    >
                      Load Rankings
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div
              className="relative rounded-2xl p-5 border border-white/[0.06] overflow-hidden space-y-4"
              style={{ animation: "fadeInUp .4s ease" }}
            >
              <div className="absolute inset-0 bg-[#0c0c18]/80" />
              <div className="relative z-10 space-y-4">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Job Details
                </h3>

                {[
                  { icon: Briefcase, label: "Department", value: job.department ?? "—" },
                  { icon: Users, label: "Experience Level", value: job.experienceLevel },
                  { icon: job.remote ? Wifi : MapPin, label: "Location", value: job.remote ? "Remote" : (job.location ?? "—") },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                      <item.icon size={14} className="text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">{item.label}</p>
                      <p className="text-sm font-medium text-white">{item.value}</p>
                    </div>
                  </div>
                ))}

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <Calendar size={14} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Deadline</p>
                    <p className={`text-sm font-medium ${isExpired ? "text-red-400" : "text-white"}`}>
                      {deadline.toLocaleDateString()}
                      {!isExpired && (
                        <span className="text-xs text-zinc-500 ml-1">
                          ({daysLeft}d left)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {job.salary && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                      <span className="text-violet-400 text-xs font-bold">NPR</span>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Salary</p>
                      <p className="text-sm font-medium text-white capitalize">
                        {job.salary.type === "negotiable" && "Negotiable"}
                        {job.salary.type === "fixed" &&
                          `${job.salary.max?.toLocaleString()} / ${job.salary.period}`}
                        {job.salary.type === "range" &&
                          `${job.salary.min?.toLocaleString()} – ${job.salary.max?.toLocaleString()} / ${job.salary.period}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status control */}
            <div
              className="relative rounded-2xl p-5 border border-white/[0.06] overflow-hidden"
              style={{ animation: "fadeInUp .5s ease" }}
            >
              <div className="absolute inset-0 bg-[#0c0c18]/80" />
              <div className="relative z-10">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                  Change Status
                </h3>
                <p className="text-xs text-zinc-500 mb-3">
                  Current:{" "}
                  <span
                    className={`font-semibold ${STATUS_COLORS[job.status]?.split(" ")[0] ?? "text-zinc-300"}`}
                  >
                    {job.status}
                  </span>
                </p>
                <Button
                  onClick={() => handleStatusChange(NEXT_STATUS[job.status])}
                  disabled={changingStatus}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm gap-2 rounded-xl shadow-lg shadow-violet-600/20"
                >
                  {changingStatus ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Mark as {NEXT_STATUS[job.status]}
                </Button>
              </div>
            </div>

            {/* Quick actions */}
            <div
              className="relative rounded-2xl p-5 border border-white/[0.06] overflow-hidden space-y-2"
              style={{ animation: "fadeInUp .55s ease" }}
            >
              <div className="absolute inset-0 bg-[#0c0c18]/80" />
              <div className="relative z-10 space-y-2">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                  Actions
                </h3>
                <Link href={`/hr/jobs/${job._id}/edit`} className="block">
                  <Button
                    variant="outline"
                    className="w-full border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 justify-start gap-2 text-sm rounded-xl"
                  >
                    <Edit size={14} /> Edit Job Details
                  </Button>
                </Link>
                {(job.status === "Draft" || job.status === "Closed") && (
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 justify-start gap-2 text-sm rounded-xl"
                  >
                    <Trash2 size={14} /> Delete Job
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative rounded-2xl p-7 w-full max-w-sm shadow-2xl shadow-black/60" style={{ animation: "scaleIn .2s ease" }}>
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] pointer-events-none" />
            <div className="absolute inset-0 rounded-2xl bg-[#0c0c18]" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/25 flex items-center justify-center mx-auto mb-5">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">
                Delete Job?
              </h3>
              <p className="text-sm text-zinc-400 text-center mb-6">
                This will permanently delete{" "}
                <span className="text-white font-medium">{job.position}</span>.
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white gap-2 rounded-xl shadow-lg shadow-red-600/20"
                >
                  {deleting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

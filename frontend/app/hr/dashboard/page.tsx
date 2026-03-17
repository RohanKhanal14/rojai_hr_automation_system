"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Briefcase,
  Plus,
  Search,
  Edit2,
  ChevronDown,
  Trash2,
  LogOut,
  Loader2,
  Eye,
  TrendingUp,
  FileCheck,
  FileClock,
  FileX,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  logoutAction,
  getPersonalJobsAction,
  deleteJobAction,
  type Job,
} from "@/lib/actions";
import { useAuth, getProfile } from "@/lib/auth-context";

const animCSS = `
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes fadeInUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes rowHighlight{from{background:rgba(139,92,246,.06)}to{background:transparent}}
`;

const STATUS_OPTIONS = ["All Status", "Published", "Draft", "Closed"];

function hasValidJobTitle(job: Partial<Job> | null | undefined): job is Job {
  return typeof job?.position === "string" && job.position.trim().length > 0;
}

export default function HRDashboard() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [, startTransition] = useTransition();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const profile = user ? getProfile(user) : null;
  const hrName = profile?.fullName ?? "HR Professional";

  useEffect(() => {
    getPersonalJobsAction().then((result) => {
      if (result.success) {
        setJobs((result.data.jobsInfo ?? []).filter(hasValidJobTitle));
      } else {
        toast.error(result.message);
      }
      setLoading(false);
    });
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const position = (job.position ?? "").toLowerCase();
      const department = (job.department ?? "").toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        position.includes(query) || department.includes(query);
      const matchesStatus =
        selectedStatus === "All Status" || job.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, selectedStatus]);

  const totalJobs = jobs.length;
  const publishedCount = jobs.filter((j) => j.status === "Published").length;
  const draftCount = jobs.filter((j) => j.status === "Draft").length;
  const closedCount = jobs.filter((j) => j.status === "Closed").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20";
      case "Draft":
        return "text-amber-400 bg-amber-400/10 border border-amber-400/20";
      case "Closed":
        return "text-red-400 bg-red-400/10 border border-red-400/20";
      default:
        return "text-zinc-400 bg-zinc-400/10 border border-zinc-400/20";
    }
  };

  const handleDelete = (jobId: string) => {
    setConfirmDeleteId(jobId);
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteJobAction(id);
      setDeletingId(null);
      if (result.success) {
        setJobs((prev) => prev.filter((j) => j._id !== id));
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/login");
    });
  };

  const statCards = [
    {
      label: "Total Jobs",
      value: totalJobs,
      icon: TrendingUp,
      gradient: "from-violet-500/20 to-indigo-500/20",
      borderColor: "border-violet-500/20",
      iconColor: "text-violet-400",
      valueColor: "text-white",
    },
    {
      label: "Published",
      value: publishedCount,
      icon: FileCheck,
      gradient: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/20",
      iconColor: "text-emerald-400",
      valueColor: "text-emerald-400",
    },
    {
      label: "Draft",
      value: draftCount,
      icon: FileClock,
      gradient: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500/20",
      iconColor: "text-amber-400",
      valueColor: "text-amber-400",
    },
    {
      label: "Closed",
      value: closedCount,
      icon: FileX,
      gradient: "from-red-500/20 to-rose-500/20",
      borderColor: "border-red-500/20",
      iconColor: "text-red-400",
      valueColor: "text-red-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07070d]">
      <style dangerouslySetInnerHTML={{ __html: animCSS }} />

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" style={{ animation: "scaleIn .2s ease" }}>
          <div className="relative bg-[#0c0c18] rounded-2xl p-7 w-full max-w-sm mx-4 shadow-2xl shadow-black/60">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/25 mx-auto mb-5">
                <Trash2 className="text-red-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">
                Delete Job?
              </h3>
              <p className="text-zinc-400 text-sm text-center mb-6">
                This action cannot be undone. The job listing will be permanently
                removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-zinc-300 text-sm font-medium hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-medium transition shadow-lg shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Glassmorphism Nav ─────────────────────────────────────── */}
      <nav className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#0c0c18]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/hr/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500/25 rounded-xl blur-md group-hover:bg-violet-500/35 transition-all" />
              <img src="/roj-ai-logo.png" alt="ROJ.AI" width={36} height={36} className="rounded-xl relative" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              ROJ<span className="text-violet-400">.AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/40 to-indigo-600/40 flex items-center justify-center text-violet-300 text-xs font-bold uppercase">
                {hrName.charAt(0)}
              </div>
              <span className="text-sm text-zinc-300 font-medium">{hrName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8" style={{ animation: "fadeInUp .4s ease" }}>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Welcome back, {hrName.split(" ")[0]}
            </h1>
            <p className="text-zinc-400 text-sm">
              Manage your job listings and track applications
            </p>
          </div>
          <Link href="/hr/jobs/new">
            <Button className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white gap-2 shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl px-5 py-2.5">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s infinite",
                }}
              />
              <Plus size={18} className="relative" />
              <span className="relative">New Job Opening</span>
            </Button>
          </Link>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`relative group rounded-2xl p-5 border ${stat.borderColor} overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-lg cursor-default`}
                style={{ animation: `fadeInUp ${0.4 + idx * 0.08}s ease` }}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <div className="absolute inset-0 bg-[#0c0c18]/70" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">
                      {stat.label}
                    </p>
                    <div className={`w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center ${stat.iconColor}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <p className={`text-3xl font-bold ${stat.valueColor}`}>
                    {loading ? (
                      <span className="inline-block w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Table Card ─────────────────────────────────────────── */}
        <div
          className="relative rounded-2xl overflow-hidden border border-white/[0.06]"
          style={{ animation: "fadeInUp .65s ease" }}
        >
          <div className="absolute inset-0 bg-[#0c0c18]/80 backdrop-blur-sm" />
          <div className="relative z-10">
            {/* Table Header */}
            <div className="p-5 border-b border-white/[0.06] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search by position or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                />
              </div>

              {/* Status filter */}
              <div className="relative">
                <button
                  onClick={() => setIsStatusDropdownOpen((p) => !p)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-xl text-sm text-zinc-300 hover:bg-white/[0.04] transition-all"
                >
                  {selectedStatus}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isStatusDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-[#111122] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden" style={{ animation: "slideDown .2s ease" }}>
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSelectedStatus(s);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition ${
                          selectedStatus === s
                            ? "bg-violet-600/20 text-violet-300"
                            : "text-zinc-300 hover:bg-white/[0.04]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              /* Loading skeleton */
              <div className="p-5 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02]">
                    <div className="w-40 h-4 rounded bg-white/5 animate-pulse" />
                    <div className="w-24 h-4 rounded bg-white/5 animate-pulse" />
                    <div className="w-20 h-4 rounded bg-white/5 animate-pulse" />
                    <div className="w-24 h-4 rounded bg-white/5 animate-pulse" />
                    <div className="w-16 h-4 rounded bg-white/5 animate-pulse" />
                    <div className="flex-1" />
                    <div className="w-20 h-4 rounded bg-white/5 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center mb-5">
                  <Briefcase className="text-violet-400" size={28} />
                </div>
                <p className="text-white font-semibold text-lg mb-1">
                  {jobs.length === 0
                    ? "No job listings yet"
                    : "No jobs match your filter"}
                </p>
                <p className="text-zinc-500 text-sm mb-5">
                  {jobs.length === 0
                    ? "Create your first job opening to start hiring"
                    : "Try adjusting your search or status filter"}
                </p>
                {jobs.length === 0 && (
                  <Link href="/hr/jobs/new">
                    <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white gap-2 rounded-xl shadow-lg shadow-violet-600/20">
                      <Plus size={16} />
                      Create Job Opening
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      {[
                        "Position",
                        "Department",
                        "Experience",
                        "Deadline",
                        "Status",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job, idx) => (
                      <tr
                        key={job._id}
                        className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-all duration-200 group/row"
                        style={{ animation: `fadeInUp ${0.3 + idx * 0.05}s ease` }}
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/hr/jobs/${job._id}`}
                            className="text-white font-medium hover:text-violet-400 transition-colors"
                          >
                            {job.position}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-zinc-400 text-sm">
                          {job.department ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-zinc-400 text-sm">
                          {job.experienceLevel}
                        </td>
                        <td className="px-5 py-4 text-zinc-400 text-sm">
                          {new Date(job.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(job.status)}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              job.status === "Published" ? "bg-emerald-400" :
                              job.status === "Draft" ? "bg-amber-400" : "bg-red-400"
                            }`} />
                            {job.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 opacity-70 group-hover/row:opacity-100 transition-opacity">
                            <Link href={`/hr/jobs/${job._id}`}>
                              <button
                                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"
                                title="View"
                              >
                                <Eye size={15} />
                              </button>
                            </Link>
                            <Link href={`/hr/jobs/${job._id}/edit`}>
                              <button
                                className="p-2 rounded-lg text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                                title="Edit"
                              >
                                <Edit2 size={15} />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(job._id)}
                              disabled={deletingId === job._id}
                              className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                              title="Delete"
                            >
                              {deletingId === job._id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

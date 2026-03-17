"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getListedJobsAction, type Job, type JobSalary } from "@/lib/actions";
import CandidateNavbar from "@/components/CandidateNavbar";
import {
  Search,
  MapPin,
  Clock,
  Briefcase,
  ChevronRight,
  Loader2,
  SlidersHorizontal,
  X,
  Building2,
  Sparkles,
} from "lucide-react";

function hasValidJobTitle(job: Partial<Job> | null | undefined): job is Job {
  return typeof job?.position === "string" && job.position.trim().length > 0;
}

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
  return `${diff}d left`;
}

function getDeadlineStyle(left: string) {
  if (left === "Closed")
    return { text: "text-red-400", bg: "bg-red-500/10 border-red-500/20", accent: "from-red-500 to-rose-500" };
  if (left === "Last day")
    return {
      text: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
      accent: "from-orange-500 to-amber-500",
    };
  const days = parseInt(left);
  if (days <= 3)
    return {
      text: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
      accent: "from-orange-500 to-amber-500",
    };
  return {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    accent: "from-emerald-500 to-teal-500",
  };
}

const EXPERIENCE_FILTERS = ["All", "Internship", "Entry Level", "Mid Level", "Senior Level"];
const LOCATION_FILTERS = ["All", "Remote", "On-site"];

/* ─── Skeleton Components ─────────────────────────────────── */

function JobCardSkeleton() {
  return (
    <div className="relative rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden animate-pulse">
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/5 rounded-l-2xl" />
      <div className="p-6 pl-7">
        {/* Top row: icon + title + deadline */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-white/5 shrink-0" />
            <div className="flex-1 min-w-0 space-y-2.5">
              <div className="h-5 w-48 bg-white/5 rounded-lg" />
              <div className="h-3.5 w-28 bg-white/5 rounded-md" />
            </div>
          </div>
          <div className="h-7 w-20 bg-white/5 rounded-lg shrink-0 hidden sm:block" />
        </div>
        {/* Description */}
        <div className="space-y-2 mb-5">
          <div className="h-3.5 w-full bg-white/5 rounded-md" />
          <div className="h-3.5 w-3/4 bg-white/5 rounded-md" />
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-2.5">
          <div className="h-7 w-24 bg-white/5 rounded-lg" />
          <div className="h-7 w-28 bg-white/5 rounded-lg" />
          <div className="h-7 w-32 bg-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function SearchBarSkeleton() {
  return (
    <div className="space-y-4 mb-8 animate-pulse">
      <div className="h-12 w-full rounded-xl bg-white/[0.03] border border-white/5" />
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 rounded-lg bg-white/[0.03] border border-white/5" />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Content ────────────────────────────────────────── */

function CandidateJobsContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get("q") ?? "";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [expFilter, setExpFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  useEffect(() => {
    getListedJobsAction().then((res) => {
      if (res.success) {
        const rawJobs = res.data.jobsInfo ?? [];
        const safeJobs = rawJobs.filter(hasValidJobTitle);
        setJobs(safeJobs);
        if (rawJobs.length > 0 && safeJobs.length === 0) {
          setError("No jobs are listed currently.");
        }
      } else {
        setError(res.message);
      }
      setLoading(false);
    });
  }, []);

  const filteredJobs = useMemo(() => {
    let result = jobs;
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      result = result.filter((job) => {
        const position = (job.position ?? "").toLowerCase();
        const department = (job.department ?? "").toLowerCase();
        const description = (job.description ?? "").toLowerCase();
        return (
          position.includes(q) ||
          department.includes(q) ||
          description.includes(q)
        );
      });
    }
    if (expFilter !== "All") {
      result = result.filter(
        (job) =>
          (job.experienceLevel ?? "").toLowerCase() ===
          expFilter.toLowerCase()
      );
    }
    if (locationFilter !== "All") {
      if (locationFilter === "Remote") {
        result = result.filter((job) => job.remote === true);
      } else {
        result = result.filter((job) => !job.remote);
      }
    }
    return result;
  }, [jobs, searchTerm, expFilter, locationFilter]);

  const hasFilters =
    searchTerm || expFilter !== "All" || locationFilter !== "All";

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <CandidateNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-violet-400" />
            <span className="text-xs text-violet-400 font-medium uppercase tracking-wider">
              Career Opportunities
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Open Positions
          </h1>
          <p className="text-slate-400">
            Discover and apply to opportunities that match your skills.
          </p>
        </div>

        {/* Loading: Show skeleton for search + cards */}
        {loading && (
          <>
            <SearchBarSkeleton />
            <div className="space-y-5">
              {[1, 2, 3, 4].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          </>
        )}

        {/* Search + Filters (hidden while loading) */}
        {!loading && (
          <div className="space-y-4 mb-8">
            {/* Search bar */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, department or keyword…"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder:text-slate-600 text-sm outline-none focus:border-violet-500/60 focus:bg-white/[0.05] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500 font-medium">Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setExpFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${expFilter === f
                        ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                        : "bg-white/[0.03] text-slate-500 border-white/10 hover:border-white/20 hover:text-slate-300"
                      }`}
                  >
                    {f === "All" ? "Any Experience" : f}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {LOCATION_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setLocationFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${locationFilter === f
                        ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                        : "bg-white/[0.03] text-slate-500 border-white/10 hover:border-white/20 hover:text-slate-300"
                      }`}
                  >
                    {f === "All" ? "Any Location" : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Result count + clear */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="text-white font-semibold">
                  {filteredJobs.length}
                </span>{" "}
                of {jobs.length} positions
              </p>
              {hasFilters && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setExpFilter("All");
                    setLocationFilter("All");
                  }}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                >
                  <X size={12} />
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <Briefcase size={28} className="text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {jobs.length === 0
                ? "No positions available"
                : "No matching positions"}
            </h3>
            <p className="text-slate-500 text-sm max-w-xs text-center">
              {jobs.length === 0
                ? "Check back later for new job openings."
                : "Try adjusting your search or filters to find more results."}
            </p>
            {hasFilters && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setExpFilter("All");
                  setLocationFilter("All");
                }}
                className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Job cards */}
        {!loading && !error && filteredJobs.length > 0 && (
          <div className="flex flex-col gap-5">
            {filteredJobs.map((job) => {
              const salaryText = formatSalary(job.salary);
              const left = daysLeft(job.deadline);
              const { text: deadlineText, bg: deadlineBg, accent } =
                getDeadlineStyle(left);
              const isClosed = left === "Closed";

              return (
                <Link key={job._id} href={`/candidate/jobs/${job._id}`} className="block">
                  <div className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] hover:from-white/[0.06] hover:to-white/[0.03] hover:border-violet-500/25 transition-all duration-300 cursor-pointer overflow-hidden">
                    {/* Left gradient accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${isClosed ? 'from-red-500/60 to-rose-500/20' : 'from-violet-500/60 to-purple-500/20'} rounded-l-2xl transition-all duration-300 group-hover:w-1.5 group-hover:from-violet-400 group-hover:to-purple-400`} />

                    {/* Hover glow */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-600/0 group-hover:bg-violet-600/5 rounded-full blur-3xl transition-all duration-500 pointer-events-none" />

                    <div className="relative p-6 pl-7">
                      {/* Top row: icon + title + deadline */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {/* Department icon */}
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/10 border border-violet-500/10 flex items-center justify-center shrink-0 group-hover:border-violet-500/30 group-hover:from-violet-500/25 group-hover:to-purple-500/15 transition-all duration-300">
                            <Building2 size={18} className="text-violet-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-[17px] text-white group-hover:text-violet-200 transition-colors leading-tight truncate">
                              {job.position}
                            </h3>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {job.department}
                            </p>
                          </div>
                        </div>
                        {/* Desktop deadline badge */}
                        <div
                          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0 ${deadlineBg} ${deadlineText}`}
                        >
                          <Clock size={12} />
                          {left}
                        </div>
                      </div>

                      {/* Description snippet */}
                      {job.description && (
                        <p className="text-sm text-slate-500/90 line-clamp-2 mb-4 leading-relaxed pl-[3.25rem]">
                          {job.description}
                        </p>
                      )}

                      {/* Meta chips row */}
                      <div className="flex flex-wrap gap-2.5 items-center pl-[3.25rem]">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.07] transition-colors">
                          <Briefcase size={12} className="text-slate-400" />
                          {job.experienceLevel}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-slate-300">
                          <MapPin size={12} className="text-slate-400" />
                          {job.remote ? "Remote" : job.location ?? "N/A"}
                        </span>
                        {salaryText && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/10 border border-violet-500/15 text-violet-300">
                            {salaryText}
                          </span>
                        )}
                        {/* Mobile deadline */}
                        <span
                          className={`sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${deadlineBg} ${deadlineText}`}
                        >
                          <Clock size={12} />
                          {left}
                        </span>
                      </div>
                    </div>

                    {/* Right arrow */}
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] group-hover:bg-violet-500/10 group-hover:border-violet-500/20 transition-all duration-300">
                      <ChevronRight
                        size={16}
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
    </div>
  );
}

export default function CandidateJobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0e27]">
        <CandidateNavbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <div className="h-4 w-36 bg-white/5 rounded-md mb-3 animate-pulse" />
            <div className="h-9 w-64 bg-white/5 rounded-lg mb-2 animate-pulse" />
            <div className="h-4 w-80 bg-white/5 rounded-md animate-pulse" />
          </div>
          <SearchBarSkeleton />
          <div className="space-y-5">
            {[1, 2, 3, 4].map((i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <CandidateJobsContent />
    </Suspense>
  );
}

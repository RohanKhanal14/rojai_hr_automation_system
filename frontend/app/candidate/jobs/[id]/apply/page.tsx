"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Upload, Loader2, FileText, CheckCircle2 } from "lucide-react";
import {
  getJobByIdAction,
  getMyApplicationsAction,
  submitApplicationAction,
  type Job,
} from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CandidateNavbar from "@/components/CandidateNavbar";

export default function CandidateApplyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    getJobByIdAction(params.id).then((res) => {
      if (res.success) {
        setJob(res.data.jobsInfo);
      } else {
        toast.error(res.message);
      }
      setLoading(false);
    });
    // Redirect if already applied
    getMyApplicationsAction().then((res) => {
      if (res.success) {
        const hasApplied = res.data.applications.some(
          (app) => app.jobId?._id === params.id
        );
        if (hasApplied) {
          toast.error("You have already applied for this job.");
          router.replace(`/candidate/jobs/${params.id}`);
        }
      }
    });
  }, [params?.id, router]);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size must not exceed 5MB.");
      return;
    }
    setFile(f);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!job || !file) return;

    setSubmitting(true);
    const fd = new FormData();
    fd.append("jobId", job._id);
    fd.append("cv", file);

    const res = await submitApplicationAction(fd);
    if (res.success) {
      toast.success(res.message || "Application submitted successfully!");
      router.push("/candidate/dashboard");
    } else {
      toast.error(res.message);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27]">
        <CandidateNavbar />
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 size={22} className="animate-spin" />
            <span>Loading job details…</span>
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
          <p className="text-red-400 mb-4">Job not found.</p>
          <Link href="/candidate/jobs">
            <Button variant="outline">Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <CandidateNavbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href={`/candidate/jobs/${job._id}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-violet-400 text-sm font-medium transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Job
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            Apply for {job.position}
          </h1>
          <p className="text-slate-400 text-sm">{job.department}</p>
        </div>

        {/* What happens next */}
        <Card className="p-6 border-white/5 bg-white/[0.02] mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            After you apply
          </h3>
          <div className="space-y-3">
            {[
              "Your CV will be automatically scanned by our ATS system",
              "HR will review your application and profile",
              "Shortlisted candidates are invited to an AI interview",
              "Final decision will be communicated via the dashboard",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <CheckCircle2 size={15} className="text-violet-500 shrink-0 mt-0.5" />
                {step}
              </div>
            ))}
          </div>
        </Card>

        {/* Upload form */}
        <Card className="p-6 border-white/5 bg-white/[0.02]">
          <h3 className="text-sm font-semibold text-white mb-2">
            Upload Your CV
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            PDF format only, maximum 5MB
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <label className="block">
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  file
                    ? "border-violet-500/50 bg-violet-500/5"
                    : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={onFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/20 flex items-center justify-center">
                      <FileText size={22} className="text-violet-400" />
                    </div>
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Click to change
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Upload size={22} className="text-slate-500" />
                    </div>
                    <p className="text-sm font-medium text-white">
                      Drop your CV here or click to browse
                    </p>
                    <p className="text-xs text-slate-500">PDF, up to 5MB</p>
                  </div>
                )}
              </div>
            </label>

            <Button
              type="submit"
              disabled={!file || submitting}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white gap-2 h-12 font-semibold shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

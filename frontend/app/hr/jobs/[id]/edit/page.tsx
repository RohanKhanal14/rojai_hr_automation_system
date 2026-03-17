"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getJobByIdAction, updateJobAction, type Job,
} from "@/lib/actions";
import {
  EXPERIENCE_LEVELS, NEPAL_LOCATIONS, JOB_STATUS, INTERVIEW_TONE,
  POSITION_SKILLS,
} from "@/lib/constants";

// ---------- SkillPicker ----------
function SkillPicker({
  label, color, suggestions, selected, onChange,
}: {
  label: string;
  color: "violet" | "sky";
  suggestions: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const colorClass = color === "violet"
    ? "text-violet-400 bg-violet-400/10 border-violet-400/20"
    : "text-sky-400 bg-sky-400/10 border-sky-400/20";
  const addColor = color === "violet"
    ? "bg-violet-600 hover:bg-violet-700"
    : "bg-sky-600 hover:bg-sky-700";

  const toggle = (skill: string) => {
    onChange(selected.includes(skill) ? selected.filter((s) => s !== skill) : [...selected, skill]);
  };

  const addCustom = () => {
    const v = custom.trim();
    if (v && !selected.includes(v)) onChange([...selected, v]);
    setCustom("");
  };

  return (
    <div>
      <p className="text-xs text-zinc-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selected.map((s) => (
          <span key={s} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {s}
            <button onClick={() => toggle(s)} className="hover:opacity-70"><X size={10} /></button>
          </span>
        ))}
        <button onClick={() => setOpen(!open)} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${addColor} text-white`}>
          <Plus size={10} /> Add
        </button>
      </div>
      {open && (
        <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.filter((s) => !selected.includes(s)).map((s) => (
              <button key={s} onClick={() => toggle(s)}
                className="px-2 py-0.5 rounded-full text-xs text-zinc-400 bg-white/5 hover:bg-white/10 border border-white/10 transition">
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
              placeholder="Custom skill…"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
            />
            <button onClick={addCustom} className={`px-3 py-1.5 rounded-lg text-xs text-white font-medium ${addColor}`}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Main Page ----------
export default function EditJobPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [experienceLevel, setExperienceLevel] = useState("");
  const [remote, setRemote] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [shortlistCount, setShortlistCount] = useState(5);
  const [mustHaveSkills, setMustHaveSkills] = useState<string[]>([]);
  const [niceToHaveSkills, setNiceToHaveSkills] = useState<string[]>([]);
  const [status, setStatus] = useState("Draft");

  // Salary
  const [salaryType, setSalaryType] = useState<"none" | "negotiable" | "fixed" | "range">("none");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryPeriod, setSalaryPeriod] = useState("monthly");

  // Interview
  const [numQuestions, setNumQuestions] = useState(3);
  const [questions, setQuestions] = useState<string[]>(["", "", ""]);
  const [interviewTone, setInterviewTone] = useState("formal");

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    getJobByIdAction(id).then((res) => {
      if (res.success && res.data) {
        const j = res.data.jobsInfo;
        setJob(j);
        setExperienceLevel(j.experienceLevel);
        setRemote(j.remote);
        setLocation(j.location ?? "");
        setDescription(j.description);
        setDeadline(j.deadline.slice(0, 10));
        setShortlistCount(j.shortlistCount);
        setMustHaveSkills(j.mustHaveSkills);
        setNiceToHaveSkills(j.niceToHaveSkills);
        setStatus(j.status);
        if (j.salary) {
          setSalaryType(j.salary.type as typeof salaryType);
          setSalaryMin(j.salary.min?.toString() ?? "");
          setSalaryMax(j.salary.max?.toString() ?? "");
          setSalaryPeriod(j.salary.period ?? "monthly");
        }
        setNumQuestions(j.interview.num_questions);
        setQuestions(j.interview.questions);
        setInterviewTone(j.interview.interviewTone);
      } else {
        toast.error(res.message);
      }
      setLoading(false);
    });
  }, [params?.id]);

  const handleNumQuestionsChange = (n: number) => {
    setNumQuestions(n);
    setQuestions((prev) => {
      if (n > prev.length) return [...prev, ...Array(n - prev.length).fill("")];
      return prev.slice(0, n);
    });
  };

  const handleSubmit = async () => {
    if (!job) return;

    // Validation
    if (!experienceLevel) { toast.error("Experience level is required"); return; }
    if (!remote && !location) { toast.error("Location is required for on-site/hybrid roles"); return; }
    if (!description.trim()) { toast.error("Description is required"); return; }
    if (!deadline) { toast.error("Deadline is required"); return; }
    if (shortlistCount < 1) { toast.error("Shortlist count must be at least 1"); return; }
    if (mustHaveSkills.length === 0) { toast.error("Add at least one must-have skill"); return; }
    if (questions.some((q) => !q.trim())) { toast.error("Fill in all interview questions"); return; }

    const payload: Record<string, unknown> = {
      experienceLevel,
      remote,
      description,
      deadline,
      shortlistCount,
      mustHaveSkills,
      niceToHaveSkills,
      status,
      interview: { num_questions: numQuestions, questions, interviewTone },
    };

    if (!remote) payload.location = location;

    if (salaryType === "none") {
      payload.salary = null;
    } else if (salaryType === "negotiable") {
      payload.salary = { type: "negotiable" };
    } else if (salaryType === "fixed") {
      if (!salaryMax) { toast.error("Enter the fixed salary amount"); return; }
      payload.salary = { type: "fixed", max: Number(salaryMax), period: salaryPeriod };
    } else {
      if (!salaryMin || !salaryMax) { toast.error("Enter salary range"); return; }
      payload.salary = { type: "range", min: Number(salaryMin), max: Number(salaryMax), period: salaryPeriod };
    }

    setSubmitting(true);
    const res = await updateJobAction(job._id, payload);
    if (res.success) {
      toast.success("Job updated successfully");
      router.push(`/hr/jobs/${job._id}`);
    } else {
      toast.error(res.message);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-400" size={32} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">Job not found.</p>
        <Link href="/hr/dashboard" className="text-violet-400 hover:text-violet-300 text-sm">Back to Dashboard</Link>
      </div>
    );
  }

  const skillSuggestions = POSITION_SKILLS[job.position] ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const labelClass = "block text-xs font-semibold text-zinc-400 mb-1.5";
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition";
  const selectClass = `${inputClass} cursor-pointer`;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Sticky nav */}
      <div className="border-b border-white/8 sticky top-0 z-40 bg-[#0d0d15]/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/hr/jobs/${job._id}`} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/8 transition">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Edit Job</h1>
              <p className="text-xs text-zinc-500">{job.position} · {job.department}</p>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={submitting}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save Changes
          </Button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: form */}
          <div className="lg:col-span-2 space-y-5">

            {/* Position (read-only) */}
            <Card className="bg-[#0d0d15] border-white/8 p-6 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-4">Position (cannot be changed)</h3>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8">
                <span className="text-sm font-semibold text-white">{job.position}</span>
                <span className="ml-auto text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">{job.department}</span>
              </div>
            </Card>

            {/* Basic info */}
            <Card className="bg-[#0d0d15] border-white/8 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white mb-1">Basic Information</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Experience Level</label>
                  <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className={selectClass}>
                    <option value="" disabled>Select level</option>
                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
                    {JOB_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Deadline</label>
                <input type="date" min={today} value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Shortlist Count</label>
                <input type="number" min={1} max={100} value={shortlistCount}
                  onChange={(e) => setShortlistCount(Number(e.target.value))} className={inputClass} />
                <p className="text-xs text-zinc-600 mt-1">Max applicants to shortlist for interview</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass + " mb-0"}>Location</label>
                  <button onClick={() => setRemote(!remote)}
                    className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full border transition ${remote ? "bg-violet-600/20 border-violet-500/30 text-violet-300" : "bg-white/5 border-white/10 text-zinc-400"}`}>
                    <span className={`w-3 h-3 rounded-full ${remote ? "bg-violet-400" : "bg-zinc-600"}`} />
                    Remote
                  </button>
                </div>
                {!remote && (
                  <select value={location} onChange={(e) => setLocation(e.target.value)} className={selectClass}>
                    <option value="" disabled>Select city</option>
                    {NEPAL_LOCATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>
            </Card>

            {/* Description */}
            <Card className="bg-[#0d0d15] border-white/8 p-6 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-4">Job Description</h3>
              <textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe responsibilities, requirements, and what makes this role exciting…"
                className={inputClass + " resize-none"}
              />
              <p className="text-xs text-zinc-600 mt-1 text-right">{description.length} chars</p>
            </Card>

            {/* Skills */}
            <Card className="bg-[#0d0d15] border-white/8 p-6 rounded-xl space-y-5">
              <h3 className="text-sm font-bold text-white">Skills</h3>
              <SkillPicker label="Must-Have Skills" color="violet" suggestions={skillSuggestions}
                selected={mustHaveSkills} onChange={setMustHaveSkills} />
              <SkillPicker label="Nice-to-Have Skills" color="sky" suggestions={skillSuggestions}
                selected={niceToHaveSkills} onChange={setNiceToHaveSkills} />
            </Card>

            {/* Salary */}
            <Card className="bg-[#0d0d15] border-white/8 p-6 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-4">Compensation</h3>
              <div className="flex gap-2 mb-4">
                {(["none", "negotiable", "fixed", "range"] as const).map((t) => (
                  <button key={t} onClick={() => setSalaryType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition capitalize ${salaryType === t ? "bg-violet-600 border-violet-600 text-white" : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"}`}>
                    {t === "none" ? "Not specified" : t}
                  </button>
                ))}
              </div>
              {(salaryType === "fixed" || salaryType === "range") && (
                <div className="grid sm:grid-cols-3 gap-3">
                  {salaryType === "range" && (
                    <div>
                      <label className={labelClass}>Min (NPR)</label>
                      <input type="number" min={0} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className={inputClass} placeholder="e.g. 30000" />
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>{salaryType === "range" ? "Max (NPR)" : "Amount (NPR)"}</label>
                    <input type="number" min={0} value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className={inputClass} placeholder="e.g. 60000" />
                  </div>
                  <div>
                    <label className={labelClass}>Period</label>
                    <select value={salaryPeriod} onChange={(e) => setSalaryPeriod(e.target.value)} className={selectClass}>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
                </div>
              )}
            </Card>

            {/* Interview */}
            <Card className="bg-[#0d0d15] border-white/8 p-6 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-4">AI Interview Configuration</h3>

              <div className="mb-4">
                <label className={labelClass}>Number of Questions</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => handleNumQuestionsChange(n)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold border transition ${numQuestions === n ? "bg-violet-600 border-violet-600 text-white" : "bg-white/5 border-white/10 text-zinc-400 hover:border-violet-500/50"}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className={labelClass}>Interview Tone</label>
                <div className="flex flex-wrap gap-2">
                  {INTERVIEW_TONE.map((t) => (
                    <button key={t} onClick={() => setInterviewTone(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition capitalize ${interviewTone === t ? "bg-violet-600 border-violet-600 text-white" : "bg-white/5 border-white/10 text-zinc-400 hover:border-violet-500/50"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className={labelClass}>Interview Questions</label>
                {questions.map((q, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-violet-600/25 text-violet-400 text-xs flex items-center justify-center flex-shrink-0 mt-2.5">{i + 1}</span>
                    <textarea
                      rows={2}
                      value={q}
                      onChange={(e) => setQuestions((prev) => { const a = [...prev]; a[i] = e.target.value; return a; })}
                      placeholder={`Question ${i + 1}…`}
                      className={inputClass + " resize-none"}
                    />
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-[#0d0d15] border-white/8 p-5 rounded-xl">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">Summary</h3>
              <div className="space-y-2 text-xs text-zinc-400">
                <div className="flex justify-between"><span>Position</span><span className="text-white font-medium truncate max-w-[120px] text-right">{job.position}</span></div>
                <div className="flex justify-between"><span>Department</span><span className="text-white font-medium">{job.department ?? "—"}</span></div>
                <div className="flex justify-between"><span>Level</span><span className="text-white font-medium">{experienceLevel || "—"}</span></div>
                <div className="flex justify-between"><span>Location</span><span className="text-white font-medium">{remote ? "Remote" : location || "—"}</span></div>
                <div className="flex justify-between"><span>Status</span><span className="text-white font-medium">{status}</span></div>
                <div className="flex justify-between"><span>Deadline</span><span className="text-white font-medium">{deadline || "—"}</span></div>
                <div className="flex justify-between"><span>Must-have skills</span><span className="text-white font-medium">{mustHaveSkills.length}</span></div>
                <div className="flex justify-between"><span>Questions</span><span className="text-white font-medium">{numQuestions}</span></div>
              </div>
            </Card>

            <Button onClick={handleSubmit} disabled={submitting}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Save Changes
            </Button>

            <Link href={`/hr/jobs/${job._id}`} className="block">
              <Button variant="outline" className="w-full border-white/10 bg-transparent text-zinc-400 hover:bg-white/5 text-sm">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

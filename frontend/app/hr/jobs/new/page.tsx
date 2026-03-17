"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createJobAction,
  type JobSalary,
  type JobInterview,
} from "@/lib/actions";
import {
  POSITIONS_BY_DEPARTMENT,
  EXPERIENCE_LEVELS,
  NEPAL_LOCATIONS,
  INTERVIEW_TONE,
  POSITION_SKILLS,
  POSITION_DEPARTMENT_MAP,
} from "@/lib/constants";

const animCSS = `
@keyframes fadeInUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes cardPop{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
@keyframes pulse-step{0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.2)}50%{box-shadow:0 0 0 6px rgba(139,92,246,0)}}
`;

type SalaryType = "none" | "negotiable" | "fixed" | "range";
type SalaryPeriod = "monthly" | "yearly";

interface FormState {
  position: string;
  experienceLevel: string;
  remote: boolean;
  location: string;
  deadline: string;
  description: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  salaryType: SalaryType;
  salaryMin: string;
  salaryMax: string;
  salaryPeriod: SalaryPeriod;
  shortlistCount: string;
  numQuestions: number;
  questions: string[];
  interviewTone: string;
}

const STEPS = ["Basic", "Description", "Skills", "Compensation", "Interview"];

const INITIAL: FormState = {
  position: "",
  experienceLevel: "",
  remote: false,
  location: "",
  deadline: "",
  description: "",
  mustHaveSkills: [],
  niceToHaveSkills: [],
  salaryType: "none",
  salaryMin: "",
  salaryMax: "",
  salaryPeriod: "monthly",
  shortlistCount: "5",
  numQuestions: 3,
  questions: ["", "", ""],
  interviewTone: "mixed",
};

const inputCls =
  "w-full bg-white/[0.04] border border-white/10 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white/[0.06] transition-all duration-300";
const labelCls =
  "block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full bg-white/[0.04] border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 appearance-none cursor-pointer";

export default function CreateJobPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [positionOpen, setPositionOpen] = useState(false);
  const [experienceLevelOpen, setExperienceLevelOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  const availableSkills: string[] = form.position
    ? (POSITION_SKILLS[form.position] ?? [])
    : [];
  const department = form.position
    ? (POSITION_DEPARTMENT_MAP[form.position] ?? "")
    : "";

  const set = (patch: Partial<FormState>) =>
    setForm((p) => ({ ...p, ...patch }));

  const addSkill = (skill: string, nice: boolean) => {
    const key: keyof FormState = nice ? "niceToHaveSkills" : "mustHaveSkills";
    const list = form[key] as string[];
    if (!skill || list.includes(skill)) return;
    set({ [key]: [...list, skill] });
  };

  const removeSkill = (skill: string, nice: boolean) => {
    const key: keyof FormState = nice ? "niceToHaveSkills" : "mustHaveSkills";
    set({ [key]: (form[key] as string[]).filter((s) => s !== skill) });
  };

  const setQuestion = (idx: number, val: string) => {
    const qs = [...form.questions];
    qs[idx] = val;
    set({ questions: qs });
  };

  const setNumQuestions = (n: number) => {
    const qs = Array.from({ length: n }, (_, i) => form.questions[i] ?? "");
    set({ numQuestions: n, questions: qs });
  };

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.position) return "Please select a position.";
      if (!form.experienceLevel) return "Please select an experience level.";
      if (!form.remote && !form.location)
        return "Please select a location for on-site jobs.";
      if (!form.deadline) return "Please set an application deadline.";
      if (new Date(form.deadline) <= new Date())
        return "Deadline must be a future date.";
    }
    if (step === 1) {
      if (!form.description.trim()) return "Job description is required.";
    }
    if (step === 3) {
      const count = parseInt(form.shortlistCount, 10);
      if (!form.shortlistCount || isNaN(count) || count < 1)
        return "Shortlist count must be at least 1.";
      if (form.salaryType === "fixed" || form.salaryType === "range") {
        if (!form.salaryMax) return "Max salary is required.";
        if (form.salaryType === "range" && !form.salaryMin)
          return "Min salary is required.";
        if (
          form.salaryType === "range" &&
          parseFloat(form.salaryMin) >= parseFloat(form.salaryMax)
        )
          return "Min salary must be less than max salary.";
      }
    }
    if (step === 4) {
      for (let i = 0; i < form.numQuestions; i++) {
        if (!form.questions[i]?.trim())
          return `Question ${i + 1} cannot be empty.`;
      }
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = () => {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }

    let salary: JobSalary | undefined;
    if (form.salaryType !== "none") {
      salary = { type: form.salaryType as JobSalary["type"] };
      if (form.salaryType === "fixed" || form.salaryType === "range") {
        salary.max = parseFloat(form.salaryMax);
        salary.period = form.salaryPeriod;
      }
      if (form.salaryType === "range") salary.min = parseFloat(form.salaryMin);
    }

    const interview: JobInterview = {
      num_questions: form.numQuestions,
      questions: form.questions.slice(0, form.numQuestions),
      interviewTone: form.interviewTone,
    };

    const payload = {
      position: form.position,
      experienceLevel: form.experienceLevel,
      remote: form.remote,
      ...(form.remote ? {} : { location: form.location }),
      description: form.description,
      deadline: new Date(form.deadline).toISOString(),
      shortlistCount: parseInt(form.shortlistCount, 10),
      mustHaveSkills: form.mustHaveSkills,
      niceToHaveSkills: form.niceToHaveSkills,
      ...(salary ? { salary } : {}),
      interview,
    };

    startTransition(async () => {
      const result = await createJobAction(payload);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/hr/dashboard");
    });
  };

  return (
    <div className="min-h-screen bg-[#07070d]">
      <style dangerouslySetInnerHTML={{ __html: animCSS }} />

      {/* Nav */}
      <div className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#0c0c18]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/hr/dashboard"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                Create Job Opening
              </h1>
              <p className="text-xs text-zinc-500">
                Step {step + 1} of {STEPS.length} — {STEPS[step]}
              </p>
            </div>
          </div>
          {/* Animated step indicator */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i < step
                    ? "bg-violet-500 w-2"
                    : i === step
                      ? "bg-gradient-to-r from-violet-500 to-indigo-500 w-8"
                      : "bg-white/15 w-2"
                }`}
                style={i === step ? { animation: "pulse-step 2s ease-in-out infinite" } : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {step === 0 && (
              <div
                className="relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden"
                style={{ animation: "cardPop .3s ease" }}
              >
                <div className="absolute inset-0 bg-[#0c0c18]/80" />
                <div className="relative z-10">
                  <h2 className="text-base font-bold text-white mb-5">
                    Basic Information
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className={labelCls}>Position *</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setPositionOpen((p) => !p)}
                          className={`${inputCls} flex items-center justify-between text-left`}
                        >
                          <span className={form.position ? "text-white" : "text-zinc-600"}>
                            {form.position || "Select a position…"}
                          </span>
                          <ChevronDown size={14} className={`text-zinc-500 shrink-0 ml-2 transition-transform duration-200 ${positionOpen ? "rotate-180" : ""}`} />
                        </button>
                        {positionOpen && (
                          <div className="absolute z-30 left-0 top-full mt-1 w-full bg-[#111122] border border-white/10 rounded-2xl shadow-2xl max-h-72 overflow-y-auto">
                            {POSITIONS_BY_DEPARTMENT.map((group) => (
                              <div key={group.department}>
                                <p className="px-4 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                                  {group.department}
                                </p>
                                {group.positions.map((pos) => (
                                  <button
                                    key={pos}
                                    type="button"
                                    onClick={() => {
                                      set({ position: pos, mustHaveSkills: [], niceToHaveSkills: [] });
                                      setPositionOpen(false);
                                    }}
                                    className={`w-full text-left px-5 py-2.5 text-sm transition ${form.position === pos ? "text-violet-300 bg-violet-600/15" : "text-zinc-300 hover:bg-white/5"}`}
                                  >
                                    {pos}
                                  </button>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {department && (
                        <p className="text-xs text-zinc-500 mt-1.5">
                          Auto-department:{" "}
                          <span className="text-violet-400">{department}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Experience Level *</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setExperienceLevelOpen((p) => !p); setLocationOpen(false); setPositionOpen(false); }}
                          className={`${inputCls} flex items-center justify-between text-left`}
                        >
                          <span className={form.experienceLevel ? "text-white" : "text-zinc-600"}>
                            {form.experienceLevel || "Select level…"}
                          </span>
                          <ChevronDown size={14} className={`text-zinc-500 shrink-0 ml-2 transition-transform duration-200 ${experienceLevelOpen ? "rotate-180" : ""}`} />
                        </button>
                        {experienceLevelOpen && (
                          <div className="absolute z-30 left-0 top-full mt-1 w-full bg-[#111122] border border-white/10 rounded-2xl shadow-2xl overflow-hidden" style={{ animation: "fadeInUp .15s ease" }}>
                            {EXPERIENCE_LEVELS.map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => {
                                  set({ experienceLevel: level });
                                  setExperienceLevelOpen(false);
                                }}
                                className={`w-full text-left px-5 py-3 text-sm transition-all ${form.experienceLevel === level ? "text-violet-300 bg-violet-600/15" : "text-zinc-300 hover:bg-white/[0.06]"}`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-4 px-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-colors">
                      <div>
                        <p className="text-sm font-medium text-white">Remote Position</p>
                        <p className="text-xs text-zinc-500">Candidates can work from anywhere</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => set({ remote: !form.remote, location: "" })}
                        className={`relative w-12 h-7 rounded-full transition-all duration-300 shrink-0 ${form.remote ? "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-600/25" : "bg-white/15"}`}
                      >
                        <span
                          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300"
                          style={{ left: form.remote ? 'calc(100% - 24px)' : '4px' }}
                        />
                      </button>
                    </div>

                    {!form.remote && (
                      <div>
                        <label className={labelCls}>Location *</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => { setLocationOpen((p) => !p); setExperienceLevelOpen(false); setPositionOpen(false); setLocationSearch(""); }}
                            className={`${inputCls} flex items-center justify-between text-left`}
                          >
                            <span className={form.location ? "text-white" : "text-zinc-600"}>
                              {form.location || "Select location…"}
                            </span>
                            <ChevronDown size={14} className={`text-zinc-500 shrink-0 ml-2 transition-transform duration-200 ${locationOpen ? "rotate-180" : ""}`} />
                          </button>
                          {locationOpen && (
                            <div className="absolute z-30 left-0 top-full mt-1 w-full bg-[#111122] border border-white/10 rounded-2xl shadow-2xl overflow-hidden" style={{ animation: "fadeInUp .15s ease" }}>
                              {/* Search input */}
                              <div className="p-2 border-b border-white/[0.06]">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                                  <input
                                    type="text"
                                    placeholder="Search locations…"
                                    value={locationSearch}
                                    onChange={(e) => setLocationSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-all"
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="max-h-56 overflow-y-auto">
                                {NEPAL_LOCATIONS.filter((loc) =>
                                  loc.toLowerCase().includes(locationSearch.toLowerCase())
                                ).map((loc) => (
                                  <button
                                    key={loc}
                                    type="button"
                                    onClick={() => {
                                      set({ location: loc });
                                      setLocationOpen(false);
                                      setLocationSearch("");
                                    }}
                                    className={`w-full text-left px-5 py-3 text-sm transition-all ${form.location === loc ? "text-violet-300 bg-violet-600/15" : "text-zinc-300 hover:bg-white/[0.06]"}`}
                                  >
                                    {loc}
                                  </button>
                                ))}
                                {NEPAL_LOCATIONS.filter((loc) =>
                                  loc.toLowerCase().includes(locationSearch.toLowerCase())
                                ).length === 0 && (
                                  <p className="px-5 py-3 text-sm text-zinc-500">No locations found</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className={labelCls}>Application Deadline *</label>
                      <input
                        type="date"
                        value={form.deadline}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => set({ deadline: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div
                className="relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden"
                style={{ animation: "cardPop .3s ease" }}
              >
                <div className="absolute inset-0 bg-[#0c0c18]/80" />
                <div className="relative z-10">
                  <h2 className="text-base font-bold text-white mb-5">Job Description</h2>
                  <label className={labelCls}>Description *</label>
                  <textarea
                    rows={12}
                    placeholder="Describe the role, responsibilities, and what success looks like…"
                    value={form.description}
                    onChange={(e) => set({ description: e.target.value })}
                    className={`${inputCls} resize-none`}
                  />
                  <p className="text-xs text-zinc-600 mt-1.5 text-right">
                    {form.description.length} characters
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div
                className="relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden"
                style={{ animation: "cardPop .3s ease" }}
              >
                <div className="absolute inset-0 bg-[#0c0c18]/80" />
                <div className="relative z-10">
                  <h2 className="text-base font-bold text-white mb-1">Skills</h2>
                  {!form.position ? (
                    <p className="text-zinc-500 text-sm mt-2">
                      Please select a position in step 1 to see available skills.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-500 mb-5">
                        Click skills to add or remove them. Selecting relevant
                        skills improves ATS scoring.
                      </p>
                      <SkillPicker
                        label="Must-Have Skills"
                        available={availableSkills}
                        selected={form.mustHaveSkills}
                        onAdd={(s) => addSkill(s, false)}
                        onRemove={(s) => removeSkill(s, false)}
                        accentClass="text-violet-400 bg-violet-400/10 border-violet-400/20"
                      />
                      <div className="mt-6">
                        <SkillPicker
                          label="Nice-to-Have Skills"
                          available={availableSkills.filter(
                            (s) => !form.mustHaveSkills.includes(s),
                          )}
                          selected={form.niceToHaveSkills}
                          onAdd={(s) => addSkill(s, true)}
                          onRemove={(s) => removeSkill(s, true)}
                          accentClass="text-sky-400 bg-sky-400/10 border-sky-400/20"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div
                className="relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden"
                style={{ animation: "cardPop .3s ease" }}
              >
                <div className="absolute inset-0 bg-[#0c0c18]/80" />
                <div className="relative z-10">
                  <h2 className="text-base font-bold text-white mb-5">
                    Compensation & Shortlisting
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className={labelCls}>Shortlist Count *</label>
                      <input
                        type="number"
                        min={1}
                        value={form.shortlistCount}
                        onChange={(e) => set({ shortlistCount: e.target.value })}
                        className={inputCls}
                        placeholder="e.g. 5"
                      />
                      <p className="text-xs text-zinc-600 mt-1.5">
                        How many top candidates to shortlist after ATS screening.
                      </p>
                    </div>
                    <div>
                      <label className={labelCls}>Salary Type</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(["none", "negotiable", "fixed", "range"] as SalaryType[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => set({ salaryType: t })}
                            className={`py-2.5 rounded-xl text-xs font-medium capitalize border transition-all duration-300 ${
                              form.salaryType === t
                                ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-violet-500/50 text-white"
                                : "border-white/10 text-zinc-400 hover:bg-white/[0.04]"
                            }`}
                          >
                            {t === "none" ? "Not disclosed" : t}
                          </button>
                        ))}
                      </div>
                    </div>
                    {form.salaryType !== "none" &&
                      form.salaryType !== "negotiable" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {form.salaryType === "range" && (
                              <div>
                                <label className={labelCls}>Min (NPR)</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={form.salaryMin}
                                  onChange={(e) => set({ salaryMin: e.target.value })}
                                  className={inputCls}
                                  placeholder="50000"
                                />
                              </div>
                            )}
                            <div className={form.salaryType === "range" ? "" : "col-span-2"}>
                              <label className={labelCls}>
                                {form.salaryType === "range" ? "Max (NPR)" : "Amount (NPR)"}
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={form.salaryMax}
                                onChange={(e) => set({ salaryMax: e.target.value })}
                                className={inputCls}
                                placeholder="100000"
                              />
                            </div>
                          </div>
                          <div>
                            <label className={labelCls}>Pay Period</label>
                            <div className="flex gap-3">
                              {(["monthly", "yearly"] as SalaryPeriod[]).map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => set({ salaryPeriod: p })}
                                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize border transition-all duration-300 ${
                                    form.salaryPeriod === p
                                      ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-violet-500/50 text-white"
                                      : "border-white/10 text-zinc-400 hover:bg-white/[0.04]"
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div
                className="relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden"
                style={{ animation: "cardPop .3s ease" }}
              >
                <div className="absolute inset-0 bg-[#0c0c18]/80" />
                <div className="relative z-10">
                  <h2 className="text-base font-bold text-white mb-5">
                    AI Interview Configuration
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className={labelCls}>Number of Questions (1–5) *</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setNumQuestions(n)}
                            className={`w-11 h-11 rounded-xl text-sm font-bold border transition-all duration-300 ${
                              form.numQuestions === n
                                ? "bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 text-white shadow-lg shadow-violet-600/20"
                                : "border-white/10 text-zinc-400 hover:bg-white/[0.04]"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className={labelCls}>Interview Questions *</label>
                      {Array.from({ length: form.numQuestions }).map((_, i) => (
                        <div key={i} style={{ animation: `fadeInUp ${0.3 + i * 0.05}s ease` }}>
                          <label className="text-xs text-zinc-500 mb-1 block">
                            Question {i + 1}
                          </label>
                          <input
                            type="text"
                            value={form.questions[i] ?? ""}
                            onChange={(e) => setQuestion(i, e.target.value)}
                            placeholder={`Enter question ${i + 1}…`}
                            className={inputCls}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className={labelCls}>Interview Tone</label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {INTERVIEW_TONE.map((tone) => (
                          <button
                            key={tone}
                            type="button"
                            onClick={() => set({ interviewTone: tone })}
                            className={`py-2.5 rounded-xl text-xs font-medium capitalize border transition-all duration-300 ${
                              form.interviewTone === tone
                                ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-violet-500/50 text-white"
                                : "border-white/10 text-zinc-400 hover:bg-white/[0.04]"
                            }`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  step === 0 ? router.back() : setStep((s) => s - 1)
                }
                className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 gap-2 rounded-xl"
              >
                <ArrowLeft size={16} />
                {step === 0 ? "Cancel" : "Back"}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white gap-2 rounded-xl shadow-lg shadow-violet-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                  <span className="relative flex items-center gap-2">Continue <ArrowRight size={16} /></span>
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white gap-2 min-w-36 rounded-xl shadow-lg shadow-violet-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                  <span className="relative flex items-center gap-2">
                    {isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={16} /> Save as Draft
                      </>
                    )}
                  </span>
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="relative rounded-2xl p-5 border border-white/[0.06] overflow-hidden" style={{ animation: "fadeInUp .4s ease" }}>
              <div className="absolute inset-0 bg-[#0c0c18]/80" />
              <div className="relative z-10">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">
                  Summary
                </h3>
                <div className="space-y-3">
                  <SummaryRow label="Position" value={form.position || "—"} highlight={!!form.position} />
                  <SummaryRow label="Department" value={department || "—"} highlight={!!department} />
                  <SummaryRow label="Level" value={form.experienceLevel || "—"} highlight={!!form.experienceLevel} />
                  <SummaryRow label="Type" value={form.remote ? "Remote" : "On-site"} highlight />
                  {!form.remote && <SummaryRow label="Location" value={form.location || "—"} highlight={!!form.location} />}
                  <SummaryRow label="Deadline" value={form.deadline ? new Date(form.deadline).toLocaleDateString() : "—"} highlight={!!form.deadline} />
                  <SummaryRow label="Must-Have Skills" value={form.mustHaveSkills.length ? `${form.mustHaveSkills.length} selected` : "—"} highlight={form.mustHaveSkills.length > 0} />
                  <SummaryRow label="Shortlist Count" value={form.shortlistCount || "—"} highlight={!!form.shortlistCount} />
                  <SummaryRow label="Interview Tone" value={form.interviewTone} highlight />
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl p-5 border border-white/[0.06] overflow-hidden" style={{ animation: "fadeInUp .5s ease" }}>
              <div className="absolute inset-0 bg-[#0c0c18]/80" />
              <div className="relative z-10">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                  Progress
                </h3>
                <div className="space-y-2.5">
                  {STEPS.map((label, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 transition-all duration-300 ${
                          i < step
                            ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-600/20"
                            : i === step
                              ? "border-2 border-violet-500 text-violet-400"
                              : "border border-white/15 text-zinc-600"
                        }`}
                      >
                        {i < step ? <Check size={12} /> : i + 1}
                      </div>
                      <span
                        className={`text-sm ${i <= step ? "text-zinc-300" : "text-zinc-600"}`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SkillPicker({
  label,
  available,
  selected,
  onAdd,
  onRemove,
  accentClass,
}: {
  label: string;
  available: string[];
  selected: string[];
  onAdd: (s: string) => void;
  onRemove: (s: string) => void;
  accentClass: string;
}) {
  const unselected = available.filter((s) => !selected.includes(s));
  return (
    <div>
      <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">
        {label}
      </p>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {selected.map((skill) => (
            <span
              key={skill}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border ${accentClass} transition-all hover:scale-[1.03]`}
            >
              {skill}
              <button
                type="button"
                onClick={() => onRemove(skill)}
                className="ml-0.5 hover:opacity-60 transition"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      {unselected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unselected.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => onAdd(skill)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-white/10 text-zinc-400 hover:border-white/25 hover:text-white hover:bg-white/[0.03] transition-all"
            >
              <Plus size={10} />
              {skill}
            </button>
          ))}
        </div>
      )}
      {available.length === 0 && (
        <p className="text-xs text-zinc-600">No skills available.</p>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline gap-2">
      <span className="text-xs text-zinc-600 shrink-0">{label}</span>
      <span
        className={`text-xs font-medium text-right truncate max-w-[60%] ${highlight ? "text-zinc-300" : "text-zinc-600"}`}
      >
        {value}
      </span>
    </div>
  );
}

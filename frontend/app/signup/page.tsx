"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowLeft, UserPlus, Briefcase, Target } from "lucide-react";
import { registerCandidateAction, registerHrAction } from "@/lib/actions";

const animCSS = `
@keyframes float1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-40px) scale(1.12)}}
@keyframes float2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-25px,35px) scale(1.08)}}
@keyframes float3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,25px) scale(1.15)}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes fadeInUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse-dot{0%,100%{opacity:.25}50%{opacity:.6}}
@keyframes cardPop{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
`;

const HR_DESIGNATIONS = [
  "HR Intern",
  "HR Assistant",
  "HR Coordinator",
  "Recruitment Coordinator",
  "Talent Acquisition Coordinator",
  "HR Generalist",
  "HR Specialist",
  "Recruiter",
  "Talent Acquisition Specialist",
  "Compensation & Benefits Specialist",
  "HR Manager",
  "Talent Acquisition Manager",
  "Senior Recruiter",
  "Senior HR Manager",
  "HR Director",
];

const inputClass =
  "w-full bg-white/[0.04] border border-white/10 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white/[0.06] transition-all duration-300 disabled:opacity-50";
const labelClass =
  "text-xs font-semibold text-zinc-300 uppercase tracking-wide block mb-1.5";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"candidate" | "hr" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    company: "",
    designation: "",
  });

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    if (!form.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!form.phone.match(/^\+?[0-9]{7,15}$/)) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    if (
      !form.password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      )
    ) {
      toast.error(
        "Password: 8+ chars, uppercase, lowercase, number & special character",
      );
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (role === "hr" && !form.company.trim()) {
      toast.error("Company name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    startTransition(async () => {
      const result =
        role === "candidate"
          ? await registerCandidateAction({
              fullName: form.fullName,
              email: form.email,
              phone: form.phone,
              password: form.password,
            })
          : await registerHrAction({
              fullName: form.fullName,
              email: form.email,
              phone: form.phone,
              password: form.password,
              company: form.company,
              ...(form.designation ? { designation: form.designation } : {}),
            });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push(`/verify-otp?token=${encodeURIComponent(result.data.token)}`);
    });
  };

  /* ── Password strength indicator ────────────────────────────────── */
  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[@$!%*?&]/.test(p)) score++;
    if (score <= 2) return { level: score, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { level: score, label: "Fair", color: "bg-amber-500" };
    if (score <= 4) return { level: score, label: "Good", color: "bg-blue-500" };
    return { level: score, label: "Strong", color: "bg-emerald-500" };
  };
  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-[#07070d] text-white flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: animCSS }} />

      {/* ── Animated gradient orbs ─────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/[0.12] rounded-full blur-[140px]"
          style={{ animation: "float1 12s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-indigo-500/[0.08] rounded-full blur-[100px]"
          style={{ animation: "float2 15s ease-in-out infinite" }}
        />
        <div
          className="absolute top-1/3 -left-20 w-[250px] h-[250px] bg-fuchsia-500/[0.06] rounded-full blur-[90px]"
          style={{ animation: "float3 18s ease-in-out infinite" }}
        />
      </div>

      {/* ── Floating particle dots ────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: "15%", left: "12%", delay: "0s", size: 3 },
          { top: "28%", right: "18%", delay: "1.5s", size: 2 },
          { bottom: "22%", left: "22%", delay: "3s", size: 2 },
          { top: "60%", right: "10%", delay: "0.8s", size: 3 },
          { top: "80%", left: "45%", delay: "2.2s", size: 2 },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-violet-400/40"
            style={{
              ...p,
              width: p.size,
              height: p.size,
              animation: `pulse-dot 3s ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 justify-center mb-8 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/30 rounded-xl blur-lg group-hover:bg-violet-500/40 transition-all" />
            <Image src="/roj-ai-logo.png" alt="ROJ.AI" width={32} height={32} className="rounded-xl relative" />
          </div>
          <span className="font-bold text-white tracking-tight text-base">
            ROJ<span className="text-violet-400">.AI</span>
          </span>
        </Link>

        {/* ── Glassmorphism Card ──────────────────────────────────── */}
        <div className="relative rounded-2xl p-8 shadow-2xl shadow-black/60">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-white/[0.01] pointer-events-none" />
          <div className="absolute inset-0 rounded-2xl bg-[#0c0c18]/90 backdrop-blur-xl" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-500/[0.03] to-transparent pointer-events-none" />

          <div className="relative z-10">
            {step === 1 ? (
              /* ── Step 1: Role selection ─────────────────────────── */
              <div style={{ animation: "cardPop .4s ease" }}>
                <div className="mb-7">
                  <h1 className="text-2xl font-bold text-white mb-1.5">
                    Create account
                  </h1>
                  <p className="text-zinc-400 text-sm">Who are you joining as?</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setRole("candidate")}
                    className={`group/card relative p-5 rounded-xl border-2 text-left transition-all duration-300 overflow-hidden ${
                      role === "candidate"
                        ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                        : "border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    {role === "candidate" && (
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent pointer-events-none" />
                    )}
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-300 ${role === "candidate" ? "bg-violet-500/20" : "bg-white/5"}`}>
                        <Target size={20} className={`transition-colors duration-300 ${role === "candidate" ? "text-violet-400" : "text-zinc-400"}`} />
                      </div>
                      <div className="font-semibold text-white text-sm">
                        Candidate
                      </div>
                      <div className="text-zinc-500 text-xs mt-0.5">
                        Looking for work
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("hr")}
                    className={`group/card relative p-5 rounded-xl border-2 text-left transition-all duration-300 overflow-hidden ${
                      role === "hr"
                        ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                        : "border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    {role === "hr" && (
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent pointer-events-none" />
                    )}
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-300 ${role === "hr" ? "bg-violet-500/20" : "bg-white/5"}`}>
                        <Briefcase size={20} className={`transition-colors duration-300 ${role === "hr" ? "text-violet-400" : "text-zinc-400"}`} />
                      </div>
                      <div className="font-semibold text-white text-sm">
                        HR Professional
                      </div>
                      <div className="text-zinc-500 text-xs mt-0.5">
                        Hiring talent
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => role && setStep(2)}
                  disabled={!role}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                  <span className="relative">Continue →</span>
                </button>
              </div>
            ) : (
              /* ── Step 2: Details form ───────────────────────────── */
              <div style={{ animation: "cardPop .4s ease" }}>
                <div className="flex items-center gap-3 mb-7">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-white">Your details</h1>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {role === "candidate"
                        ? "Signing up as a Candidate"
                        : "Signing up as HR Professional"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div style={{ animation: "fadeInUp .4s ease" }}>
                    <label className={labelClass} htmlFor="fullName">
                      Full name
                    </label>
                    <input
                      id="fullName"
                      value={form.fullName}
                      onChange={set("fullName")}
                      placeholder="Jane Doe"
                      disabled={isPending}
                      className={inputClass}
                    />
                  </div>

                  <div style={{ animation: "fadeInUp .45s ease" }}>
                    <label className={labelClass} htmlFor="email">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@company.com"
                      autoComplete="email"
                      disabled={isPending}
                      className={inputClass}
                    />
                  </div>

                  <div style={{ animation: "fadeInUp .5s ease" }}>
                    <label className={labelClass} htmlFor="phone">
                      Phone number
                    </label>
                    <input
                      id="phone"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+1234567890"
                      disabled={isPending}
                      className={inputClass}
                    />
                  </div>

                  {role === "hr" && (
                    <>
                      <div style={{ animation: "fadeInUp .52s ease" }}>
                        <label className={labelClass} htmlFor="company">
                          Company
                        </label>
                        <input
                          id="company"
                          value={form.company}
                          onChange={set("company")}
                          placeholder="Acme Corp"
                          disabled={isPending}
                          className={inputClass}
                        />
                      </div>
                      <div style={{ animation: "fadeInUp .54s ease" }}>
                        <label className={labelClass} htmlFor="designation">
                          Designation{" "}
                          <span className="text-zinc-600 normal-case font-normal">
                            (optional)
                          </span>
                        </label>
                        <select
                          id="designation"
                          value={form.designation}
                          onChange={set("designation")}
                          disabled={isPending}
                          className={`${inputClass} appearance-none cursor-pointer`}
                        >
                          <option value="" className="bg-[#0c0c18]">
                            Select a designation
                          </option>
                          {HR_DESIGNATIONS.map((d) => (
                            <option key={d} value={d} className="bg-[#0c0c18]">
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div style={{ animation: "fadeInUp .55s ease" }}>
                    <label className={labelClass} htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={set("password")}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isPending}
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* Password strength meter */}
                    {form.password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                i <= strength.level ? strength.color : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-zinc-500">
                          {strength.label} — 8+ chars · uppercase · lowercase · number · special char
                        </p>
                      </div>
                    )}
                    {!form.password && (
                      <p className="text-zinc-600 text-xs mt-1.5">
                        8+ chars · uppercase · lowercase · number · special char
                      </p>
                    )}
                  </div>

                  <div style={{ animation: "fadeInUp .6s ease" }}>
                    <label className={labelClass} htmlFor="confirmPassword">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={set("confirmPassword")}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isPending}
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        tabIndex={-1}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm mt-2 shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ animation: "fadeInUp .65s ease" }}
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
                        <>
                          <Loader2 size={16} className="animate-spin" /> Creating
                          account…
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} /> Create account
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </div>
            )}

            <p className="text-center text-zinc-500 text-sm mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

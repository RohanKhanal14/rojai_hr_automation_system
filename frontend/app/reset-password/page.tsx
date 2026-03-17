"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { resetPasswordAction } from "@/lib/actions";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const animCSS = `
@keyframes float1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-40px) scale(1.12)}}
@keyframes float2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-25px,35px) scale(1.08)}}
@keyframes float3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,25px) scale(1.15)}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes fadeInUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse-dot{0%,100%{opacity:.25}50%{opacity:.6}}
@keyframes iconBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes iconGlow{0%,100%{box-shadow:0 0 20px rgba(139,92,246,0.15)}50%{box-shadow:0 0 35px rgba(139,92,246,0.3)}}
`;

const inputClass =
  "w-full bg-white/[0.04] border border-white/10 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white/[0.06] transition-all duration-300 disabled:opacity-50";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const getPasswordStrength = () => {
    const p = password;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid reset link. Please start again.");
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      toast.error(
        "Password must be 8+ characters with uppercase, lowercase, number, and special character",
      );
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction(token, password);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Password reset! Please sign in with your new password.");
      router.push("/login");
    });
  };

  if (!token) {
    return (
      <div className="text-center space-y-3 py-2">
        <p className="text-zinc-400 text-sm">Invalid reset link.</p>
        <Link
          href="/forgot-password"
          className="text-violet-400 hover:text-violet-300 transition-colors text-sm"
        >
          ← Start reset again
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-7 text-center" style={{ animation: "fadeInUp .4s ease" }}>
        <h1 className="text-2xl font-bold text-white mb-1.5">New password</h1>
        <p className="text-zinc-400 text-sm">
          Must be 8+ chars with upper, lower, number &amp; symbol
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New password */}
        <div style={{ animation: "fadeInUp .45s ease" }}>
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide block mb-1.5" htmlFor="password">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isPending}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Strength meter */}
          {password && (
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
              <p className="text-xs text-zinc-500">{strength.label}</p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div style={{ animation: "fadeInUp .5s ease" }}>
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide block mb-1.5" htmlFor="confirm">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isPending}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Match indicator */}
          {confirm && (
            <p className={`text-xs mt-1.5 ${password === confirm ? "text-emerald-400" : "text-red-400"}`}>
              {password === confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="group relative w-full overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm mt-2 shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]"
          style={{ animation: "fadeInUp .55s ease" }}
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
                <Loader2 size={16} className="animate-spin" /> Resetting…
              </>
            ) : (
              <>
                <Lock size={16} /> Reset password
              </>
            )}
          </span>
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-white flex items-center justify-center px-4 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: animCSS }} />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/[0.12] rounded-full blur-[140px]" style={{ animation: "float1 12s ease-in-out infinite" }} />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-indigo-500/[0.08] rounded-full blur-[100px]" style={{ animation: "float2 15s ease-in-out infinite" }} />
        <div className="absolute top-1/3 -left-20 w-[250px] h-[250px] bg-fuchsia-500/[0.06] rounded-full blur-[90px]" style={{ animation: "float3 18s ease-in-out infinite" }} />
      </div>

      {/* Floating particle dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: "15%", left: "12%", delay: "0s", size: 3 },
          { top: "28%", right: "18%", delay: "1.5s", size: 2 },
          { bottom: "22%", left: "22%", delay: "3s", size: 2 },
          { top: "60%", right: "10%", delay: "0.8s", size: 3 },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-violet-400/40"
            style={{ ...p, width: p.size, height: p.size, animation: `pulse-dot 3s ease-in-out ${p.delay} infinite` }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8 group">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/30 rounded-xl blur-lg group-hover:bg-violet-500/40 transition-all" />
            <Image src="/roj-ai-logo.png" alt="ROJ.AI" width={32} height={32} className="rounded-xl relative" />
          </div>
          <span className="font-bold text-white tracking-tight text-base">
            ROJ<span className="text-violet-400">.AI</span>
          </span>
        </Link>

        {/* Glassmorphism Card */}
        <div className="relative rounded-2xl p-8 shadow-2xl shadow-black/60">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-white/[0.01] pointer-events-none" />
          <div className="absolute inset-0 rounded-2xl bg-[#0c0c18]/90 backdrop-blur-xl" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-500/[0.03] to-transparent pointer-events-none" />

          <div className="relative z-10">
            {/* Animated Icon */}
            <div className="flex justify-center mb-5" style={{ animation: "fadeInUp .3s ease" }}>
              <div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/25 flex items-center justify-center"
                style={{ animation: "iconBounce 3s ease-in-out infinite, iconGlow 3s ease-in-out infinite" }}
              >
                <Lock className="text-violet-400" size={24} />
              </div>
            </div>

            <Suspense>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

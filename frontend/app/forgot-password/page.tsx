"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";
import { resetRequestAction } from "@/lib/actions";

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

function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"candidate" | "hr_professional">("candidate");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }

    startTransition(async () => {
      const result = await resetRequestAction(email, role);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push(`/reset-otp?token=${encodeURIComponent(result.data.token)}`);
    });
  };

  return (
    <>
      {/* Animated Icon */}
      <div className="flex justify-center mb-5" style={{ animation: "fadeInUp .35s ease" }}>
        <div
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/25 flex items-center justify-center"
          style={{ animation: "iconBounce 3s ease-in-out infinite, iconGlow 3s ease-in-out infinite" }}
        >
          <KeyRound className="text-violet-400" size={24} />
        </div>
      </div>

      <div className="mb-7 text-center" style={{ animation: "fadeInUp .4s ease" }}>
        <h1 className="text-2xl font-bold text-white mb-1.5">Reset password</h1>
        <p className="text-zinc-400 text-sm">
          We&apos;ll send a one-time code to your email
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role selector */}
        <div style={{ animation: "fadeInUp .45s ease" }}>
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide block mb-1.5">Account type</label>
          <div className="grid grid-cols-2 gap-2">
            {(["candidate", "hr_professional"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-all duration-300 ${
                  role === r
                    ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-violet-500/50 text-white shadow-sm shadow-violet-500/10"
                    : "bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-300"
                }`}
              >
                {r === "candidate" ? "Candidate" : "HR Professional"}
              </button>
            ))}
          </div>
        </div>

        {/* Email */}
        <div style={{ animation: "fadeInUp .5s ease" }}>
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide block mb-1.5" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isPending}
            className="w-full bg-white/[0.04] border border-white/10 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white/[0.06] transition-all duration-300 disabled:opacity-50"
          />
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
                <Loader2 size={16} className="animate-spin" /> Sending OTP…
              </>
            ) : (
              <>
                <KeyRound size={16} /> Send OTP
              </>
            )}
          </span>
        </button>
      </form>

      <p className="text-center text-zinc-500 text-sm mt-6" style={{ animation: "fadeInUp .6s ease" }}>
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
        >
          Sign in →
        </Link>
      </p>
    </>
  );
}

export default function ForgotPasswordPage() {
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
            <Suspense>
              <ForgotPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

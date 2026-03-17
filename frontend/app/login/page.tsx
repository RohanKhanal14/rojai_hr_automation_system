"use client";

import { useState, useTransition, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { loginAction } from "@/lib/actions";
import { useAuth } from "@/lib/auth-context";

/* ── keyframes injected via inline style tag ─────────────────────────── */
const animCSS = `
@keyframes float1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-40px) scale(1.12)}}
@keyframes float2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-25px,35px) scale(1.08)}}
@keyframes float3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,25px) scale(1.15)}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes fadeInUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse-dot{0%,100%{opacity:.25}50%{opacity:.6}}
`;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (!password) {
      toast.error("Password is required");
      return;
    }

    startTransition(async () => {
      const result = await loginAction(email, password);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUser(result.data.user as any);
      toast.success(result.message);
      router.replace(
        redirect ??
          (result.data.role === "hr_professional"
            ? "/hr/dashboard"
            : "/candidate/dashboard"),
      );
    });
  };

  return (
    <>
      {/* Heading */}
      <div className="mb-7" style={{ animation: "fadeInUp .5s ease" }}>
        <h1 className="text-2xl font-bold text-white mb-1.5">Welcome back</h1>
        <p className="text-zinc-400 text-sm">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div style={{ animation: "fadeInUp .55s ease" }}>
          <label
            className="text-xs font-semibold text-zinc-300 uppercase tracking-wide block mb-1.5"
            htmlFor="email"
          >
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

        {/* Password */}
        <div style={{ animation: "fadeInUp .6s ease" }}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isPending}
              className="w-full bg-white/[0.04] border border-white/10 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white/[0.06] transition-all duration-300 disabled:opacity-50"
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
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="group relative w-full overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm mt-2 shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]"
          style={{ animation: "fadeInUp .65s ease" }}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s infinite",
            }}
          />
          <span className="relative flex items-center gap-2">
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Signing in…
              </>
            ) : (
              <>
                <LogIn size={16} /> Sign in
              </>
            )}
          </span>
        </button>
      </form>

      <p
        className="text-center text-zinc-500 text-sm mt-6"
        style={{ animation: "fadeInUp .7s ease" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
        >
          Sign up →
        </Link>
      </p>

      <p
        className="text-center mt-3"
        style={{ animation: "fadeInUp .75s ease" }}
      >
        <Link
          href="/forgot-password"
          className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
        >
          Forgot password?
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-white flex items-center justify-center px-4 relative overflow-hidden">
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
          { top: "10%", right: "35%", delay: "4s", size: 2 },
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
            <Image
              src="/roj-ai-logo.png"
              alt="ROJ.AI"
              width={32}
              height={32}
              className="rounded-xl relative"
            />
          </div>
          <span className="font-bold text-white tracking-tight text-base">
            ROJ<span className="text-violet-400">.AI</span>
          </span>
        </Link>

        {/* ── Glassmorphism Card ──────────────────────────────────── */}
        <div className="relative rounded-2xl p-8 shadow-2xl shadow-black/60">
          {/* Gradient border effect */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-white/[0.01] pointer-events-none" />
          {/* Card background */}
          <div className="absolute inset-0 rounded-2xl bg-[#0c0c18]/90 backdrop-blur-xl" />
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-500/[0.03] to-transparent pointer-events-none" />

          <div className="relative z-10">
            <Suspense
              fallback={
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-zinc-600" size={20} />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { verifyOtpAction } from "@/lib/actions";
import { useAuth } from "@/lib/auth-context";

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

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const token = searchParams.get("token") ?? "";
  const email = (() => {
    try {
      return JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ).email as string;
    } catch {
      return "";
    }
  })();

  const [otp, setOtp] = useState("");
  const [attempts, setAttempts] = useState(5);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    if (!token) {
      toast.error("Invalid verification link. Please sign up again.");
      return;
    }
    startTransition(async () => {
      const result = await verifyOtpAction(token, otp);
      if (!result.success) {
        toast.error(result.message);
        const match = result.message.match(/Attempts Remaining: (\d+)/);
        if (match) setAttempts(parseInt(match[1], 10));
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUser(result.data.user as any);
      toast.success("Email verified! You're now logged in.");
      if (result.data.role === "hr_professional") router.push("/hr/dashboard");
      else router.push("/candidate/dashboard");
    });
  };

  if (!token) {
    return (
      <div className="text-center space-y-3 py-2">
        <p className="text-zinc-400 text-sm">Invalid verification link.</p>
        <Link
          href="/signup"
          className="text-violet-400 hover:text-violet-300 transition-colors text-sm"
        >
          ← Back to sign up
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email hint */}
      {email && (
        <p className="text-zinc-400 text-sm text-center" style={{ animation: "fadeInUp .5s ease" }}>
          Code sent to{" "}
          <span className="text-violet-300 font-medium">{email}</span>
        </p>
      )}

      {/* OTP input */}
      <div className="space-y-3" style={{ animation: "fadeInUp .55s ease" }}>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide text-center">
          Verification code
        </p>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={isPending}
          >
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-13 w-12 text-base font-semibold rounded-xl border-2 border-white/10 bg-white/[0.04] text-white transition-all duration-300 data-[active=true]:border-violet-500 data-[active=true]:ring-2 data-[active=true]:ring-violet-500/20 data-[active=true]:bg-violet-500/[0.06] data-[active=true]:scale-[1.05]"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        {attempts <= 3 && attempts > 0 && (
          <div className="flex justify-center">
            <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5">
              ⚠ {attempts} attempt{attempts !== 1 ? "s" : ""} remaining
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || otp.length !== 6}
        className="group relative w-full overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]"
        style={{ animation: "fadeInUp .6s ease" }}
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
              <Loader2 size={16} className="animate-spin" /> Verifying…
            </>
          ) : (
            <>
              <ShieldCheck size={16} /> Verify email
            </>
          )}
        </span>
      </button>

      <p className="text-center text-zinc-600 text-xs" style={{ animation: "fadeInUp .65s ease" }}>
        Wrong email?{" "}
        <Link
          href="/signup"
          className="text-violet-400 hover:text-violet-300 transition-colors"
        >
          Sign up again
        </Link>
      </p>
    </form>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-white flex items-center justify-center px-4 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: animCSS }} />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/[0.12] rounded-full blur-[140px]" style={{ animation: "float1 12s ease-in-out infinite" }} />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-indigo-500/[0.08] rounded-full blur-[100px]" style={{ animation: "float2 15s ease-in-out infinite" }} />
        <div className="absolute top-1/3 -right-20 w-[250px] h-[250px] bg-fuchsia-500/[0.06] rounded-full blur-[90px]" style={{ animation: "float3 18s ease-in-out infinite" }} />
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
            <div className="flex justify-center mb-5" style={{ animation: "fadeInUp .35s ease" }}>
              <div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/25 flex items-center justify-center"
                style={{ animation: "iconBounce 3s ease-in-out infinite, iconGlow 3s ease-in-out infinite" }}
              >
                <Mail className="text-violet-400" size={24} />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-7" style={{ animation: "fadeInUp .4s ease" }}>
              <h1 className="text-2xl font-bold text-white mb-1.5">
                Check your email
              </h1>
              <p className="text-zinc-500 text-sm">
                Enter the 6-digit code we sent you
              </p>
            </div>

            <Suspense
              fallback={
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-zinc-600" size={20} />
                </div>
              }
            >
              <VerifyOtpForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

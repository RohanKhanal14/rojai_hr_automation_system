"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#05050a] text-white flex flex-col items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-160px] left-1/4 w-[420px] h-[420px] rounded-full bg-indigo-500/15 blur-[120px]" />
        <div className="absolute bottom-[-120px] right-1/4 w-[380px] h-[380px] rounded-full bg-fuchsia-500/15 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/roj-ai-logo.png" alt="ROJ.AI" width={32} height={32} className="rounded-lg" />
            <span className="font-semibold tracking-tight">
              ROJ<span className="text-violet-400">.AI</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Back to landing
          </Link>
        </header>

        <main className="rounded-2xl border border-white/10 bg-white/5/80 backdrop-blur-xl shadow-2xl shadow-black/40 px-6 py-6 md:px-7 md:py-7">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-1">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-sm text-zinc-400">{subtitle}</p>
            ) : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}


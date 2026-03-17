'use client'

import Link from 'next/link'

export default function Home(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-4 z-50 flex justify-center px-4">
        <div className="w-full max-w-5xl flex items-center justify-between rounded-lg border border-white/10 bg-[#0d0d15]/80 backdrop-blur-2xl px-5 py-2.5 shadow-2xl shadow-black/50 ring-1 ring-white/5">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/roj-ai-logo.png" alt="ROJ.AI" width={28} height={28} className="rounded-lg" />
            <span className="font-bold text-white tracking-tight text-sm">
              ROJ<span className="text-violet-400">.AI</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {(
              [
                ["Features", "#features"],
                ["How it works", "#how-it-works"],
                ["Roles", "#roles"],
              ] as [string, string][]
            ).map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-full hover:bg-white/5"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="text-sm font-semibold bg-violet-600 hover:bg-violet-500 transition-all text-white px-4 py-2 rounded-full shadow-lg shadow-violet-900/40"
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative px-6 pt-24 pb-12 overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-225 h-125 bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-32 left-1/4 w-87.5 h-87.5 bg-indigo-600/8 rounded-full blur-[90px]" />
          <div className="absolute top-16 right-1/4 w-70 h-70 bg-fuchsia-600/8 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold tracking-wide mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
            </span>
            AI-Powered Recruitment Platform
          </div>
          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
            <span className="text-white">Hire smarter,</span>
            <br />
            <span className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              not harder.
            </span>
          </h1>
          <p className="max-w-xl mx-auto text-zinc-400 text-lg leading-relaxed mb-10 text-justify">
            Automate your entire recruitment pipeline from job posting and CV
            scoring to AI voice interviews so your team focuses on great hires,
            not admin.
          </p>
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <a
              href="/signup?role=hr"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 transition-all text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-violet-900/40 text-sm"
            >
              Start hiring for free
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </a>
            <a
              href="/signup?role=candidate"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 transition-all text-white font-semibold px-8 py-3.5 rounded-xl text-sm"
            >
              Apply for a job
            </a>
          </div>

          {/* Dashboard mockup */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-violet-600/20 blur-3xl rounded-full" />
            {/* Browser chrome */}
            <div className="relative rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-black/60 bg-[#0d0d15]">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#111118] border-b border-white/6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-4 h-6 rounded-md bg-white/5 flex items-center px-3 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500/50" />
                  <span className="text-xs text-zinc-500">
                    roj.ai/dashboard
                  </span>
                </div>
                <div className="w-6 h-6 rounded-md bg-white/4" />
              </div>
              {/* App content */}
              <div className="flex h-100">
                {/* Sidebar */}
                <div className="w-48 shrink-0 border-r border-white/5 bg-[#0a0a0f] p-3 hidden md:flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-3 py-2 mb-3">
                    <img src="/roj-ai-logo.png" alt="ROJ.AI" width={24} height={24} className="rounded" />
                    <span className="text-xs font-bold text-white">
                      ROJ<span className="text-violet-400">.AI</span>
                    </span>
                  </div>
                  {[
                    { label: "Dashboard", active: true },
                    { label: "Jobs", active: false },
                    { label: "Candidates", active: false },
                    { label: "Interviews", active: false },
                    { label: "Analytics", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${
                        item.active
                          ? "bg-violet-600/20 text-violet-300"
                          : "text-zinc-500"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          item.active ? "bg-violet-400" : "bg-zinc-700"
                        }`}
                      />
                      {item.label}
                    </div>
                  ))}
                  <div className="mt-auto flex items-center gap-2 px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                      P
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-white truncate">
                        Priyanka Tuladhar
                      </p>
                      <p className="text-[9px] text-zinc-500 truncate">
                        hr@leapfrog.com
                      </p>
                    </div>
                  </div>
                </div>
                {/* Main panel */}
                <div className="flex-1 overflow-hidden p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Recruitment Overview
                      </h3>
                      <p className="text-[11px] text-zinc-500">
                        Senior Frontend Engineer: 3 open roles
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 rounded-md bg-green-500/15 text-green-400 text-[10px] font-semibold border border-green-500/20">
                        Live
                      </div>
                    </div>
                  </div>
                  {/* Stat cards */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      {
                        n: "238",
                        l: "Applicants",
                        c: "text-white",
                        bg: "bg-white/3",
                      },
                      {
                        n: "47",
                        l: "Shortlisted",
                        c: "text-violet-400",
                        bg: "bg-violet-500/7",
                      },
                      {
                        n: "12",
                        l: "Interviews",
                        c: "text-indigo-400",
                        bg: "bg-indigo-500/7",
                      },
                      {
                        n: "5",
                        l: "Offers sent",
                        c: "text-green-400",
                        bg: "bg-green-500/7",
                      },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className={`${s.bg} rounded-xl p-2.5 border border-white/5`}
                      >
                        <p className={`text-lg font-bold ${s.c}`}>{s.n}</p>
                        <p className="text-[9px] text-zinc-500 mt-0.5">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  {/* Candidate list */}
                  <div className="flex-1 rounded-xl border border-white/5 bg-[#0a0a0f] overflow-hidden flex flex-col">
                    {/* Table header */}
                    <div className="grid grid-cols-[28px_1fr_100px_110px] items-center gap-3 px-3 py-2 border-b border-white/5 bg-white/2">
                      <div />
                      <span className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider">
                        Candidate
                      </span>
                      <span className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider text-right">
                        ATS Score
                      </span>
                      <span className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider text-center">
                        Status
                      </span>
                    </div>
                    {[
                      {
                        name: "Ankit Maharjan",
                        score: 94,
                        status: "Interview scheduled",
                        dot: "bg-violet-400",
                        sc: "text-violet-300 bg-violet-500/15 border border-violet-500/25",
                      },
                      {
                        name: "Sanit Pun Magar",
                        score: 89,
                        status: "Shortlisted",
                        dot: "bg-indigo-400",
                        sc: "text-indigo-300 bg-indigo-500/15 border border-indigo-500/25",
                      },
                      {
                        name: "Ritisha Thapa",
                        score: 82,
                        status: "Shortlisted",
                        dot: "bg-indigo-400",
                        sc: "text-indigo-300 bg-indigo-500/15 border border-indigo-500/25",
                      },
                      {
                        name: "Anjali Bista",
                        score: 75,
                        status: "Under review",
                        dot: "bg-zinc-500",
                        sc: "text-zinc-400 bg-zinc-500/10 border border-zinc-500/20",
                      },
                    ].map((c, i) => (
                      <div
                        key={c.name}
                        className={`grid grid-cols-[28px_1fr_100px_110px] items-center gap-3 px-3 py-2.5 border-b border-white/3 last:border-0 ${
                          i === 0 ? "bg-violet-500/3" : ""
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/8 flex items-center justify-center text-[8px] font-bold text-zinc-300 shrink-0">
                          {c.name[0]}
                        </div>
                        {/* Name */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className={`w-1 h-1 rounded-full shrink-0 ${c.dot}`}
                          />
                          <p className="text-[10px] font-semibold text-white truncate">
                            {c.name}
                          </p>
                        </div>
                        {/* Score + bar */}
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 h-0.75 rounded-full bg-white/6 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-violet-500 to-indigo-400"
                              style={{ width: `${c.score}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold tabular-nums text-zinc-200 w-5 text-right">
                            {c.score}
                          </span>
                        </div>
                        {/* Status */}
                        <div className="flex justify-center">
                          <span
                            className={`text-[9px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${c.sc}`}
                          >
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS STRIP */}
      <section className="border-y border-white/5 bg-white/1 px-6 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10×", label: "faster candidate screening vs. manual" },
            {
              value: "360°",
              label: "ATS scoring covering skills, experience & education",
            },
            { value: "24/7", label: "AI interviews run without HR present" },
            {
              value: "0 min",
              label: "scheduling needed candidates self-serve interviews",
            },
          ].map((s) => (
            <div
              key={s.value}
              className="flex flex-col items-center justify-center gap-1.5"
            >
              <span className="text-4xl font-extrabold bg-linear-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                {s.value}
              </span>
              <span className="text-xs text-zinc-500 max-w-[14ch] leading-relaxed">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything your hiring team needs
            </h2>
            <p className="text-zinc-400 mt-4 max-w-md mx-auto text-sm leading-relaxed">
              One platform covering the full recruitment lifecycle from job
              creation to final offer decision.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg
                    className="w-5 h-5 text-violet-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                ),
                hoverGrad: "from-violet-500/15 to-transparent",
                hoverBorder: "group-hover:border-violet-500/30",
                title: "Smart CV Parsing",
                desc: "Automatically extract skills, experience, and education from any PDF or DOCX. Zero manual data entry.",
              },
              {
                icon: (
                  <svg
                    className="w-5 h-5 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                ),
                hoverGrad: "from-indigo-500/15 to-transparent",
                hoverBorder: "group-hover:border-indigo-500/30",
                title: "ATS Scoring Engine",
                desc: "Every applicant is scored against job requirements using AI. Rank 500 candidates in seconds.",
              },
              {
                icon: (
                  <svg
                    className="w-5 h-5 text-fuchsia-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                    />
                  </svg>
                ),
                hoverGrad: "from-fuchsia-500/15 to-transparent",
                hoverBorder: "group-hover:border-fuchsia-500/30",
                title: "AI Voice Interviews",
                desc: "Shortlisted candidates interview via browser. Vapi.ai conducts structured conversations and scores responses.",
              },
              {
                icon: (
                  <svg
                    className="w-5 h-5 text-sky-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>
                ),
                hoverGrad: "from-sky-500/15 to-transparent",
                hoverBorder: "group-hover:border-sky-500/30",
                title: "Interview Summary",
                desc: "After every AI interview, get a concise AI-generated summary highlighting key insights, strengths, and red flags so you decide faster.",
              },
              {
                icon: (
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"
                    />
                  </svg>
                ),
                hoverGrad: "from-emerald-500/15 to-transparent",
                hoverBorder: "group-hover:border-emerald-500/30",
                title: "HR Command Center",
                desc: "One dashboard for all active roles, pipelines, and decisions. Advance, hold, or reject candidates in one click.",
              },
              {
                icon: (
                  <svg
                    className="w-5 h-5 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                  </svg>
                ),
                hoverGrad: "from-amber-500/15 to-transparent",
                hoverBorder: "group-hover:border-amber-500/30",
                title: "Real-Time Updates",
                desc: "Candidates receive live status updates at every stage: shortlist alerts, interview invites, and final decisions delivered instantly.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`group relative rounded-2xl border border-white/6 ${f.hoverBorder} transition-all duration-300 p-6 overflow-hidden cursor-default hover:-translate-y-0.5`}
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${f.hoverGrad} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="px-6 py-24 bg-white/1 border-y border-white/4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
              Process
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              From job post to hire in 6 steps
            </h2>
            <p className="text-zinc-400 mt-4 max-w-md mx-auto text-sm leading-relaxed">
              A fully automated pipeline that runs while your team focuses on
              strategy.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                n: "01",
                col: "text-violet-400",
                bg: "bg-violet-500/10 border-violet-500/30",
                title: "HR Creates a Job",
                desc: "Define the role, skills, experience level, shortlist quota, and interview questions. Publish in under 5 minutes.",
              },
              {
                n: "02",
                col: "text-indigo-400",
                bg: "bg-indigo-500/10 border-indigo-500/30",
                title: "Candidates Apply",
                desc: "Candidates upload their CV (PDF or DOCX). Our parser extracts structured data from every resume automatically.",
              },
              {
                n: "03",
                col: "text-fuchsia-400",
                bg: "bg-fuchsia-500/10 border-fuchsia-500/30",
                title: "ATS Scoring Runs",
                desc: "Every applicant is scored against your requirements. Rankings update live as new applications arrive.",
              },
              {
                n: "04",
                col: "text-sky-400",
                bg: "bg-sky-500/10 border-sky-500/30",
                title: "Top Candidates Shortlisted",
                desc: "When the quota fills, the system auto-selects the highest-scoring candidates and notifies them by email.",
              },
              {
                n: "05",
                col: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/30",
                title: "AI Voice Interview",
                desc: "Shortlisted candidates complete a structured Vapi.ai interview in their browser. No scheduling required.",
              },
              {
                n: "06",
                col: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/30",
                title: "HR Reviews & Decides",
                desc: "See ranked candidates with interview scores and AI-generated summaries. Advance, hold, or reject with one click.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="relative rounded-2xl border border-white/6 bg-[#0d0d15] p-6 hover:-translate-y-0.5 transition-transform duration-200"
              >
                <div
                  className={`inline-flex w-10 h-10 rounded-xl border items-center justify-center text-sm font-bold mb-4 ${step.bg} ${step.col}`}
                >
                  {step.n}
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
              Built for everyone
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Two roles, one platform
            </h2>
            <p className="text-zinc-400 mt-4 max-w-md mx-auto text-sm leading-relaxed">
              Whether you&apos;re hiring talent or looking for your next role,
              ROJ.AI is built for you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* HR Card */}
            <div className="relative rounded-2xl border border-violet-500/20 bg-linear-to-br from-violet-500/[0.07] to-transparent p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-5">
                  <svg
                    className="w-6 h-6 text-violet-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2">
                  For HR Professionals
                </p>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Run your full pipeline
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Post jobs, set requirements, and let the system handle
                  everything from CV screening to AI interviews. You only step
                  in for the final decision.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    "Create and publish job listings",
                    "Set shortlist quotas & criteria",
                    "ATS-scored candidate rankings",
                    "Review interview recordings & AI summaries",
                    "One-click advance, hold, or reject",
                    "Export full pipeline reports",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-zinc-300"
                    >
                      <svg
                        className="w-4 h-4 text-violet-400 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/signup?role=hr"
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-all text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-lg shadow-violet-900/30"
                >
                  Join as HR
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Candidate Card */}
            <div className="relative rounded-2xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/[0.07] to-transparent p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-5">
                  <svg
                    className="w-6 h-6 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
                  For Candidates
                </p>
                <h3 className="text-2xl font-bold text-white mb-3">
                  A fair, transparent process
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Upload your CV once, apply to roles that match your profile.
                  If shortlisted, your AI interview runs on your schedule: no
                  bias, no ghosting.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    "Upload CV in PDF or DOCX format",
                    "Browse and apply to open roles",
                    "Real-time ATS score feedback",
                    "Automated shortlist notification",
                    "Browser-based AI voice interview",
                    "Status updates at every stage",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-zinc-300"
                    >
                      <svg
                        className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/signup?role=candidate"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-all text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-lg shadow-indigo-900/30"
                >
                  Apply for a role
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-175 h-100 bg-violet-600/10 rounded-full blur-[100px]" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-violet-500/20 to-transparent" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4">
            Get started today
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Transform your hiring,
            <br />
            <span className="bg-linear-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              starting now.
            </span>
          </h2>
          <p className="text-zinc-400 text-base mb-10 leading-relaxed">
            Join HR teams automating their recruitment pipeline. Less admin.
            Better hires. Faster decisions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/signup?role=hr"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 transition-all text-white font-semibold px-10 py-4 rounded-xl shadow-xl shadow-violet-900/40 text-base"
            >
              Start hiring for free
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </a>
            <a
              href="/signup?role=candidate"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 transition-all text-white font-semibold px-10 py-4 rounded-xl text-base"
            >
              I&apos;m a candidate
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#07070d]">
        {/* Main grid */}
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/roj-ai-logo.png" alt="ROJ.AI" width={32} height={32} className="rounded-xl" />
              <span className="font-bold text-white tracking-tight">
                ROJ<span className="text-violet-400">.AI</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed text-left">
              AI-powered recruitment that automates your entire hiring pipeline
              from CV screening to voice interviews.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/8 text-violet-400 text-xs font-medium w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Built for AI Hackathon 2026
            </div>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Product
            </h4>
            <ul className="flex flex-col gap-3">
              {(
                [
                  ["Features", "#features"],
                  ["How it works", "#how-it-works"],
                  ["ATS Scoring", "#features"],
                  ["AI Voice Interviews", "#features"],
                ] as [string, string][]
              ).map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Roles */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Platform
            </h4>
            <ul className="flex flex-col gap-3">
              {(
                [
                  ["For HR Teams", "/signup?role=hr"],
                  ["For Candidates", "/signup?role=candidate"],
                  ["Sign in", "/login"],
                  ["Create account", "/signup"],
                ] as [string, string][]
              ).map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Stack */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Powered by
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                ["Vapi.ai", "AI Voice Engine"],
                ["Cloudinary", "CV Storage"],
                ["MongoDB", "Database"],
                ["Brevo", "Email Delivery"],
                ["Upstash Redis", "OTP Cache"],
              ].map(([name, role]) => (
                <li key={name} className="flex items-baseline gap-1.5">
                  <span className="text-sm text-zinc-400 font-medium">
                    {name}
                  </span>
                  <span className="text-xs text-zinc-600">{role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} ROJ.AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-zinc-600">
              <a href="#" className="hover:text-zinc-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-zinc-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-zinc-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Briefcase,
  Bell,
  LogOut,
  Search,
  X,
  ChevronDown,
} from "lucide-react";

const navLinks = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/jobs", label: "Browse Jobs", icon: Briefcase },
];

export default function CandidateNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [, startTransition] = useTransition();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const candidateName = user?.candidateId?.fullName || "Candidate";
  const firstName = candidateName.split(" ")[0];
  const initials = candidateName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/login");
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/candidate/jobs?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Main bar */}
      <div className="bg-[#080b1a]/90 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-[58px] gap-8">

            {/* Logo */}
            <Link href="/candidate/dashboard" className="flex items-center gap-2.5 shrink-0 group">
              <Image src="/roj-ai-logo.png" alt="ROJ.AI" width={32} height={32} className="rounded-lg" />
              <span className="text-[15px] font-bold text-white tracking-tight">ROJ<span className="text-violet-400">.AI</span></span>
            </Link>

            {/* Divider */}
            <div className="hidden md:block w-px h-5 bg-white/10" />

            {/* Nav links — center */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href ||
                  (href !== "/candidate/dashboard" && pathname?.startsWith(href + "/"));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? "text-white"
                        : "text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 rounded-md bg-white/[0.07]" />
                    )}
                    <Icon size={14} className={isActive ? "text-violet-400" : ""} />
                    <span className="relative">{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Search */}
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="flex items-center bg-white/[0.06] border border-white/10 rounded-lg overflow-hidden h-8">
                    <Search size={14} className="ml-3 text-slate-500 shrink-0" />
                    <input
                      autoFocus
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search jobs..."
                      className="bg-transparent text-[13px] text-white placeholder:text-slate-600 px-2.5 py-1.5 outline-none w-44"
                    />
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="px-2.5 text-slate-500 hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
                  aria-label="Search jobs"
                >
                  <Search size={16} />
                </button>
              )}

              {/* Bell */}
              <button className="relative p-2 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-[5px] h-[5px] bg-violet-500 rounded-full ring-1 ring-[#080b1a]" />
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-white/10 mx-1" />

              {/* Profile button */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 h-8 pl-1 pr-2.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-[13px] font-medium text-slate-300 max-w-20 truncate">
                    {firstName}
                  </span>
                  <ChevronDown size={13} className={`text-slate-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 z-20 rounded-xl border border-white/10 bg-[#0f1225]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-white truncate">{candidateName}</p>
                            <p className="text-[11px] text-slate-500">Candidate</p>
                          </div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="p-1.5">
                        <button
                          onClick={() => { setProfileOpen(false); handleLogout(); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom nav strip */}
        <div className="md:hidden flex items-center border-t border-white/[0.05] px-4 overflow-x-auto">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/candidate/dashboard" && pathname?.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? "text-white border-violet-500"
                    : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                <Icon size={13} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button, InlineAlert } from "@/components/ui";

type CurrentUserResponse = {
  success: boolean;
  message?: string;
  currentUser?: {
    email?: string;
    role?: string;
    candidateId?: unknown;
    hrProfessionalId?: unknown;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUserResponse["currentUser"] | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get<CurrentUserResponse>("/api/v1/users");
        if (cancelled) return;
        const currentUser = res.data.currentUser ?? null;
        if (!currentUser) {
          router.replace("/login");
          return;
        }
        setUser(currentUser);
      } catch (err) {
        if (cancelled) return;
        const error = err as {
          response?: { status?: number; data?: { message?: unknown } };
          message?: string;
        };
        if (error.response?.status === 401) {
          router.replace("/login");
          return;
        }
        const message =
          error.response?.data?.message ??
          error.message ??
          "Unable to load your session.";
        setError(Array.isArray(message) ? message.join(", ") : String(message));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    setError(null);
    try {
      await api.post("/api/v1/users/logout");
      router.push("/login");
    } catch (err) {
      const error = err as { response?: { data?: { message?: unknown } }; message?: string };
      const message =
        error.response?.data?.message ??
        error.message ??
        "Logout failed.";
      setError(Array.isArray(message) ? message.join(", ") : String(message));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-400">
              Session smoke test page (temporary)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Button variant="secondary" onClick={handleLogout} disabled={loading}>
              Logout
            </Button>
          </div>
        </div>

        {error ? (
          <InlineAlert variant="error">
            <span>{error}</span>
          </InlineAlert>
        ) : null}

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5/80 backdrop-blur-xl p-6">
          {loading ? (
            <p className="text-sm text-zinc-400">Checking session…</p>
          ) : user ? (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-zinc-400">Email:</span>{" "}
                <span className="text-white">{user.email ?? "—"}</span>
              </div>
              <div className="text-sm">
                <span className="text-zinc-400">Role:</span>{" "}
                <span className="text-white">{user.role ?? "—"}</span>
              </div>
              <div className="text-xs text-zinc-500 pt-2">
                This page exists to verify that login cookies are working and
                `GET /api/v1/users` returns the current user.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


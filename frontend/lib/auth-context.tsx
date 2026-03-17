"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

// ── Profile sub-types (populated refs from backend) ───────────────────────────

export type CandidateProfile = {
  _id: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  preferredPosition?: string[];
  experienceLevel?: string;
  linkedInUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type HrProfile = {
  _id: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  company: string;
  designation?: string;
  linkedInUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Mirrors the backend `currentUser` shape from GET /api/v1/users.
 *
 * The backend returns the login_cred document (.select('-password')) with
 * the profile reference populated, then injects `role`:
 *
 *   {
 *     _id:                login_cred ObjectId
 *     email:              string
 *     candidateId:        CandidateProfile | null
 *     hrProfessionalId:   HrProfile | null
 *     role:               "candidate" | "hr_professional"
 *     createdAt:          string
 *     updatedAt:          string
 *   }
 *
 * To get the profile: user.candidateId  (candidate) or user.hrProfessionalId (HR)
 */
export type AuthUser = {
  _id: string;
  email: string;
  role: "candidate" | "hr_professional";
  candidateId?: CandidateProfile | null;
  hrProfessionalId?: HrProfile | null;
  createdAt?: string;
  updatedAt?: string;
};

/** Convenience helper — returns the populated profile regardless of role. */
export function getProfile(
  user: AuthUser,
): CandidateProfile | HrProfile | null {
  return (
    (user.role === "candidate" ? user.candidateId : user.hrProfessionalId) ??
    null
  );
}

// ── Context shape ─────────────────────────────────────────────────────────────

type AuthContextValue = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
});

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}

// ── Auth pages that logged-in users should be bounced away from ───────────────

const AUTH_PAGES = ["/login", "/signup", "/verify-otp", "/verify"];

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * Wrap the app with this provider.
 * Pass `initialUser` from a server component (layout) so the client never
 * starts with a flash of "unauthenticated" state.
 */
export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If the user is already logged in but landed on an auth page
    // (e.g. navigated to /login manually), bounce them to their dashboard.
    if (user && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
      toast.info("You're already logged in!");
      router.replace(
        user.role === "hr_professional"
          ? "/hr/dashboard"
          : "/candidate/dashboard",
      );
    }
  }, [user, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

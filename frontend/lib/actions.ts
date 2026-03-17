"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";

const API =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

// ── Cookie helpers ────────────────────────────────────────────────────────────

/** Parse Set-Cookie headers and write them into the Next.js response cookies. */
async function forwardCookies(header: string | string[] | undefined) {
  if (!header) return;
  const cookieStore = await cookies();
  const arr = Array.isArray(header) ? header : [header];

  for (const raw of arr) {
    const parts = raw.split(";").map((p) => p.trim());
    const eqIdx = parts[0].indexOf("=");
    if (eqIdx < 0) continue;

    const name = parts[0].slice(0, eqIdx).trim();
    let value = parts[0].slice(eqIdx + 1).trim();
    // Strip surrounding quotes that some servers add
    if (value.startsWith('"') && value.endsWith('"'))
      value = value.slice(1, -1);

    const opts: {
      httpOnly?: boolean;
      secure?: boolean;
      path?: string;
      sameSite?: "strict" | "lax" | "none";
      maxAge?: number;
    } = {};

    for (const part of parts.slice(1)) {
      const eqI = part.indexOf("=");
      const key = (eqI > -1 ? part.slice(0, eqI) : part).toLowerCase().trim();
      const val = eqI > -1 ? part.slice(eqI + 1).trim() : "";
      if (key === "httponly") opts.httpOnly = true;
      else if (key === "secure") opts.secure = true;
      else if (key === "path") opts.path = val;
      else if (key === "samesite")
        opts.sameSite = val.toLowerCase() as "strict" | "lax" | "none";
      else if (key === "max-age") opts.maxAge = parseInt(val, 10);
    }

    cookieStore.set(name, value, opts);
  }
}

/**
 * Extract raw "name=value" pairs from Set-Cookie headers so we can forward
 * them as a Cookie header in a follow-up server-side request within the
 * same action (before the browser has received them).
 */
function cookieHeaderFromSetCookie(
  header: string | string[] | undefined,
): string {
  if (!header) return "";
  const arr = Array.isArray(header) ? header : [header];
  return arr.map((raw) => raw.split(";")[0].trim()).join("; ");
}

// ── Result types ──────────────────────────────────────────────────────────────

type Ok<T> = { success: true; message: string; data: T };
type Err = { success: false; message: string };

function makeErr(e: unknown, fallback: string): Err {
  const ae = e as AxiosError<{ message?: string }>;
  const raw = ae.response?.data?.message ?? ae.message ?? fallback;
  const msg = typeof raw === "string" ? raw : fallback;
  return { success: false, message: msg };
}

// ── Auth actions ──────────────────────────────────────────────────────────────

/**
 * Register a new Candidate.
 * Backend: POST /api/v1/candidates
 * Returns a short-lived JWT signup token used to verify the OTP.
 */
export async function registerCandidateAction(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<Ok<{ token: string }> | Err> {
  try {
    const res = await axios.post(`${API}/api/v1/candidates`, data);
    return {
      success: true,
      message:
        res.data.message ??
        "Account created. Please verify your email to continue.",
      data: { token: res.data.token },
    };
  } catch (e) {
    return makeErr(e, "Registration failed. Please try again.");
  }
}

/**
 * Register a new HR Professional.
 * Backend: POST /api/v1/hrProfessionals
 * Returns a short-lived JWT signup token used to verify the OTP.
 */
export async function registerHrAction(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  company: string;
  designation?: string;
}): Promise<Ok<{ token: string }> | Err> {
  try {
    const res = await axios.post(`${API}/api/v1/hrProfessionals`, data);
    return {
      success: true,
      message:
        res.data.message ??
        "Account created. Please verify your email to continue.",
      data: { token: res.data.token },
    };
  } catch (e) {
    return makeErr(e, "Registration failed. Please try again.");
  }
}

/**
 * Login with email + password.
 * Backend: POST /api/v1/users  →  sets httpOnly accessToken + refreshToken cookies.
 * After setting cookies the action fetches GET /api/v1/users to resolve the role
 * and return the full user profile.
 */
export async function loginAction(
  email: string,
  password: string,
): Promise<Ok<{ role: string; user: Record<string, unknown> }> | Err> {
  try {
    const res = await axios.post(`${API}/api/v1/users`, { email, password });
    const setCookieHeader = res.headers["set-cookie"];

    // 1. Forward cookies to the browser
    await forwardCookies(setCookieHeader);

    // 2. Use the just-issued cookies within this request to fetch the full user
    const cookieHeader = cookieHeaderFromSetCookie(setCookieHeader);
    const userRes = await axios.get(`${API}/api/v1/users`, {
      headers: { Cookie: cookieHeader },
    });

    const currentUser = userRes.data.currentUser ?? {};
    const role: string = currentUser.role ?? "candidate";
    return {
      success: true,
      message: res.data.message ?? "Logged in successfully!",
      data: { role, user: currentUser },
    };
  } catch (e) {
    return makeErr(e, "Login failed. Please check your credentials.");
  }
}

/**
 * Verify signup OTP.
 * Backend: POST /api/v1/users/verify/:token  →  sets httpOnly cookies (auto-login).
 * After setting cookies the action fetches GET /api/v1/users to resolve the role
 * and return the full user profile.
 */
export async function verifyOtpAction(
  token: string,
  otp: string,
): Promise<Ok<{ role: string; user: Record<string, unknown> }> | Err> {
  try {
    const res = await axios.post(
      `${API}/api/v1/users/verify/${encodeURIComponent(token)}`,
      { otp },
    );
    const setCookieHeader = res.headers["set-cookie"];

    // 1. Forward auto-login cookies to the browser
    await forwardCookies(setCookieHeader);

    // 2. Resolve full user profile
    const cookieHeader = cookieHeaderFromSetCookie(setCookieHeader);
    const userRes = await axios.get(`${API}/api/v1/users`, {
      headers: { Cookie: cookieHeader },
    });

    const currentUser = userRes.data.currentUser ?? {};
    const role: string = currentUser.role ?? "candidate";
    return {
      success: true,
      message: res.data.message ?? "Account verified!",
      data: { role, user: currentUser },
    };
  } catch (e) {
    return makeErr(e, "Verification failed. Please try again.");
  }
}

/**
 * Logout the current user.
 * Backend: POST /api/v1/users/logout  →  clears cookies.
 */
export async function logoutAction(): Promise<Ok<undefined> | Err> {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("accessToken")?.value ?? "";
    const refresh = cookieStore.get("refreshToken")?.value ?? "";

    await axios.post(
      `${API}/api/v1/users/logout`,
      {},
      {
        headers: { Cookie: `accessToken=${access}; refreshToken=${refresh}` },
      },
    );

    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    return {
      success: true,
      message: "Logged out successfully.",
      data: undefined,
    };
  } catch (e) {
    // Best-effort: clear cookies even on network error
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    return makeErr(e, "Logout failed.");
  }
}

/**
 * Get the currently authenticated user's full profile.
 * Backend: GET /api/v1/users  (protected)
 */
export async function getCurrentUserAction() {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("accessToken")?.value ?? "";
    const refresh = cookieStore.get("refreshToken")?.value ?? "";

    const res = await axios.get(`${API}/api/v1/users`, {
      headers: { Cookie: `accessToken=${access}; refreshToken=${refresh}` },
    });
    await forwardCookies(res.headers["set-cookie"]);
    return { success: true as const, currentUser: res.data.currentUser };
  } catch (e) {
    return makeErr(e, "Failed to fetch current user.");
  }
}

// ── Password Reset actions ────────────────────────────────────────────────────

/**
 * Request a password reset OTP.
 * Backend: POST /api/v1/users/reset  →  { token, message, success }
 */
export async function resetRequestAction(
  email: string,
  role: string,
): Promise<Ok<{ token: string }> | Err> {
  try {
    const res = await axios.post(`${API}/api/v1/users/reset`, { email, role });
    return {
      success: true,
      message: res.data.message ?? "OTP sent. Check your email.",
      data: { token: res.data.token },
    };
  } catch (e) {
    return makeErr(e, "Failed to send reset OTP. Please try again.");
  }
}

/**
 * Verify the password reset OTP.
 * Backend: POST /api/v1/users/reset-verify/:token  →  { token: final_reset_token, message, success }
 */
export async function verifyResetOtpAction(
  token: string,
  otp: string,
): Promise<Ok<{ token: string }> | Err> {
  try {
    const res = await axios.post(
      `${API}/api/v1/users/reset-verify/${encodeURIComponent(token)}`,
      { otp },
    );
    return {
      success: true,
      message: res.data.message ?? "Identity verified.",
      data: { token: res.data.token },
    };
  } catch (e) {
    return makeErr(e, "Verification failed. Please try again.");
  }
}

/**
 * Set a new password after verifying reset OTP.
 * Backend: PATCH /api/v1/users/password/:token
 */
export async function resetPasswordAction(
  token: string,
  password: string,
): Promise<Ok<undefined> | Err> {
  try {
    const res = await axios.patch(
      `${API}/api/v1/users/password/${encodeURIComponent(token)}`,
      { password },
    );
    return {
      success: true,
      message: res.data.message ?? "Password updated successfully.",
      data: undefined,
    };
  } catch (e) {
    return makeErr(e, "Password reset failed. Please try again.");
  }
}

// ── Job types ─────────────────────────────────────────────────────────────────

export type JobSalary = {
  type: "negotiable" | "fixed" | "range";
  min?: number;
  max?: number;
  period?: "monthly" | "yearly";
};

export type JobInterview = {
  num_questions: number;
  questions: string[];
  interviewTone: string;
};

export type Job = {
  _id: string;
  position: string;
  department?: string;
  experienceLevel: string;
  remote: boolean;
  location?: string;
  description: string;
  deadline: string;
  shortlistCount: number;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  salary?: JobSalary;
  interview: JobInterview;
  status: "Draft" | "Published" | "Closed";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

// ── Job actions ────────────────────────────────────────────────────────────────

/** Get all jobs created by the currently logged-in HR professional. */
export async function getPersonalJobsAction(): Promise<
  Ok<{ jobsInfo: Job[] }> | Err
> {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("accessToken")?.value ?? "";
    const refresh = cookieStore.get("refreshToken")?.value ?? "";

    const res = await axios.get(`${API}/api/v1/jobs/personal`, {
      headers: { Cookie: `accessToken=${access}; refreshToken=${refresh}` },
    });
    await forwardCookies(res.headers["set-cookie"]);
    return {
      success: true,
      message: "Jobs fetched.",
      data: { jobsInfo: res.data.jobsInfo ?? [] },
    };
  } catch (e) {
    return makeErr(e, "Failed to fetch jobs.");
  }
}

/** Get a single job by ID (role-aware: HR sees full detail, candidate sees public listing). */
export async function getJobByIdAction(
  id: string,
): Promise<Ok<{ jobsInfo: Job }> | Err> {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("accessToken")?.value ?? "";
    const refresh = cookieStore.get("refreshToken")?.value ?? "";

    const res = await axios.get(
      `${API}/api/v1/jobs/${encodeURIComponent(id)}`,
      {
        headers: { Cookie: `accessToken=${access}; refreshToken=${refresh}` },
      },
    );
    await forwardCookies(res.headers["set-cookie"]);
    return {
      success: true,
      message: "Job fetched.",
      data: { jobsInfo: res.data.jobsInfo },
    };
  } catch (e) {
    return makeErr(e, "Failed to fetch job.");
  }
}

/** Create a new job listing (HR only). */
export async function createJobAction(data: {
  position: string;
  experienceLevel: string;
  remote: boolean;
  location?: string;
  description: string;
  deadline: string;
  shortlistCount: number;
  mustHaveSkills?: string[];
  niceToHaveSkills?: string[];
  salary?: JobSalary;
  interview: JobInterview;
}): Promise<Ok<undefined> | Err> {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("accessToken")?.value ?? "";
    const refresh = cookieStore.get("refreshToken")?.value ?? "";

    const res = await axios.post(`${API}/api/v1/jobs`, data, {
      headers: { Cookie: `accessToken=${access}; refreshToken=${refresh}` },
    });
    await forwardCookies(res.headers["set-cookie"]);
    return {
      success: true,
      message: res.data.message ?? "Job created successfully.",
      data: undefined,
    };
  } catch (e) {
    return makeErr(e, "Failed to create job. Please try again.");
  }
}

/** Update an existing job (HR only — must own the job). */
export async function updateJobAction(
  id: string,
  data: Partial<{
    experienceLevel: string;
    remote: boolean;
    location: string;
    description: string;
    deadline: string;
    shortlistCount: number;
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
    salary: JobSalary;
    status: string;
    interview: JobInterview;
  }>,
): Promise<Ok<{ jobInfo: Job }> | Err> {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("accessToken")?.value ?? "";
    const refresh = cookieStore.get("refreshToken")?.value ?? "";

    const res = await axios.patch(
      `${API}/api/v1/jobs/${encodeURIComponent(id)}`,
      data,
      {
        headers: { Cookie: `accessToken=${access}; refreshToken=${refresh}` },
      },
    );
    await forwardCookies(res.headers["set-cookie"]);
    return {
      success: true,
      message: res.data.message ?? "Job updated successfully.",
      data: { jobInfo: res.data.jobInfo },
    };
  } catch (e) {
    return makeErr(e, "Failed to update job. Please try again.");
  }
}

/** Delete a job (HR only — must own the job, must be Draft or Closed). */
export async function deleteJobAction(
  id: string,
): Promise<Ok<undefined> | Err> {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("accessToken")?.value ?? "";
    const refresh = cookieStore.get("refreshToken")?.value ?? "";

    const res = await axios.delete(
      `${API}/api/v1/jobs/${encodeURIComponent(id)}`,
      {
        headers: { Cookie: `accessToken=${access}; refreshToken=${refresh}` },
      },
    );
    await forwardCookies(res.headers["set-cookie"]);
    return {
      success: true,
      message: res.data.message ?? "Job deleted successfully.",
      data: undefined,
    };
  } catch (e) {
    return makeErr(e, "Failed to delete job. Please try again.");
  }
}

// ── Application types ────────────────────────────────────────────────────────
export type ApplicationStatus =
  | "Applied"
  | "Shortlisted"
  | "Not Selected"
  | "Under-Review"
  | "Interview Scheduled"
  | "Interview Completed";

export type ApplicationSummary = {
  _id: string;
  jobId: {
    _id: string;
    position: string;
    department?: string;
    status: string;
    deadline: string;
  } | null;
  status: ApplicationStatus;
  appliedAt: string;
  atsScore?: number | null;
};

export type ApplicationDetail = {
  job: {
    _id: string;
    position: string;
    department?: string;
    status: string;
    deadline: string;
    experienceLevel?: string;
  };
  candidate?: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  status: ApplicationStatus;
  appliedAt: string;
  atsScore?: number | null;
  cvSummary?: string | null;
  interviewSessionId?: string | null;
  interviewStatus?:
    | "Pending"
    | "In-Progress"
    | "Completed"
    | "Abandoned"
    | null;
  interviewScore?: number | null;
  interviewSummary?: string | null;
  interviewRecommendation?: string | null;
  cv: {
    originalName: string;
    file: string; // base64 data URI
  };
};

// ── Application actions ──────────────────────────────────────────────────────
/** Get all currently published/open job listings (candidate only). */
export async function getListedJobsAction(): Promise<
  Ok<{ jobsInfo: Job[] }> | Err
> {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("accessToken")?.value ?? "";
    const refresh = cookieStore.get("refreshToken")?.value ?? "";

    const res = await axios.get(`${API}/api/v1/jobs/listings`, {
      headers: { Cookie: `accessToken=${access}; refreshToken=${refresh}` },
    });
    await forwardCookies(res.headers["set-cookie"]);
    return {
      success: true,
      message: "Jobs fetched.",
      data: { jobsInfo: res.data.jobsInfo ?? [] },
    };
  } catch (e) {
    return makeErr(e, "Failed to fetch job listings.");
  }
}

/** Submit a new application with a CV PDF file (candidate only). */
export async function submitApplicationAction(
  formData: FormData,
): Promise<Ok<undefined> | Err> {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("accessToken")?.value ?? "";
    const refresh = cookieStore.get("refreshToken")?.value ?? "";

    const jobId = formData.get("jobId") as string;
    const cv = formData.get("cv") as File;

    const backendForm = new FormData();
    backendForm.append("jobId", jobId);
    const bytes = await cv.arrayBuffer();
    backendForm.append(
      "cv",
      new Blob([bytes], { type: "application/pdf" }),
      cv.name,
    );

    const res = await axios.post(`${API}/api/v1/applications`, backendForm, {
      headers: { Cookie: `accessToken=${access}; refreshToken=${refresh}` },
    });
    await forwardCookies(res.headers["set-cookie"]);
    return {
      success: true,
      message: res.data.message ?? "Application submitted!",
      data: undefined,
    };
  } catch (e) {
    return makeErr(e, "Failed to submit application.");
  }
}

/** Get all applications submitted by the currently logged-in candidate. */
export async function getMyApplicationsAction(): Promise<
  Ok<{ applications: ApplicationSummary[] }> | Err
> {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("accessToken")?.value ?? "";
    const refresh = cookieStore.get("refreshToken")?.value ?? "";

    const res = await axios.get(`${API}/api/v1/applications/my`, {
      headers: { Cookie: `accessToken=${access}; refreshToken=${refresh}` },
    });
    await forwardCookies(res.headers["set-cookie"]);
    return {
      success: true,
      message: "Applications fetched.",
      data: { applications: res.data.data ?? [] },
    };
  } catch (e) {
    return makeErr(e, "Failed to fetch applications.");
  }
}

/** Get full detail of one application (candidate sees own CV + status). */
export async function getApplicationByIdAction(
  id: string,
): Promise<Ok<ApplicationDetail> | Err> {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("accessToken")?.value ?? "";
    const refresh = cookieStore.get("refreshToken")?.value ?? "";

    const res = await axios.get(
      `${API}/api/v1/applications/${encodeURIComponent(id)}`,
      {
        headers: { Cookie: `accessToken=${access}; refreshToken=${refresh}` },
      },
    );
    await forwardCookies(res.headers["set-cookie"]);
    return {
      success: true,
      message: "Application fetched.",
      data: res.data.data,
    };
  } catch (e) {
    return makeErr(e, "Failed to fetch application.");
  }
}

// ── Ranking & Shortlisting ──────────────────────────────────────────────────

export type RankingItem = {
  _id: string;
  applicationId: string;
  jobId: string;
  candidateId: {
    _id: string;
    fullName: string;
    phone: string;
  };
  atsScore: number;
  cvSummary: string;
};

/** Get ranked candidates for a job (HR only) */
export async function getJobRankingsAction(
  jobId: string,
): Promise<Ok<{ rankings: RankingItem[] }> | Err> {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("accessToken")?.value ?? "";
    const refresh = cookieStore.get("refreshToken")?.value ?? "";

    const res = await axios.get(
      `${API}/api/v1/jobs/${encodeURIComponent(jobId)}/rankings`,
      {
        headers: { Cookie: `accessToken=${access}; refreshToken=${refresh}` },
      },
    );
    await forwardCookies(res.headers["set-cookie"]);
    return {
      success: true,
      message: "Rankings fetched.",
      data: { rankings: res.data.data },
    };
  } catch (e) {
    return makeErr(e, "Failed to fetch rankings.");
  }
}

/** Trigger shortlisting for a job (HR only) */
export async function triggerShortlistAction(
  jobId: string,
): Promise<
  Ok<{ totalApplications: number; shortlisted: number; rejected: number }> | Err
> {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("accessToken")?.value ?? "";
    const refresh = cookieStore.get("refreshToken")?.value ?? "";

    const res = await axios.post(
      `${API}/api/v1/jobs/${encodeURIComponent(jobId)}/shortlist`,
      {},
      {
        headers: { Cookie: `accessToken=${access}; refreshToken=${refresh}` },
      },
    );
    await forwardCookies(res.headers["set-cookie"]);
    return {
      success: true,
      message: res.data.message ?? "Shortlisting complete.",
      data: res.data.data,
    };
  } catch (e) {
    return makeErr(e, "Failed to trigger shortlisting.");
  }
}

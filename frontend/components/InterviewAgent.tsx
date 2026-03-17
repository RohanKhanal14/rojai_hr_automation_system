"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { toast } from "sonner";
import { Loader2, MessageCircle, Phone, PhoneOff, Volume2 } from "lucide-react";

const CallStatus = {
  INACTIVE: "INACTIVE",
  CONNECTING: "CONNECTING",
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
} as const;

type CallStatusType = (typeof CallStatus)[keyof typeof CallStatus];
type SpeakerRole = "assistant" | "user" | null;

type TranscriptMessage = {
  role: "assistant" | "user" | "system";
  content: string;
};

type InterviewData = {
  assistantConfig: Record<string, unknown>;
  sessionId: string;
  numQuestions: number;
  position: string;
  candidateName: string;
};

type StartInterviewResponse = {
  success: boolean;
  message?: string;
  data?: InterviewData;
};

type CompleteInterviewResponse = {
  success: boolean;
  message?: string;
  data?: {
    status?: string;
  };
};

type InterviewAgentProps = {
  sessionId: string;
};

export default function InterviewAgent({ sessionId }: InterviewAgentProps) {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatusType>(
    CallStatus.INACTIVE,
  );
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [speakingRole, setSpeakingRole] = useState<SpeakerRole>(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingResults, setIsProcessingResults] = useState(false);
  const [shouldRedirectAfterFinish, setShouldRedirectAfterFinish] =
    useState(false);

  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callStartedAtRef = useRef<number | null>(null);
  const callIdRef = useRef<string | null>(null);
  const hasSeenCallStartRef = useRef(false);
  const userEndedCallRef = useRef(false);
  const finalTranscriptCountRef = useRef(0);
  const finalMessagesRef = useRef<TranscriptMessage[]>([]);
  const isPersistingResultRef = useRef(false);
  const callStatusRef = useRef<CallStatusType>(CallStatus.INACTIVE);
  const SPEECH_TIMEOUT_MS = 3500;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const resetCallLifecycleRefs = () => {
    callStartedAtRef.current = null;
    callIdRef.current = null;
    hasSeenCallStartRef.current = false;
    userEndedCallRef.current = false;
    finalTranscriptCountRef.current = 0;
    finalMessagesRef.current = [];
    isPersistingResultRef.current = false;
    setIsProcessingResults(false);
  };

  const clearSpeechTimeout = () => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
  };

  const fetchInterviewData = useCallback(async () => {
    if (!API_URL) {
      toast.error("Missing NEXT_PUBLIC_API_URL in frontend env.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(
        `${API_URL}/api/v1/interviews/start/${sessionId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = (await res.json()) as StartInterviewResponse;

      if (!data.success || !data.data) {
        toast.error(data.message || "Failed to initialize interview.");
        if (res.status === 403 || res.status === 400 || res.status === 401) {
          router.push("/candidate/dashboard");
        }
        return;
      }

      setInterviewData(data.data);
    } catch {
      toast.error("Failed to fetch interview data.");
      router.push("/candidate/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, router, sessionId]);

  useEffect(() => {
    fetchInterviewData();
  }, [fetchInterviewData]);

  useEffect(() => {
    if (callStatus !== CallStatus.ACTIVE) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          vapi.stop();
          toast.error("Interview time limit reached.");
          return 0;
        }
        if (prev === 120) {
          toast.warning("2 minutes remaining.");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [callStatus]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const saveCallId = useCallback(
    async (callId: string) => {
      if (!API_URL) return;
      try {
        await fetch(`${API_URL}/api/v1/interviews/active/${sessionId}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vapiCallId: callId }),
        });
      } catch {
        // Non-blocking: webhook matching may fail without this id, but call can continue.
      }
    },
    [API_URL, sessionId],
  );

  const finalizeInterviewFromClient = useCallback(async () => {
    if (!API_URL || isPersistingResultRef.current) {
      return true;
    }

    const transcript = finalMessagesRef.current
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    if (!transcript.trim()) {
      return true;
    }

    isPersistingResultRef.current = true;

    try {
      const res = await fetch(
        `${API_URL}/api/v1/interviews/complete/${sessionId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript,
            messages: finalMessagesRef.current,
            vapiCallId: callIdRef.current,
          }),
        },
      );

      const data = (await res.json()) as CompleteInterviewResponse;
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to process interview result.");
        return false;
      }

      return true;
    } catch {
      toast.error("Failed to submit interview result.");
      return false;
    } finally {
      isPersistingResultRef.current = false;
    }
  }, [API_URL, sessionId]);

  useEffect(() => {
    const onCallStart = (call: { id?: string }) => {
      callStartedAtRef.current = Date.now();
      callIdRef.current = call?.id ?? null;
      hasSeenCallStartRef.current = true;
      userEndedCallRef.current = false;
      finalTranscriptCountRef.current = 0;
      finalMessagesRef.current = [];
      setShouldRedirectAfterFinish(false);
      setCallStatus(CallStatus.ACTIVE);
      setTimeLeft(900);
      toast.success("Interview started.");
      if (call?.id) saveCallId(call.id);
    };

    const onCallEnd = async () => {
      const elapsedMs = callStartedAtRef.current
        ? Date.now() - callStartedAtRef.current
        : 0;
      const endedTooSoon =
        elapsedMs > 0 &&
        elapsedMs < 7000 &&
        finalTranscriptCountRef.current === 0;

      if (!hasSeenCallStartRef.current || endedTooSoon) {
        setCallStatus(CallStatus.INACTIVE);
        setShouldRedirectAfterFinish(false);
        if (endedTooSoon) {
          toast.error(
            "Call disconnected before the interview began. Please allow microphone access and try again.",
          );
          // Reset backend status so user can retry
          if (API_URL) {
            try {
              await fetch(`${API_URL}/api/v1/interviews/active/${sessionId}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vapiCallId: null }),
              });
            } catch {
              // Non-blocking: status will be reset on next start attempt anyway
            }
          }
        }
        setSpeakingRole(null);
        clearSpeechTimeout();
        resetCallLifecycleRefs();
        return;
      }

      setIsProcessingResults(true);
      const persisted = await finalizeInterviewFromClient();
      if (!persisted) {
        setIsProcessingResults(false);
        setCallStatus(CallStatus.INACTIVE);
        setShouldRedirectAfterFinish(false);
        setSpeakingRole(null);
        clearSpeechTimeout();
        resetCallLifecycleRefs();
        return;
      }

      setCallStatus(CallStatus.FINISHED);
      setShouldRedirectAfterFinish(true);
      setSpeakingRole(null);
      clearSpeechTimeout();
      resetCallLifecycleRefs();
    };

    const onMessage = (message: {
      type?: string;
      role?: string;
      transcriptType?: string;
      transcript?: string;
      content?: string;
      message?: string;
    }) => {
      if (message.type !== "transcript") return;

      if (message.role === "user" || message.role === "assistant") {
        clearSpeechTimeout();
        setSpeakingRole(message.role);

        if (message.transcriptType === "interim") {
          speechTimeoutRef.current = setTimeout(() => {
            setSpeakingRole(null);
          }, SPEECH_TIMEOUT_MS);
        }
      }

      if (message.transcriptType === "final") {
        finalTranscriptCountRef.current += 1;
        setSpeakingRole(null);
        clearSpeechTimeout();
        const role: TranscriptMessage["role"] =
          message.role === "assistant" || message.role === "user"
            ? message.role
            : "system";

        const finalMessage = {
          role,
          content: message.transcript || message.content || "",
        };

        finalMessagesRef.current = [...finalMessagesRef.current, finalMessage];

        setMessages((prev) => [...prev, finalMessage]);
      }
    };

    const onSpeechEnd = () => {
      setSpeakingRole(null);
      clearSpeechTimeout();
    };

    const onError = (error: { message?: string; type?: string }) => {
      if (
        error?.message?.includes("Meeting has ended") ||
        error?.type === "start-method-error"
      ) {
        return;
      }
      setCallStatus(CallStatus.INACTIVE);
      setSpeakingRole(null);
      toast.error("Call error occurred. Please try again.");
    };

    (vapi as any)
      .on("call-start", onCallStart)
      .on("call-end", onCallEnd)
      .on("message", onMessage)
      .on("speech-end", onSpeechEnd)
      .on("error", onError);

    return () => {
      clearSpeechTimeout();
      (vapi as any)
        .off("call-start", onCallStart)
        .off("call-end", onCallEnd)
        .off("message", onMessage)
        .off("speech-end", onSpeechEnd)
        .off("error", onError);
    };
  }, [finalizeInterviewFromClient, saveCallId]);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED && shouldRedirectAfterFinish) {
      toast.success("Interview completed. Redirecting...");
      const t = setTimeout(() => router.push("/candidate/dashboard"), 2000);
      return () => clearTimeout(t);
    }
  }, [callStatus, router, shouldRedirectAfterFinish]);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    return () => {
      clearSpeechTimeout();
      if (
        callStatusRef.current === CallStatus.ACTIVE ||
        callStatusRef.current === CallStatus.CONNECTING
      ) {
        vapi.stop();
      }
    };
  }, []);

  const handleCall = async () => {
    if (callStatus === CallStatus.CONNECTING || isProcessingResults) return;
    if (!interviewData?.assistantConfig) {
      toast.error("Interview is not ready yet.");
      return;
    }

    setShouldRedirectAfterFinish(false);
    resetCallLifecycleRefs();
    setMessages([]);
    setCallStatus(CallStatus.CONNECTING);

    try {
      await vapi.start(interviewData.assistantConfig);
    } catch (error) {
      setCallStatus(CallStatus.INACTIVE);
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to start interview: ${msg}`);
    }
  };

  const handleDisconnect = async () => {
    if (isProcessingResults) return;
    userEndedCallRef.current = true;
    try {
      await vapi.stop();
    } catch {
      setCallStatus(CallStatus.FINISHED);
      setShouldRedirectAfterFinish(true);
      resetCallLifecycleRefs();
    }
  };

  const isInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;
  const latestMessage = messages[messages.length - 1]?.content;

  const initials = useMemo(() => {
    const name = interviewData?.candidateName || "Candidate";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }, [interviewData?.candidateName]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-4xl text-white animate-spin" />
          <div className="text-white text-lg">Preparing your interview...</div>
        </div>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">
          You are not eligible for this interview.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-start items-center gap-y-6 pb-32">
      <div className="w-[95%] flex justify-between items-center p-2 mt-6">
        <div className="text-2xl lg:text-3xl font-bold text-white">
          {interviewData.position} Interview
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-400 px-4 py-2 rounded-full border border-white/10 bg-white/5">
            {interviewData.numQuestions} Questions
          </div>
          {callStatus === CallStatus.ACTIVE && (
            <div
              className={`text-sm font-bold px-4 py-2 rounded-full border transition-all ${
                timeLeft < 120
                  ? "text-red-400 border-red-400/40 bg-red-400/10 animate-pulse"
                  : "text-emerald-400 border-emerald-400/40 bg-emerald-400/10"
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row lg:justify-around justify-center items-center gap-6 mb-4">
        <div
          className={`w-[90%] lg:w-[44%] min-h-[42vh] bg-linear-to-b from-slate-800/70 via-[#1e2433]/80 to-slate-900/40 flex flex-col justify-center items-center rounded-2xl border border-white/10 backdrop-blur-md gap-y-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] transition-all duration-300 ${
            speakingRole === "assistant"
              ? "ring-2 ring-emerald-400/60"
              : "ring-0"
          }`}
        >
          <div className="w-[90%] flex justify-start items-center p-2 gap-x-4">
            <div className="relative flex justify-center items-center w-[16%] aspect-square bg-green-700/20 rounded-full">
              {speakingRole === "assistant" && (
                <span className="absolute inline-flex h-full w-full rounded-full border-4 border-emerald-400/50 opacity-60 animate-ping" />
              )}
              <div
                className={`w-[75%] h-[75%] rounded-full bg-emerald-600/40 flex items-center justify-center ${
                  speakingRole === "assistant" ? "animate-pulse" : ""
                }`}
              >
                <span className="text-white text-lg font-bold">AI</span>
              </div>
            </div>
            <div className="flex flex-col gap-y-1">
              <div className="text-xl font-semibold text-white">
                AI Interviewer
              </div>
              <div className="text-sm text-slate-400">Nischaya Evaluator</div>
            </div>
          </div>

          <div
            className={`w-[90%] min-h-12 rounded-full flex items-center gap-x-3 px-5 py-3 border transition-all duration-300 ${
              speakingRole === "assistant"
                ? "border-emerald-400/30 bg-emerald-400/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Volume2 className="text-emerald-300" size={16} />
            <div className="text-sm text-gray-100">
              {speakingRole === "assistant" ? "Speaking..." : "Listening..."}
            </div>
          </div>

          <div className="w-[90%] text-sm text-slate-500 p-2">
            Evaluating your responses in real-time.
          </div>
        </div>

        <div
          className={`w-[90%] lg:w-[44%] min-h-[42vh] bg-linear-to-b from-slate-800/70 via-[#1e2433]/80 to-slate-900/40 flex flex-col justify-center items-center rounded-2xl border border-white/10 backdrop-blur-md gap-y-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] transition-all duration-300 ${
            speakingRole === "user" ? "ring-2 ring-indigo-400/60" : "ring-0"
          }`}
        >
          <div className="w-[90%] flex justify-start items-center p-2 gap-x-4">
            <div className="relative flex justify-center items-center w-[16%] aspect-square bg-blue-700/30 rounded-full">
              {speakingRole === "user" && (
                <span className="absolute inline-flex h-full w-full rounded-full border-4 border-blue-400/80 opacity-75 animate-ping" />
              )}
              <div
                className={`w-[75%] h-[75%] rounded-full bg-indigo-600/40 flex items-center justify-center ${
                  speakingRole === "user" ? "animate-pulse" : ""
                }`}
              >
                <span className="text-white text-lg font-bold">{initials}</span>
              </div>
            </div>
            <div className="flex flex-col gap-y-1">
              <div className="text-xl font-semibold text-white">
                {interviewData.candidateName}
              </div>
              <div className="text-sm text-slate-400">Candidate</div>
            </div>
          </div>

          <div
            className={`w-[90%] min-h-12 rounded-full flex items-center gap-x-3 px-5 py-3 border transition-all duration-300 ${
              speakingRole === "user"
                ? "border-indigo-400/30 bg-indigo-400/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <Volume2 className="text-indigo-300" size={16} />
            <div className="text-sm text-gray-100">
              {speakingRole === "user" ? "Speaking..." : "Listening..."}
            </div>
          </div>

          <div className="w-[90%] text-sm text-slate-500 p-2">
            Express your ideas clearly and confidently.
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="w-[95%] lg:w-[75%] rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] flex items-center p-5 gap-x-4">
          <div className="w-12 h-12 bg-indigo-600/40 border border-indigo-400/50 rounded-xl flex justify-center items-center shrink-0">
            <MessageCircle className="text-2xl text-white" />
          </div>
          <div className="text-lg text-white leading-relaxed">
            {latestMessage}
          </div>
        </div>
      )}

      {isProcessingResults && (
        <div className="w-[95%] lg:w-[75%] rounded-2xl bg-indigo-500/10 border border-indigo-400/30 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] flex items-center p-5 gap-x-4">
          <div className="w-12 h-12 bg-indigo-600/40 border border-indigo-400/50 rounded-xl flex justify-center items-center shrink-0">
            <Loader2 className="text-2xl text-white animate-spin" />
          </div>
          <div>
            <div className="text-base font-semibold text-white">
              Processing interview results...
            </div>
            <div className="text-sm text-indigo-100/90">
              Please wait while we analyze your responses.
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 w-full flex justify-center px-3">
        <div className="flex items-center gap-4 rounded-full border border-white/10 bg-black/20 backdrop-blur-xl px-6 py-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
          {callStatus === CallStatus.CONNECTING || isProcessingResults ? (
            <button
              disabled
              className="size-14 rounded-full grid place-items-center bg-linear-to-b from-blue-700/80 to-indigo-800/80 border border-white/15"
            >
              <Loader2 className="text-2xl text-white animate-spin" />
            </button>
          ) : isInactiveOrFinished ? (
            <button
              onClick={handleCall}
              aria-label="Start Interview"
              className="size-14 rounded-full grid place-items-center bg-linear-to-b from-emerald-700/80 to-teal-800/80 border border-white/15 hover:scale-105 transition-all duration-200"
            >
              <Phone className="text-2xl text-white" />
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              aria-label="End Interview"
              className="size-14 rounded-full grid place-items-center bg-linear-to-b from-rose-700/85 to-pink-800/80 border border-white/15 hover:scale-105 transition-all duration-200"
            >
              <PhoneOff className="text-2xl text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

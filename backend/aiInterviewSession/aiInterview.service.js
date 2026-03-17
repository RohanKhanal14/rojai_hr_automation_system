//Import
import login_credentials_model from "../user_login/user_login.schema.js";
import aiInterviewSessionModel from "./aiInterviewSession.schema.js";
import rankingModel from "../ranking/ranking.schema.js";
import applicationModel from "../application/application.schema.js";
import buildAssistantConfig from "../config/vapiConfig.js";
import { analyzeInterview } from "../config/groq.js";

const persistInterviewOutcome = async ({
  session,
  candidateSession,
  transcript,
  messages,
}) => {
  const safeTranscript = typeof transcript === "string" ? transcript : "";
  const safeMessages = Array.isArray(messages) ? messages : [];

  const analysis = await analyzeInterview(
    safeTranscript,
    safeMessages,
    session,
  );

  await aiInterviewSessionModel.findOneAndUpdate(
    {
      _id: session._id,
      "candidates._id": candidateSession._id,
    },
    {
      $set: {
        "candidates.$.status": "Completed",
        "candidates.$.completedAt": new Date(),
        "candidates.$.interviewScore": analysis.overallScore,
        "candidates.$.interviewSummary": analysis.summary,
        "candidates.$.recommendation": analysis.recommendation,
        "candidates.$.responses": analysis.responses,
      },
    },
  );

  await rankingModel.findOneAndUpdate(
    {
      candidateId: candidateSession.candidateId,
      jobId: session.jobId._id,
    },
    {
      $set: {
        interviewScore: analysis.overallScore,
        interviewDescription: analysis.summary,
        recommendation: analysis.recommendation,
      },
    },
  );

  // Update application status to Interview Completed
  await applicationModel.findOneAndUpdate(
    {
      candidateId: candidateSession.candidateId,
      jobId: session.jobId._id,
    },
    {
      $set: {
        status: "Interview Completed",
      },
    },
  );

  return analysis;
};
//Functions
const startInterview = async (req, res, sessionId) => {
  //Get LoggedIn User
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }
  //Retrieve Candidate
  const userExists = await login_credentials_model
    .findOne({ email: currentUser.email })
    .populate("candidateId");
  if (!userExists || !userExists.candidateId) {
    return res.status(404).send({
      message: "Candidate profile not found!",
      success: false,
    });
  }
  // Only candidates can take interviews
  if (currentUser.role !== "candidate") {
    return res.status(403).send({
      message: "Only candidates can access interviews!",
      success: false,
    });
  }
  const candidateId = userExists.candidateId._id.toString();
  //Find The Interview Session
  const session = await aiInterviewSessionModel
    .findById(sessionId)
    .populate("jobId", "position department");
  if (!session) {
    return res.status(404).send({
      message: "Interview session not found!",
      success: false,
    });
  }
  //Check Status If It's Closed
  if (session.status === "Closed") {
    return res.status(400).send({
      message: "This interview session is closed!",
      success: false,
    });
  }
  // Check if this candidate is in the session's candidates list
  const candidateSession = session.candidates.find(
    (c) => c.candidateId.toString() === candidateId,
  );
  if (!candidateSession) {
    return res.status(403).send({
      message:
        "Access Denied! You have not been shortlisted for this interview.",
      success: false,
    });
  }
  //Can't Redo Interview So Check Status
  if (candidateSession.status === "Completed") {
    return res.status(400).send({
      message: "You have already completed this interview!",
      success: false,
    });
  }
  // If In-Progress (e.g. from an early disconnect), allow restart by resetting
  if (candidateSession.status === "In-Progress") {
    await aiInterviewSessionModel.findOneAndUpdate(
      {
        _id: sessionId,
        "candidates.candidateId": candidateId,
      },
      {
        $set: {
          "candidates.$.status": "Pending",
        },
      },
    );
  }
  //Build VAPI transient assistant config
  const assistantConfig = buildAssistantConfig(session, userExists.candidateId);
  // Update candidate status to In-Progress
  await aiInterviewSessionModel.findOneAndUpdate(
    {
      _id: sessionId,
      "candidates.candidateId": candidateId,
    },
    {
      $set: {
        "candidates.$.status": "In-Progress",
      },
    },
  );
  // Update application status to Interview Scheduled
  await applicationModel.findOneAndUpdate(
    {
      candidateId: candidateId,
      jobId: session.jobId._id,
    },
    {
      $set: {
        status: "Interview Scheduled",
      },
    },
  );
  //Success Response
  return res.status(200).send({
    success: true,
    message: "Interview initialized! Connect to start.",
    data: {
      assistantConfig, // frontend passes this to vapi.start()
      sessionId,
      numQuestions: session.numQuestions,
      position: session.jobId.position,
      candidateName: userExists.candidateId.fullName,
    },
  });
};
const vapiWebhook = async (req, res) => {
  const payload = req.body?.message ?? req.body;
  const eventType = payload?.type;

  // Only process end-of-call-report
  if (eventType !== "end-of-call-report") {
    return res.status(200).send({ received: true });
  }

  const artifact = payload?.artifact ?? {};
  const call = payload?.call ?? {};
  const callId = call?.id ?? payload?.callId ?? payload?.id;

  if (!callId) {
    console.log("Webhook ignored: missing call id.");
    return res.status(200).send({ received: true });
  }

  const transcript = artifact?.transcript || "";
  const messages = artifact?.messages || [];
  console.log("Webhook received for call:", callId);
  // Find session by vapiCallId — reliable exact match
  const session = await aiInterviewSessionModel
    .findOne({ "candidates.vapiCallId": callId })
    .populate("jobId", "position");
  if (!session) {
    console.log("Webhook session not found for call:", callId);
    return res.status(200).send({ received: true });
  }
  // Find the specific candidate in the session
  const candidateSession = session.candidates.find(
    (c) => c.vapiCallId === callId,
  );
  if (!candidateSession) {
    console.log("Webhook candidate session not found for call:", callId);
    return res.status(200).send({ received: true });
  }
  if (candidateSession.status === "Completed") {
    return res.status(200).send({ received: true });
  }

  try {
    // Analyze transcript and persist interview results
    await persistInterviewOutcome({
      session,
      candidateSession,
      transcript,
      messages,
    });

    console.log(
      "Interview analyzed successfully for candidate:",
      candidateSession.candidateId,
    );
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    // Still return 200 to acknowledge receipt, but log the error for debugging
  }
  return res.status(200).send({ received: true });
};
const completeInterviewFromClient = async (req, res, sessionId) => {
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }

  const { transcript, messages, vapiCallId } = req.body || {};

  const userExists = await login_credentials_model
    .findOne({ email: currentUser.email })
    .populate("candidateId");
  if (!userExists || !userExists.candidateId) {
    return res.status(404).send({
      message: "Candidate profile not found!",
      success: false,
    });
  }

  const candidateId = userExists.candidateId._id.toString();
  const session = await aiInterviewSessionModel
    .findById(sessionId)
    .populate("jobId", "position");
  if (!session) {
    return res
      .status(404)
      .send({ message: "Session not found!", success: false });
  }

  const candidateSession = session.candidates.find(
    (c) => c.candidateId.toString() === candidateId,
  );
  if (!candidateSession) {
    return res.status(403).send({
      message: "Access denied for this interview session.",
      success: false,
    });
  }

  if (candidateSession.status === "Completed") {
    return res.status(200).send({
      success: true,
      message: "Interview already completed.",
      data: {
        status: "Completed",
      },
    });
  }

  if (typeof vapiCallId === "string" && vapiCallId.trim()) {
    await aiInterviewSessionModel.findOneAndUpdate(
      {
        _id: sessionId,
        "candidates.candidateId": candidateId,
      },
      {
        $set: {
          "candidates.$.vapiCallId": vapiCallId,
        },
      },
    );
    candidateSession.vapiCallId = vapiCallId;
  }

  const finalMessages = Array.isArray(messages)
    ? messages
        .filter((m) => m && typeof m === "object")
        .map((m) => ({
          role: m.role,
          content: m.content || m.message || "",
        }))
    : [];

  await persistInterviewOutcome({
    session,
    candidateSession,
    transcript,
    messages: finalMessages,
  });

  return res.status(200).send({
    success: true,
    message: "Interview processed successfully.",
    data: {
      status: "Completed",
    },
  });
};
const saveCallId = async (req, res, sessionId) => {
  const { vapiCallId } = req.body;
  const currentUser = req.user;
  if (!vapiCallId) {
    return res
      .status(400)
      .send({ message: "vapiCallId is required!", success: false });
  }
  //Find The LoggedIn User
  const userExists = await login_credentials_model
    .findOne({ email: currentUser.email })
    .populate("candidateId");
  if (!userExists || !userExists.candidateId) {
    return res
      .status(404)
      .send({ message: "Candidate not found!", success: false });
  }
  const candidateId = userExists.candidateId._id.toString();
  await aiInterviewSessionModel.findOneAndUpdate(
    {
      _id: sessionId,
      "candidates.candidateId": candidateId,
    },
    {
      $set: {
        "candidates.$.vapiCallId": vapiCallId,
      },
    },
  );
  return res.status(200).send({ success: true });
};
//Export
export { startInterview, vapiWebhook, saveCallId, completeInterviewFromClient };

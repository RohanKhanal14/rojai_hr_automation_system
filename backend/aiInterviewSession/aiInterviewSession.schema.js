//Imports
import mongoose from "mongoose";
const { Schema, model } = mongoose;
//Schema
const candidateSessionSchema = new Schema(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "candidates",
      required: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "application",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In-Progress", "Completed", "Abandoned"],
      default: "Pending",
    },
    vapiCallId: {
      type: String,
      default: null,
    },
    // Filled after VAPI call ends + Groq analysis
    interviewScore: { type: Number, min: 0, max: 100, default: null },
    interviewSummary: { type: String, default: null },
    recommendation: {
      type: String,
      enum: ["Strong Hire", "Hire", "Maybe", "No Hire", null],
      default: null,
    },
    responses: [
      {
        questionText: { type: String },
        transcription: { type: String },
        aiScore: { type: Number, min: 0, max: 100 },
        aiFeedback: { type: String },
        sentiment: {
          type: String,
          enum: ["Positive", "Neutral", "Negative"],
        },
      },
    ],
  },
  { _id: true },
);
const aiInterviewSessionSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "job",
      required: [true, "Must specify the job for this interview session."],
      unique: true, // one session per job
    },
    questions: {
      type: [String],
      required: [true, "Must specify the interview questions."],
    },
    numQuestions: {
      type: Number,
      required: [true, "Must specify the number of questions."],
    },
    interviewTone: {
      type: String,
      required: [true, "Must specify the interview tone."],
    },
    // All shortlisted candidates for this job
    candidates: {
      type: [candidateSessionSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },
  },
  { timestamps: true },
);
//Indexing
aiInterviewSessionSchema.index({ "candidates.candidateId": 1 });
//Model
const aiInterviewSessionModel = model(
  "ai_interview_session",
  aiInterviewSessionSchema,
);
//Export
export default aiInterviewSessionModel;

//Import
import mongoose from "mongoose";
const { model, Schema } = mongoose;

//Ranking Schema
const rankingSchema = new Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "application",
      required: [true, "Must specify the application information provided."],
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "job",
      required: [true, "Must specify the job for which this cv is associated."],
    },
    candidateId: {
      //For candidate dashboard
      type: Schema.Types.ObjectId,
      ref: "candidates",
      required: true,
    },
    atsScore: {
      type: Number, //Default
      min: 0,
      max: 100,
    },
    cvSummary: {
      type: String,
    },
    rank: {
      type: Number, //Default
    },
    interviewScore: {
      type: Number, //Default
      min: 0,
      max: 100,
    },
    interviewDescription: {
      type: String, //Default
    },
    recommendation: {
      type: String, //Default
    },
    reviewedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true },
);
rankingSchema.index({ jobId: 1, atsScore: -1 });
rankingSchema.index({ applicationId: 1 }, { unique: true });

//Model
const rankingModel = new model("ranking", rankingSchema);

//Export
export default rankingModel;

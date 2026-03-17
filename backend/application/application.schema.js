//Imports:
import mongoose from "mongoose";
const { Schema, model } = mongoose;

//Schema:
const cvSchema = mongoose.Schema({
  originalName: { type: String },
  cloudinaryPublicId: { type: String },
  cloudinaryUrl: {
    type: String,
    required: [true, "The cloudinary url must be specified!"],
  },
});

const applicationSchema = mongoose.Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "job",
      required: [
        true,
        "Must specify the job which this cv is associated with.",
      ],
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "candidates",
      required: [
        true,
        "Must specify the candidate who applied for this position.",
      ],
    },
    cv: {
      type: cvSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Not Selected", "Under-Review", "Interview Scheduled", "Interview Completed"],
      default: "Applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

//Model
const applicationModel = model("application", applicationSchema);

//Export
export default applicationModel;

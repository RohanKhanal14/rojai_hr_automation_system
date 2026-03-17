//Imports
import {
  POSITIONS,
  EXPERIENCE_LEVELS,
  DEPARTMENTS,
  NEPAL_LOCATIONS,
  JOB_STATUS,
  POSITION_SKILLS,
  POSITION_DEPARTMENT_MAP,
  INTERVIEW_TONE,
} from "../types/index.js";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

// Schema
const salarySchema = new Schema(
  {
    type: {
      type: String,
      enum: ["negotiable", "fixed", "range"],
      required: [
        true,
        "Must specify the type of salary information that will be shared.",
      ],
    },
    min: Number,
    max: Number,
    period: {
      type: String,
      enum: ["monthly", "yearly"],
    },
  },
  { _id: false },
);

const interviewSchema = new Schema(
  {
    num_questions: {
      type: Number,
      required: [
        true,
        "Must specify the no of questions that will be asked in the interview!",
      ],
      min: [1, "Must have at least 1 question."],
      max: [5, "Cannot exceed 5 questions."],
    },
    questions: {
      type: [String],
      default: [],
      validate: {
        validator: function (questions) {
          return questions.length === this.num_questions;
        },
        message: "Number of questions must match numQuestions.",
      },
      required: [
        true,
        "Must specify the questions that will be asked by the AI.",
      ],
    },
    interviewTone: {
      type: String,
      enum: INTERVIEW_TONE,
      default: "mixed",
    },
  },
  { _id: false },
);

const jobSchema = new Schema(
  {
    position: {
      type: String,
      enum: POSITIONS,
      required: [
        true,
        "Must specify the job title or job position of the opening!",
      ],
    }, // Also can be termed as job title
    department: {
      type: String,
      enum: DEPARTMENTS,
    }, // Also the department candidate will be positioned into
    experienceLevel: {
      type: String,
      enum: EXPERIENCE_LEVELS,
      required: [true, "Must specify the experience level for the candidate!"],
    },
    remote: {
      type: Boolean,
      default: false, //If true, then on-site employment
    },
    location: {
      type: String,
      enum: NEPAL_LOCATIONS,
      required: function () {
        return !this.remote; // location required only if not remote
      },
    }, //Will be optional if the remote-employment is off
    salary: {
      type: salarySchema,
      required: false,
    },
    deadline: {
      type: Date,
      required: [true, "Must specify the deadline of the opening."],
      validate: {
        validator: function (value) {
          return value > new Date(); // deadline must be in the future
        },
        message: "Deadline must be a future date.",
      },
    },
    status: {
      type: String,
      enum: JOB_STATUS,
      default: "Draft",
    }, //Similar to visibility
    description: {
      type: String,
      required: [true, "Must provide a job description."],
      trim: true,
    },
    mustHaveSkills: {
      type: [String],
      default: [],
      validate: {
        validator: function (skills) {
          const allowed = POSITION_SKILLS[this.position] ?? [];
          return skills.every((skill) => allowed.includes(skill));
        },
        message: "Invalid skill for this position.",
      },
    },
    niceToHaveSkills: {
      type: [String],
      default: [],
      validate: {
        validator: function (skills) {
          const allowed = POSITION_SKILLS[this.position] ?? [];
          return skills.every((skill) => allowed.includes(skill));
        },
        message: "Invalid skill for this position.",
      },
    },
    shortlistCount: {
      type: Number,
      required: [
        true,
        "Must specify the no of candidates to be shortlisted after ATS",
      ],
      min: [1, "Shortlist count must be at least 1."],
    },
    interview: {
      type: interviewSchema,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "hr_professionals",
      required: [true, "Must specify the HR user who created this job."],
    },
  },
  { timestamps: true },
);

//Pre-Save Middleware
jobSchema.pre("save", function () {
  if (this.position) {
    this.department = POSITION_DEPARTMENT_MAP[this.position];
  }

  if (this.status === "Published" && this.deadline < new Date()) {
    this.status = "Closed";
  }
});

//Model
const jobModel = model("job", jobSchema);

//Export
export default jobModel;

//Imports:
import mongoose from "mongoose";
import { EXPERIENCE_LEVELS, POSITIONS } from "../types/index.js";
const { Schema, model } = mongoose;
//Schema:
const candidateSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Name is a compulsory field!"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone No. is a compulsory field!"],
      trim: true,
      unique: [true, "Phone No. must be unique for each candidate!"],
    },
    avatarUrl: {
      type: String,
      //Optional Field
    },
    preferredPosition: {
      type: [String],
      enum: POSITIONS,
      default: [],
    },
    experienceLevel: {
      type: String,
      trim: true,
      enum: EXPERIENCE_LEVELS,
    },
    linkedInUrl: {
      type: String,
    },
  },
  { timestamps: true },
);
//Model:
const candidateModel = model("candidates", candidateSchema);
//Export:
export default candidateModel;

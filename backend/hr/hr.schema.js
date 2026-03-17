//Imports
import mongoose from "mongoose";
const { Schema, model } = mongoose;
import { HR_DESIGNATIONS } from "../types/index.js";
//Schema
const hrSchema = new Schema(
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
    company: {
      type: String,
      required: [true, "Company Name is a compulsory field!"],
      trim: true,
    },
    designation: {
      type: String, // "Senior HR Manager"
      enum: HR_DESIGNATIONS,
      trim: true,
    },
    linkedInUrl: {
      type: String,
    },
  },
  { timestamps: true },
);
//Model
const hrModel = model("hr_professionals", hrSchema);
//Export
export default hrModel;

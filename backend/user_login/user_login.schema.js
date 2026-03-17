//Imports
import mongoose from "mongoose";
const { Schema, model } = mongoose;
//Schema
const login_credentials_schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    //For Candidate
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "candidates",
      default: null,
    },
    //For Hr_Professionals
    hrProfessionalId: {
      type: Schema.Types.ObjectId,
      ref: "hr_professionals",
      default: null,
    },
  },
  { timestamps: true },
);
//Model
const login_credentials_model = model("login_cred", login_credentials_schema);
//Export
export default login_credentials_model;

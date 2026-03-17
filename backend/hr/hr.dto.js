import Joi from "joi";
import { HR_DESIGNATIONS } from "../types/index.js";

const createHrDto = Joi.object({
  fullName: Joi.string().trim().required().messages({
    "string.empty": "Name is a compulsory field!",
    "any.required": "Name is a compulsory field!",
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+]{7,15}$/) // simple regex for phone numbers
    .required()
    .messages({
      "string.empty": "Phone No. is a compulsory field!",
      "string.pattern.base": "Phone No. must be valid!",
      "any.required": "Phone No. is a compulsory field!",
    }),
  email: Joi.string()
    .trim()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .required()
    .messages({
      "string.empty": "Email is a compulsory field!",
      "string.pattern.base": "Please enter a valid email address",
    }),
  password: Joi.string()
    .trim()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
      "string.empty": "Password is required",
    }),
  avatarUrl: Joi.string().uri().optional().messages({
    "string.uri": "Avatar URL must be a valid URI",
  }),
  company: Joi.string().trim().required().messages({
    "string.empty": "Company Name is a compulsory field!",
    "any.required": "Company Name is a compulsory field!",
  }),
  designation: Joi.string()
    .valid(...HR_DESIGNATIONS)
    .trim()
    .messages({
      "any.only": "Designation must be one of the valid HR roles",
      "any.required": "Designation is required",
    }),
  linkedInUrl: Joi.string().uri().optional().messages({
    "string.uri": "LinkedIn URL must be valid",
  }),
});

export default createHrDto;

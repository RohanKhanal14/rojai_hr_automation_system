//Imports
import Joi from "joi";
import { EXPERIENCE_LEVELS, POSITIONS } from "../types/index.js";
//Object
const createCandidateDto = Joi.object({
  fullName: Joi.string().trim().required().messages({
    "string.empty": "Name is a compulsory field!",
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required()
    .messages({
      "string.empty": "Phone No. is a compulsory field!",
      "string.pattern.base": "Please enter a valid phone number",
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
    "string.uri": "Avatar URL must be a valid URL",
  }),
  preferredPosition: Joi.array()
    .items(Joi.string().valid(...POSITIONS))
    .optional()
    .messages({
      "any.only": "Invalid position selected",
    }),
  experienceLevel: Joi.string()
    .trim()
    .valid(...EXPERIENCE_LEVELS)
    .optional()
    .messages({
      "any.only": "Invalid experience level",
    }),
  linkedInUrl: Joi.string().uri().optional().messages({
    "string.uri": "LinkedIn URL must be valid",
  }),
});
export default createCandidateDto;

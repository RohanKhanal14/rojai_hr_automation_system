//Imports
import Joi from "joi";
//Objects
const verifyDto = Joi.object({
  otp: Joi.string().length(6).trim().required().messages({
    "string.empty": "Otp is a compulsory field!",
    "any.required": "Otp is a compulsory field!",
    "string.length": "Otp must be exactly 6 digits!",
  }),
});
const loginDto = Joi.object({
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
});
const resetRequestDto = Joi.object({
  email: Joi.string()
    .trim()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .required()
    .messages({
      "string.empty": "Email is a compulsory field!",
      "string.pattern.base": "Please enter a valid email address",
    }),
  role: Joi.string()
    .trim()
    .valid("candidate", "hr_professional")
    .required()
    .messages({
      "any.only":
        "Role must be one of the following: candidate or hr_professional",
    }),
});
const resetPasswordDto = Joi.object({
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
});
//Export
export { verifyDto, loginDto, resetRequestDto, resetPasswordDto };

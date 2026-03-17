import Joi from "joi";
import {
  POSITIONS,
  EXPERIENCE_LEVELS,
  NEPAL_LOCATIONS,
  POSITION_SKILLS,
  INTERVIEW_TONE,
  JOB_STATUS,
} from "../types/index.js";

// SALARY DTO
const salaryDto = Joi.object({
  type: Joi.string().valid("negotiable", "fixed", "range").required().messages({
    "any.only": "Salary type must be negotiable, fixed, or range.",
    "any.required": "Salary type is required.",
  }),
  min: Joi.when("type", {
    is: "range",
    then: Joi.number().min(0).required().messages({
      "any.required": "Min salary is required for range type.",
      "number.min": "Min salary cannot be negative.",
    }),
    otherwise: Joi.forbidden(),
  }),
  max: Joi.when("type", {
    is: Joi.valid("range", "fixed"),
    then: Joi.number().min(0).required().messages({
      "any.required": "Max salary is required for fixed or range type.",
      "number.min": "Max salary cannot be negative.",
    }),
    otherwise: Joi.forbidden(),
  }),
  period: Joi.when("type", {
    is: Joi.valid("fixed", "range"),
    then: Joi.string().valid("monthly", "yearly").required().messages({
      "any.only": "Period must be monthly or yearly.",
      "any.required": "Period is required for fixed or range salary type.",
    }),
    otherwise: Joi.forbidden(),
  }),
})
  .custom((value, helpers) => {
    if (value.type === "range" && value.min >= value.max) {
      return helpers.error("any.invalid");
    }
    return value;
  })
  .messages({
    "any.invalid": "Min salary must be less than max salary.",
  });

// INTERVIEW DTO
const interviewDto = Joi.object({
  num_questions: Joi.number().min(1).max(5).required().messages({
    "any.required": "num_questions is required.",
    "number.min": "Must have at least 1 question.",
    "number.max": "Cannot exceed 5 questions.",
  }),
  questions: Joi.array()
    .items(
      Joi.string().trim().min(1).messages({
        "string.empty": "Questions cannot be empty strings.",
      }),
    )
    .required()
    .messages({
      "any.required": "Questions are required.",
      "array.base": "Questions must be an array.",
    }),
  interviewTone: Joi.string()
    .trim()
    .valid(...INTERVIEW_TONE)
    .default("mixed")
    .messages({
      "any.only": `Interview tone must be one of: ${INTERVIEW_TONE.join(", ")}.`,
    }),
})
  .custom((value, helpers) => {
    if (value.questions.length !== value.num_questions) {
      return helpers.error("any.invalid");
    }
    return value;
  })
  .messages({
    "any.invalid": "Number of questions must match num_questions.",
  });

// JOB DTO
const jobDto = Joi.object({
  position: Joi.string()
    .trim()
    .valid(...POSITIONS)
    .required()
    .messages({
      "any.only": "Invalid position.",
      "any.required": "Position is required.",
    }),
  experienceLevel: Joi.string()
    .trim()
    .valid(...EXPERIENCE_LEVELS)
    .required()
    .messages({
      "any.only": "Invalid experience level.",
      "any.required": "Experience level is required.",
    }),
  remote: Joi.boolean().default(false),
  location: Joi.when("remote", {
    is: false,
    then: Joi.string()
      .trim()
      .valid(...NEPAL_LOCATIONS)
      .required()
      .messages({
        "any.only": "Invalid location.",
        "any.required": "Location is required for on-site jobs.",
      }),
    otherwise: Joi.forbidden(),
  }),
  description: Joi.string().trim().min(1).required().messages({
    "any.required": "Job description is required.",
    "string.empty": "Job description cannot be empty.",
  }),
  deadline: Joi.date().greater("now").required().messages({
    "any.required": "Deadline is required.",
    "date.greater": "Deadline must be a future date.",
  }),
  shortlistCount: Joi.number().min(1).required().messages({
    "any.required": "Shortlist count is required.",
    "number.min": "Shortlist count must be at least 1.",
  }),
  mustHaveSkills: Joi.array()
    .items(Joi.string())
    .default([])
    .custom((skills, helpers) => {
      const position = helpers.state.ancestors[0].position;
      const allowed = POSITION_SKILLS[position] ?? [];
      const invalid = skills.filter((s) => !allowed.includes(s));
      if (invalid.length > 0) return helpers.error("any.invalid");
      return skills;
    })
    .messages({
      "any.invalid": "Invalid skill for this position.",
    }),
  niceToHaveSkills: Joi.array()
    .items(Joi.string())
    .default([])
    .custom((skills, helpers) => {
      const position = helpers.state.ancestors[0].position;
      const allowed = POSITION_SKILLS[position] ?? [];
      const invalid = skills.filter((s) => !allowed.includes(s));
      if (invalid.length > 0) return helpers.error("any.invalid");
      return skills;
    })
    .messages({
      "any.invalid": "Invalid skill for this position.",
    }),
  salary: salaryDto.optional(),
  interview: interviewDto.required().messages({
    "any.required": "Interview configuration is required.",
  }),
});

//Update Job DTO
const updateJobDto = Joi.object({
  experienceLevel: Joi.string()
    .trim()
    .valid(...EXPERIENCE_LEVELS)
    .optional()
    .messages({
      "any.only": "Invalid experience level.",
    }),
  remote: Joi.boolean().optional(),
  location: Joi.when("remote", {
    is: false,
    then: Joi.string()
      .trim()
      .valid(...NEPAL_LOCATIONS)
      .optional()
      .messages({
        "any.only": "Invalid location.",
      }),
    otherwise: Joi.forbidden(),
  }),
  description: Joi.string().trim().min(1).optional().messages({
    "string.empty": "Job description cannot be empty.",
  }),
  deadline: Joi.date().greater("now").optional().messages({
    "date.greater": "Deadline must be a future date.",
  }),
  shortlistCount: Joi.number().min(1).optional().messages({
    "number.min": "Shortlist count must be at least 1.",
  }),
  mustHaveSkills: Joi.array()
    .items(Joi.string())
    .optional()
    .custom((skills, helpers) => {
      const position = helpers.state.ancestors[0].position;
      if (!position) return skills; // position not being updated, skip
      const allowed = POSITION_SKILLS[position] ?? [];
      const invalid = skills.filter((s) => !allowed.includes(s));
      if (invalid.length > 0) return helpers.error("any.invalid");
      return skills;
    })
    .messages({
      "any.invalid": "Invalid skill for this position.",
    }),
  niceToHaveSkills: Joi.array()
    .items(Joi.string())
    .optional()
    .custom((skills, helpers) => {
      const position = helpers.state.ancestors[0].position;
      if (!position) return skills;
      const allowed = POSITION_SKILLS[position] ?? [];
      const invalid = skills.filter((s) => !allowed.includes(s));
      if (invalid.length > 0) return helpers.error("any.invalid");
      return skills;
    })
    .messages({
      "any.invalid": "Invalid skill for this position.",
    }),
  salary: salaryDto.optional(),
  status: Joi.string()
    .trim()
    .valid(...JOB_STATUS)
    .optional()
    .messages({
      "any.only": "Invalid job status.",
    }),
  interview: interviewDto.optional(),
})
  .min(1) // at least one field must be provided
  .messages({
    "object.min": "At least one field must be provided to update.",
  });

//Exports
export { updateJobDto, jobDto };

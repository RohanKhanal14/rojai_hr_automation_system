//Imports
import Joi from "joi";

//Creation DTO
const createApplicationDto = Joi.object({
  jobId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid Job Id format!",
    "string.length": "Invlaid Job Id length!",
    "any.required": "Job ID is required!",
  }),
});

//Export
export { createApplicationDto };

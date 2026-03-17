//Imports
import express from "express";
import createCandidateDto from "./candidate.dto.js";
import { register } from "./candidate.service.js";
//Config
const candidateController = express.Router();
//Routing
candidateController.post("/", async (req, res) => {
  try {
    const { error, value } = createCandidateDto.validate(req.body, {
      abortEarly: false,
    });
    //Check For Errors
    if (error) {
      return res
        .status(400)
        .send({ message: "Request Structure Invalid!", success: false });
    }
    //Forward The Call To Service
    await register(req, res, value);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", success: false });
    return console.error("Internal Server Error!", error.message);
  }
});
candidateController.get("/", (req, res) => {
  res.status(200).send({ message: "Success Candidate", success: true });
});
//Export
export default candidateController;

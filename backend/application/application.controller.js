//Imports
import express from "express";
import protectLogin from "../guard/protectLoginGuard.js";
import protectCandidateRoute from "../guard/protectCandidateGuard.js";
import {
  createApplication,
  getApplicationInfo,
  getCreatedApplications,
  getMyApplications,
} from "./application.service.js";
import protectHrRoute from "../guard/protectHRGuard.js";
import { createApplicationDto } from "./application.dto.js";

//Router Config
const applicationController = express.Router();

//REST-API Routes
//1. GET REQUESTS
// NOTE: Static paths (/my, /job/:id) must be registered before the dynamic /:id route
applicationController.get(
  "/my",
  protectLogin,
  protectCandidateRoute,
  async (req, res) => {
    try {
      await getMyApplications(req, res);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Internal Server Error!", success: false });
      console.error(`Internal Server Error - ${error.message}`);
    }
  },
);
applicationController.get(
  "/job/:id",
  protectLogin,
  protectHrRoute,
  async (req, res) => {
    try {
      const jobId = req.params.id;
      if (!jobId || !jobId.trim()) {
        return res.status(400).send({
          message: "Must provide a valid job info to retrieve!",
          success: false,
        });
      }
      await getCreatedApplications(req, res, jobId);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Internal Server Error!", success: false });
      console.error(`Internal Server Error - ${error.message}`);
    }
  },
);
applicationController.get("/:id", protectLogin, async (req, res) => {
  try {
    const applicationId = req.params.id;
    if (!applicationId || !applicationId.trim()) {
      return res.status(400).send({
        message: "Must provide a valid application to extract info!",
        success: false,
      });
    }
    await getApplicationInfo(req, res, applicationId);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error!", success: false });
    console.error(`Internal Server Error - ${error.message}`);
  }
});

//2. POST REQUESTS
applicationController.post(
  "/",
  protectLogin,
  protectCandidateRoute,
  async (req, res) => {
    try {
      //Check The Dto
      const { error, value } = createApplicationDto.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        return res.status(400).send({
          message: "The request structure was invalid!",
          success: false,
        });
      }
      //Validate Files
      const file = req.files?.cv;
      if (!file) {
        return res
          .status(400)
          .send({ message: "CV file is required!", success: false });
      }
      if (file.mimetype !== "application/pdf") {
        return res
          .status(400)
          .send({ message: "Only PDF files are allowed!", success: false });
      }
      const maxSize = 5 * 1024 * 1024; //5-GB
      if (file.size > maxSize) {
        return res
          .status(400)
          .send({ message: "File size must not exceed 5MB!", success: false });
      }
      //Send to the function
      await createApplication(req, res, value, file);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Internal Server Error!", success: false });
      console.error(`Internal Server Error - ${error.message}`);
    }
  },
);

//Export
export default applicationController;

//IMPORTS
import express from "express";
import { jobDto, updateJobDto } from "./job.dto.js";
import {
  createJob,
  deleteJobInfo,
  getCurrentlyListed,
  getJobRankings,
  getPersonalJobInfos,
  getSpecificJobInfo,
  runShortListing,
  updateJobInfo,
} from "./job.service.js";
import protectLogin from "../guard/protectLoginGuard.js";
import protectHrRoute from "../guard/protectHRGuard.js";
import protectCandidateRoute from "../guard/protectCandidateGuard.js";
//ROUTE CONFIG
const jobsController = express.Router();

//REST-API ENDPOINTS
//1. GET REQUESTS
//i. Candidates Dashboard Job Listing
jobsController.get(
  "/listings",
  protectLogin,
  protectCandidateRoute,
  async (req, res) => {
    try {
      await getCurrentlyListed(req, res);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Internal Server Error!", success: false });
      return console.error("Internal Server Error!", error.message);
    }
  },
);
//ii. HR Professionals Dashboard Job Listing
jobsController.get(
  "/personal",
  protectLogin,
  protectHrRoute,
  async (req, res) => {
    try {
      await getPersonalJobInfos(req, res);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Internal Server Error!", success: false });
      return console.error("Internal Server Error!", error.message);
    }
  },
);
//iii. Get the current rankings for the job application (/:id child route before /:id)
jobsController.get(
  "/:id/rankings",
  protectLogin,
  protectHrRoute,
  async (req, res) => {
    try {
      const jobId = req.params.id;
      if (!jobId || !jobId.trim()) {
        return res
          .status(400)
          .send({ message: "Must provide the id of the job.", success: false });
      }
      await getJobRankings(req, res, jobId);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Internal Server Error!", success: false });
      return console.error("Internal Server Error!", error.message);
    }
  },
);
//iv. Get Specific Job Info (dynamic /:id route LAST)
jobsController.get("/:id", protectLogin, async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId || !jobId.trim()) {
      return res
        .status(400)
        .send({ message: "Must provide the id of the job.", success: false });
    }
    await getSpecificJobInfo(req, res, jobId);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error!", success: false });
    return console.error("Internal Server Error!", error.message);
  }
});
//2. POST REQUESTS
jobsController.post("/", protectLogin, protectHrRoute, async (req, res) => {
  try {
    const { error, value } = jobDto.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).send({
        message: `Must match the structure of the request - ${error.message}`,
        success: false,
      });
    }
    await createJob(req, res, value);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Internal Server Error!", success: false, error });
    return console.error("Internal Server Error!", error);
  }
});
jobsController.post(
  "/:id/shortlist",
  protectLogin,
  protectHrRoute,
  async (req, res) => {
    try {
      const jobId = req.params.id;
      if (!jobId || !jobId.trim()) {
        return res
          .status(400)
          .send({ message: "Must provide the id of the job.", success: false });
      }
      await runShortListing(req, res, jobId);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Internal Server Error!", success: false, error });
      return console.error("Internal Server Error!", error);
    }
  },
);
//3. PATCH REQUESTS
jobsController.patch("/:id", protectLogin, protectHrRoute, async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId || !jobId.trim()) {
      return res
        .status(400)
        .send({ message: "Must provide the id of the job.", success: false });
    }
    const { error, value } = updateJobDto.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).send({
        message: `Must match the structure of the request - ${error.message}`,
        success: false,
      });
    }
    await updateJobInfo(req, res, value, jobId);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error!", success: false });
    return console.error("Internal Server Error!", error.message);
  }
});
//4. DELETE REQUESTS
jobsController.delete(
  "/:id",
  protectLogin,
  protectHrRoute,
  async (req, res) => {
    try {
      const jobId = req.params.id;
      if (!jobId || !jobId.trim()) {
        return res
          .status(400)
          .send({ message: "Must provide the id of the job.", success: false });
      }
      await deleteJobInfo(req, res, jobId);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Internal Server Error!", success: false });
      return console.error("Internal Server Error!", error.message);
    }
  },
);
//EXPORT
export default jobsController;

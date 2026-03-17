//Imports
import express from "express";
import protectLogin from "../guard/protectLoginGuard.js";
import protectCandidateRoute from "../guard/protectCandidateGuard.js";
import {
  startInterview,
  vapiWebhook,
  saveCallId,
  completeInterviewFromClient,
} from "./aiInterview.service.js";
//Controller Config
const aiInterviewController = express.Router();
//Api-Routing
aiInterviewController.post("/webhook", async (req, res) => {
  try {
    await vapiWebhook(req, res);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error!", success: false });
    console.error(`Webhook Error - ${error.message}`);
  }
});
aiInterviewController.post(
  "/start/:id",
  protectLogin,
  protectCandidateRoute,
  async (req, res) => {
    try {
      const aiInterviewSessionId = req.params.id;
      if (!aiInterviewSessionId || !aiInterviewSessionId.trim()) {
        return res.status(400).send({
          message: "Must provide a valid interview info to start!",
          success: false,
        });
      }
      await startInterview(req, res, aiInterviewSessionId);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Internal Server Error!", success: false });
      console.error(`Internal Server Error - ${error.message}`);
    }
  },
);
aiInterviewController.patch(
  "/active/:id",
  protectLogin,
  protectCandidateRoute,
  async (req, res) => {
    try {
      const aiInterviewSessionId = req.params.id;
      if (!aiInterviewSessionId || !aiInterviewSessionId.trim()) {
        return res.status(400).send({
          message: "Must provide a valid interview info to start!",
          success: false,
        });
      }
      await saveCallId(req, res, aiInterviewSessionId);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Internal Server Error!", success: false });
      console.error(`Internal Server Error - ${error.message}`);
    }
  },
);
aiInterviewController.post(
  "/complete/:id",
  protectLogin,
  protectCandidateRoute,
  async (req, res) => {
    try {
      const aiInterviewSessionId = req.params.id;
      if (!aiInterviewSessionId || !aiInterviewSessionId.trim()) {
        return res.status(400).send({
          message: "Must provide a valid interview info to complete!",
          success: false,
        });
      }
      await completeInterviewFromClient(req, res, aiInterviewSessionId);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Internal Server Error!", success: false });
      console.error(`Internal Server Error - ${error.message}`);
    }
  },
);
//Export
export default aiInterviewController;

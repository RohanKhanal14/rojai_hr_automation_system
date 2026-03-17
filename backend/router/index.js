//Imports
import express from "express";
import candidateController from "../candidate/candidate.controller.js";
import userController from "../user_login/user_login.controller.js";
import hrController from "../hr/hr.controller.js";
import jobsController from "../job/job.controller.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../config/swagger.js";
import applicationController from "../application/application.controller.js";
import aiInterviewController from "../aiInterviewSession/aiInterview.controller.js";
//Middlewares
const app = express.Router();
//Routing
app.use("/api/v1/candidates", candidateController);
app.use("/api/v1/hrProfessionals", hrController);
app.use("/api/v1/users", userController);
app.use("/api/v1/jobs", jobsController);
app.use("/api/v1/applications", applicationController);
app.use("/api/v1/interviews", aiInterviewController);
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//Exports
export default app;

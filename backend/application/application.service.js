//Imports
import { uploadPdf } from "../config/cloudinary.js";
import login_credentials_model from "../user_login/user_login.schema.js";
import applicationModel from "./application.schema.js";
import jobModel from "../job/job.schema.js";
import rankingModel from "../ranking/ranking.schema.js";
import aiInterviewSessionModel from "../aiInterviewSession/aiInterviewSession.schema.js";
import axios from "axios";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { analyzeCV } from "../config/groq.js";

const normalizeAtsScore = (raw) => {
  const scoreNum = Number(raw);
  if (!Number.isFinite(scoreNum)) return 0;
  // Groq may return 0-1 or 0-100; normalize to 0-100
  const scaled = scoreNum <= 1 ? scoreNum * 100 : scoreNum;
  return Math.max(0, Math.min(100, Math.round(scaled)));
};
//Functions
const createApplication = async (
  req,
  res,
  applicationInfo,
  applicationFile,
) => {
  //Get The Logged-In User
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }
  //Find the user in the db
  const userExists = await login_credentials_model
    .findOne({
      email: currentUser.email,
    })
    .populate("candidateId");
  if (!userExists) {
    return res.status(404).send({
      message: "The logged-in user wasn't found in the system!",
      success: false,
    });
  }
  //Find whether the Job exists
  const jobExists = await jobModel.findById(applicationInfo.jobId);
  if (!jobExists) {
    return res.status(404).send({
      message: "The applied job doesn't exist in the system!",
      success: false,
    });
  }
  if (jobExists.deadline < new Date()) {
    return res
      .status(401)
      .send({ message: "Deadline has passed!", success: false });
  }
  //Check Duplicate Application
  const alreadyApplied = await applicationModel.findOne({
    jobId: applicationInfo.jobId,
    candidateId: userExists.candidateId._id,
  });
  if (alreadyApplied) {
    return res
      .status(409)
      .send({ message: "Already applied for this job!", success: false });
  }
  //Parsing CV and Sending To Groq
  let parsedCV;
  try {
    parsedCV = await pdfParse(applicationFile.data);
  } catch (pdfError) {
    console.error("PDF parsing failed:", pdfError.message);
    return res.status(400).send({
      message:
        "Unable to parse the uploaded PDF. The file may be corrupted or in an unsupported format. Please try re-exporting or re-saving the PDF and upload again.",
      success: false,
    });
  }
  const { atsScore, cvSummary } = await analyzeCV(parsedCV.text, jobExists);
  const normalizedAtsScore = normalizeAtsScore(atsScore);
  //Upload To Cloudinary
  const cvData = await uploadPdf(applicationFile.data);
  if (!cvData) {
    return res.status(500).send({
      message: "Internal Server Error, PDF Upload Failed!",
      success: false,
    });
  }
  //Creation In DB
  const newApplication = await applicationModel.create({
    jobId: applicationInfo.jobId,
    candidateId: userExists.candidateId._id,
    cv: cvData,
    status: "Applied",
    appliedAt: Date.now(),
  });
  if (!newApplication) {
    return res.status(500).send({
      message: "Internal Server Error, Failed To Create New Application!",
      success: false,
    });
  }
  //Save ATS Ranking
  const newRanking = await rankingModel.create({
    applicationId: newApplication._id,
    jobId: applicationInfo.jobId,
    candidateId: userExists.candidateId._id,
    atsScore: normalizedAtsScore,
    cvSummary: cvSummary || "No AI summary available.",
  });
  if (!newRanking) {
    return res.status(500).send({
      message: "Unable to apply, Internal Error! Ats Scoring!",
      success: false,
    });
  }
  //Success Response
  return res
    .status(201)
    .send({ message: "Successfully Applied!", success: true });
};
const getApplicationInfo = async (req, res, applicationId) => {
  //Get The Logged-In User
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }
  //Extract Info According To Role
  if (currentUser.role === "candidate") {
    //Find Candidate
    const candidateExists = await login_credentials_model
      .findOne({ email: currentUser.email })
      .populate("candidateId");
    if (!candidateExists) {
      return res.status(404).send({
        message: "The logged-in user wasn't found in the system!",
        success: false,
      });
    }
    //Find Application
    const applicationInfo = await applicationModel
      .findOne({
        _id: applicationId,
        candidateId: candidateExists.candidateId._id,
      })
      .populate("jobId", "position department status deadline experienceLevel")
      .select("jobId status appliedAt cv");
    if (!applicationInfo) {
      return res.status(404).send({
        message: "The provided application wasn't found in the system!",
        success: false,
      });
    }
    //Check if job still exists
    if (!applicationInfo.jobId) {
      return res.status(410).send({
        message:
          "The job for this application has been removed or is no longer available.",
        success: false,
      });
    }
    //Extract CV Info
    const response = await axios.get(applicationInfo.cv.cloudinaryUrl, {
      responseType: "arraybuffer",
    });
    const base64CV = Buffer.from(response.data).toString("base64");
    const cvDataUri = `data:application/pdf;base64,${base64CV}`;
    const rankingInfo = await rankingModel.findOne({
      applicationId: applicationInfo._id,
    });
    const interviewSession = await aiInterviewSessionModel.findOne({
      jobId: applicationInfo.jobId?._id,
      "candidates.candidateId": candidateExists.candidateId._id,
    });
    const candidateInterview = interviewSession?.candidates?.find(
      (c) =>
        c.candidateId.toString() === candidateExists.candidateId._id.toString(),
    );
    //Return Data — hide ATS/summary until HR has shortlisted
    const isReviewed = applicationInfo.status !== "Applied";
    return res.status(200).send({
      message: "Successfully Retrieved!",
      success: true,
      data: {
        job: applicationInfo.jobId,
        status: applicationInfo.status,
        appliedAt: applicationInfo.appliedAt,
        atsScore: isReviewed
          ? typeof rankingInfo?.atsScore === "number"
            ? normalizeAtsScore(rankingInfo.atsScore)
            : null
          : null,
        cvSummary: isReviewed ? rankingInfo?.cvSummary ?? null : null,
        interviewSessionId: interviewSession?._id ?? null,
        interviewStatus: candidateInterview?.status ?? null,
        interviewScore:
          typeof rankingInfo?.interviewScore === "number"
            ? Math.max(0, Math.min(100, Math.round(rankingInfo.interviewScore)))
            : null,
        interviewSummary: rankingInfo?.interviewDescription ?? null,
        interviewRecommendation: rankingInfo?.recommendation ?? null,
        cv: {
          originalName: applicationInfo.cv.originalName,
          file: cvDataUri,
        },
      },
    });
  } else {
    //Find HR Professional
    const hrProfessionalExists = await login_credentials_model
      .findOne({ email: currentUser.email })
      .populate("hrProfessionalId");
    if (!hrProfessionalExists) {
      return res.status(404).send({
        message: "The logged-in user wasn't found in the system!",
        success: false,
      });
    }
    //Find Application
    let applicationInfo = await applicationModel
      .findById(applicationId)
      .populate("candidateId", "fullName phone")
      .populate({
        path: "jobId",
        match: { createdBy: hrProfessionalExists.hrProfessionalId._id }, //Check the creator
      });
    if (!applicationInfo) {
      return res.status(404).send({
        message: "The provided application wasn't found in the system!",
        success: false,
      });
    }
    if (!applicationInfo.jobId) {
      // Could be either job deleted or permission denied
      // Check if the application actually has a jobId in the database
      const rawApp = await applicationModel
        .findById(applicationId)
        .select("jobId");
      if (!rawApp?.jobId) {
        return res.status(410).send({
          message:
            "The job for this application has been removed or is no longer available.",
          success: false,
        });
      } else {
        return res.status(403).send({
          message: "You don't have permission to view this application!",
          success: false,
        });
      }
    }
    
    //Fetch Candidate Email
    let candidateEmail = "";
    if (applicationInfo.candidateId) {
      const candidateLogins = await login_credentials_model
        .findOne({ candidateId: applicationInfo.candidateId._id })
        .select("email");
      if (candidateLogins) {
        candidateEmail = candidateLogins.email;
      }
    }

    const candidateData = {
      ...applicationInfo.candidateId?.toObject(),
      email: candidateEmail,
    };

    //Extract CV Info
    const response = await axios.get(applicationInfo.cv.cloudinaryUrl, {
      responseType: "arraybuffer",
    });
    const base64CV = Buffer.from(response.data).toString("base64");
    const cvDataUri = `data:application/pdf;base64,${base64CV}`;
    const rankingInfo = await rankingModel.findOne({
      applicationId: applicationInfo._id,
    });
    //Return Data
    return res.status(200).send({
      message: "Successfully Retrieved!",
      success: true,
      data: {
        job: applicationInfo.jobId,
        candidate: candidateData, //Profile Viewing
        status: applicationInfo.status,
        appliedAt: applicationInfo.appliedAt,
        atsScore:
          typeof rankingInfo?.atsScore === "number"
            ? normalizeAtsScore(rankingInfo.atsScore)
            : null,
        cvSummary: rankingInfo?.cvSummary ?? null,
        interviewScore:
          typeof rankingInfo?.interviewScore === "number"
            ? Math.max(0, Math.min(100, Math.round(rankingInfo.interviewScore)))
            : null,
        interviewSummary: rankingInfo?.interviewDescription ?? null,
        interviewRecommendation: rankingInfo?.recommendation ?? null,
        cv: {
          originalName: applicationInfo.cv.originalName,
          cloudinaryPublicId: applicationInfo.cv.cloudinaryPublicId,
          file: cvDataUri,
        },
      },
    });
  }
};
const getCreatedApplications = async (req, res, jobId) => {
  //Get The Logged-In User
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }
  //Find HR Professional
  const hrProfessionalExists = await login_credentials_model
    .findOne({ email: currentUser.email })
    .populate("hrProfessionalId");
  if (!hrProfessionalExists) {
    return res.status(404).send({
      message: "The logged-in user wasn't found in the system!",
      success: false,
    });
  }
  //Verify Job Ownership
  const jobExists = await jobModel.findOne({
    _id: jobId,
    createdBy: hrProfessionalExists.hrProfessionalId._id,
  });
  if (!jobExists) {
    return res.status(403).send({
      message: "You don't have permission to view applications for this job!",
      success: false,
    });
  }
  //Find Applications
  const applicationsInfo = await applicationModel
    .find({ jobId: jobId })
    .sort({ appliedAt: -1 });
  if (!applicationsInfo) {
    return res.status(404).send({
      message: "The provided application wasn't found in the system!",
      success: false,
    });
  }
  //Success Response
  return res.status(200).send({
    message: "Successfully Retrieved!",
    success: true,
    data: applicationsInfo,
  });
};
const getMyApplications = async (req, res) => {
  //Get The Logged-In User
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }
  //Find Candidate
  const candidateExists = await login_credentials_model
    .findOne({ email: currentUser.email })
    .populate("candidateId");
  if (!candidateExists) {
    return res.status(404).send({
      message: "The logged-in user wasn't found in the system!",
      success: false,
    });
  }
  //Find Application
  const applicationsInfo = await applicationModel
    .find({
      candidateId: candidateExists.candidateId._id,
    })
    .populate("jobId", "position department status deadline")
    .select("jobId status appliedAt")
    .sort({ appliedAt: -1 });
  if (!applicationsInfo) {
    return res.status(404).send({
      message: "The provided application wasn't found in the system!",
      success: false,
    });
  }
  //Filter out applications where job has been deleted
  const validApplications = applicationsInfo.filter((app) => app.jobId !== null);
  //Success Response
  return res.status(200).send({
    message: "Successfully Retrieved!",
    success: true,
    data: validApplications,
  });
};

//Exports
export {
  createApplication,
  getApplicationInfo,
  getCreatedApplications,
  getMyApplications,
};

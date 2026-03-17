//Imports
import jobModel from "./job.schema.js";
import login_credentials_model from "../user_login/user_login.schema.js";
import rankingModel from "../ranking/ranking.schema.js";
import applicationModel from "../application/application.schema.js";
import aiInterviewSessionModel from "../aiInterviewSession/aiInterviewSession.schema.js";
import mailer from "../config/mailer.js";

const normalizeAtsScore = (raw) => {
  const scoreNum = Number(raw);
  if (!Number.isFinite(scoreNum)) return 0;
  const scaled = scoreNum <= 1 ? scoreNum * 100 : scoreNum;
  return Math.max(0, Math.min(100, Math.round(scaled)));
};

const repairLegacyAtsScoresForJob = async (jobId) => {
  const rankings = await rankingModel.find({ jobId }).select("_id atsScore");
  const ops = [];

  for (const ranking of rankings) {
    const normalized = normalizeAtsScore(ranking.atsScore);
    if (ranking.atsScore !== normalized) {
      ops.push({
        updateOne: {
          filter: { _id: ranking._id },
          update: { $set: { atsScore: normalized } },
        },
      });
    }
  }

  if (ops.length > 0) {
    await rankingModel.bulkWrite(ops);
  }
};

//API METHODS
//Get Methods
const getPersonalJobInfos = async (req, res) => {
  //After Login we can access the email and the role so, extract that:
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }
  //Getting UserId
  const userExists = await login_credentials_model
    .findOne({
      email: currentUser.email,
    })
    .populate("hrProfessionalId");
  if (!userExists) {
    return res
      .status(404)
      .send({ message: "Provided user wasn't found!", success: false });
  }
  //Finding The Job
  const jobsInfo = await jobModel
    .find({
      createdBy: userExists.hrProfessionalId._id,
    })
    .sort({ createdAt: -1 });
  if (!jobsInfo) {
    return res
      .status(500)
      .send({ message: "Internal DB Error!", success: false });
  }
  //Return The Info
  return res
    .status(200)
    .send({ message: "Successfully Retrieved!", success: true, jobsInfo });
};
const getCurrentlyListed = async (req, res) => {
  //After Login we can access the email and the role so, extract that:
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }
  const jobsInfo = await jobModel
    .find({ status: "Published" })
    .select(
      "position department experienceLevel employmentType location remote description deadline mustHaveSkills salary",
    )
    .sort({ createdAt: -1 });
  if (!jobsInfo) {
    return res
      .status(500)
      .send({ message: "Internal DB Error!", success: false });
  }
  //Return The Info
  return res
    .status(200)
    .send({ message: "Successfully Retrieved!", success: true, jobsInfo });
};
const getSpecificJobInfo = async (req, res, jobId) => {
  //After Login we can access the email and the role so, extract that:
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }
  //Role Specific Info Extraction:
  let jobsInfo;
  if (currentUser.role === "candidate") {
    jobsInfo = await jobModel
      .findOne({ _id: jobId, status: "Published" })
      .select(
        "position department experienceLevel employmentType location remote description deadline mustHaveSkills",
      );
    if (!jobsInfo) {
      return res
        .status(500)
        .send({ message: "Internal DB Error!", success: false });
    }
  } else {
    const loginInfo = await login_credentials_model
      .findOne({ email: currentUser.email })
      .populate("hrProfessionalId");
    if (!loginInfo) {
      return res.status(404).send({
        message: "The Logged In Hr Professional's info wasn't found!",
        success: false,
      });
    }
    jobsInfo = await jobModel.findOne({
      _id: jobId,
      createdBy: loginInfo.hrProfessionalId._id,
    });
    if (!jobsInfo) {
      return res.status(401).send({
        message:
          "Must be a job personally created by you. Can't see other users job info!",
        success: false,
      });
    }
  }
  //Return Response Info:
  return res
    .status(200)
    .send({ message: "Successfully Retrieved!", success: true, jobsInfo });
};
const getJobRankings = async (req, res, jobId) => {
  //After Login we can access the email and the role so, extract that:
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }
  const userExists = await login_credentials_model
    .findOne({ email: currentUser.email })
    .populate("hrProfessionalId");
  if (!userExists) {
    return res.status(404).send({
      message: "The provided user was not found in the system!",
      success: false,
    });
  }
  //Get The Job Info
  const jobExists = await jobModel.findOne({
    _id: jobId,
    createdBy: userExists.hrProfessionalId._id,
  });
  if (!jobExists) {
    return res.status(403).send({
      message: "Must be created by the user to access.",
      success: false,
    });
  }
  // Normalize any legacy 0-1 ATS scores so list/detail/shortlist remain consistent.
  await repairLegacyAtsScoresForJob(jobId);
  //Get The Rankings Info
  const rankingsRaw = await rankingModel
    .find({ jobId })
    .sort({ atsScore: -1 })
    .populate("candidateId", "fullName phone");

  const rankings = rankingsRaw;
  //Send The Sorted Rankings
  return res.status(200).send({
    success: true,
    data: rankings,
  });
};
//Post Methods
const createJob = async (req, res, jobInfo) => {
  //After Login we can access the email and the role so, extract that:
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }
  const userExists = await login_credentials_model.findOne({
    email: currentUser.email,
  });
  if (!userExists) {
    return res
      .status(404)
      .send({ message: "Provided user wasn't found!", success: false });
  }
  const hrInfo = await login_credentials_model
    .findById(userExists._id)
    .populate("hrProfessionalId");
  if (!hrInfo) {
    return res.status(404).send({
      message: "Provided HR Professional's info wasn't found!",
      success: false,
    });
  }
  //Create New Job
  const newJob = await jobModel.create({
    ...jobInfo,
    createdBy: hrInfo.hrProfessionalId._id,
  });
  if (!newJob) {
    return res
      .status(500)
      .send({ message: "Internal DB Error! Try Again!", success: false });
  }
  //Success Response
  return res
    .status(201)
    .send({ message: "New Job has been listed!", success: true });
};
const runShortListing = async (req, res, jobId) => {
  //After Login we can access the email and the role so, extract that:
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }
  const userExists = await login_credentials_model
    .findOne({ email: currentUser.email })
    .populate("hrProfessionalId");
  if (!userExists) {
    return res.status(404).send({
      message: "The provided user was not found in the system!",
      success: false,
    });
  }
  //Get The Job Info
  const jobExists = await jobModel.findOne({
    _id: jobId,
    createdBy: userExists.hrProfessionalId._id,
  });
  if (!jobExists) {
    return res.status(403).send({
      message: "Must be created by the user to access.",
      success: false,
    });
  }
  // Ensure shortlist uses normalized ATS values.
  await repairLegacyAtsScoresForJob(jobId);
  //Get The Rankings
  const rankings = await rankingModel.find({ jobId }).sort({ atsScore: -1 });
  if (rankings.length < jobExists.shortlistCount) {
    return res.status(400).send({
      message: `Not enough applicants yet! Required: ${jobExists.shortlistCount}, Applied: ${rankings.length}, Remaining: ${jobExists.shortlistCount - rankings.length}`,
      success: false,
    });
  }
  //Specify The Shortlisted And Rejected Candidates
  const shortlisted = rankings.slice(0, jobExists.shortlistCount);
  const rejected = rankings.slice(jobExists.shortlistCount);
  //Updating The Status
  for (const ranking of shortlisted) {
    await applicationModel.findByIdAndUpdate(ranking.applicationId, {
      status: "Shortlisted",
    });
  }
  for (const ranking of rejected) {
    await applicationModel.findByIdAndUpdate(ranking.applicationId, {
      status: "Not Selected",
    });
  }
  //Create or update aiInterviewSession safe for multiple triggers
  const eligibleCandidates = shortlisted.map((r) => ({
    candidateId: r.candidateId,
    applicationId: r.applicationId,
    status: "Pending",
  }));
  const existingSession = await aiInterviewSessionModel.findOne({ jobId });
  if (existingSession) {
    const existingCandidateIds = existingSession.candidates.map((c) =>
      c.candidateId.toString(),
    );
    const newCandidates = eligibleCandidates.filter(
      (c) => !existingCandidateIds.includes(c.candidateId.toString()),
    );
    if (newCandidates.length > 0) {
      await aiInterviewSessionModel.findOneAndUpdate(
        { jobId },
        { $push: { candidates: { $each: newCandidates } } }, // only add new ones
      );
    }
  } else {
    await aiInterviewSessionModel.create({
      jobId,
      questions: jobExists.interview.questions,
      numQuestions: jobExists.interview.num_questions,
      interviewTone: jobExists.interview.interviewTone,
      candidates: eligibleCandidates,
    });
  }

  // Send shortlist notifications (best-effort, do not fail shortlisting on email issues).
  try {
    const shortlistedCandidateIds = shortlisted.map((r) => r.candidateId);
    const credentialRows = await login_credentials_model
      .find({
        candidateId: { $in: shortlistedCandidateIds },
      })
      .populate("candidateId", "fullName")
      .select("email candidateId");

    const mailTasks = credentialRows
      .filter((row) => row.email)
      .map((row) =>
        mailer({
          type: "shortlistedForInterview",
          receiver: row.email,
          candidateName: row.candidateId?.fullName || "Candidate",
          position: jobExists.position,
        }),
      );

    if (mailTasks.length > 0) {
      const mailResults = await Promise.allSettled(mailTasks);
      const failedCount = mailResults.filter(
        (result) => result.status === "rejected",
      ).length;
      if (failedCount > 0) {
        console.warn(
          `Shortlisting mail notifications failed for ${failedCount} candidate(s).`,
        );
      }
    }
  } catch (mailError) {
    console.error(
      `Unable to complete shortlist notification emails: ${mailError.message}`,
    );
  }

  //Return Success
  return res.status(200).send({
    success: true,
    message: "Shortlisting complete!",
    data: {
      totalApplications: rankings.length,
      shortlisted: shortlisted.length,
      rejected: rejected.length,
    },
  });
};
//Patch Methods
const updateJobInfo = async (req, res, updateData, jobId) => {
  //After Login we can access the email and the role so, extract that:
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }
  //Get The Job Info
  const loginInfo = await login_credentials_model
    .findOne({ email: currentUser.email })
    .populate("hrProfessionalId");
  if (!loginInfo) {
    return res.status(404).send({
      message: "The Logged In Hr Professional's info wasn't found!",
      success: false,
    });
  }
  const existingJob = await jobModel.findOne({
    _id: jobId,
    createdBy: loginInfo.hrProfessionalId._id,
  });
  if (!existingJob) {
    return res.status(401).send({
      message:
        "The job your trying to edit must be created by you and should be draft.",
    });
  }
  const updateJobInfo = await jobModel.findByIdAndUpdate(
    existingJob._id,
    updateData,
    {
      returnDocument: "after",
    },
  );
  if (!updateJobInfo) {
    return res.status(500).send({
      message: "Unable to updated, Internal DB Error!",
      success: false,
    });
  }
  //Return Response
  return res.status(200).send({
    message: "Successfullt Updated!",
    success: true,
    jobInfo: updateJobInfo,
  });
};
//Delete Methods
const deleteJobInfo = async (req, res, jobId) => {
  //After Login we can access the email and the role so, extract that:
  const currentUser = req.user;
  if (!currentUser) {
    return res
      .status(401)
      .send({ message: "Must login to continue!", success: false });
  }
  //Get The Job Info
  const loginInfo = await login_credentials_model
    .findOne({ email: currentUser.email })
    .populate("hrProfessionalId");
  if (!loginInfo) {
    return res.status(404).send({
      message: "The Logged In Hr Professional's info wasn't found!",
      success: false,
    });
  }
  const existingJob = await jobModel.findOne({
    _id: jobId,
    createdBy: loginInfo.hrProfessionalId._id,
    status: { $in: ["Draft", "Closed"] },
  });
  if (!existingJob) {
    return res.status(401).send({
      message:
        "The job your trying to edit must be created by you and should be draft.",
    });
  }

  // Cascade delete: Delete all applications for this job
  await applicationModel.deleteMany({ jobId: existingJob._id });

  // Delete all rankings for this job
  await rankingModel.deleteMany({ jobId: existingJob._id });

  // Delete the job itself
  const deleteJobInfo = await jobModel.findByIdAndDelete(existingJob._id);
  if (!deleteJobInfo) {
    return res.status(500).send({
      message: "Unable to delete, Internal DB Error!",
      success: false,
    });
  }
  //Return Response
  return res.status(200).send({
    message: "Successfully Deleted!",
    success: true,
  });
};

//Exports
export {
  createJob,
  runShortListing,
  getPersonalJobInfos,
  getCurrentlyListed,
  getSpecificJobInfo,
  getJobRankings,
  updateJobInfo,
  deleteJobInfo,
};

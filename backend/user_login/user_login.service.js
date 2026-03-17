//Imports
import redis from "../config/redis.js";
import hrModel from "../hr/hr.schema.js";
import candidateModel from "../candidate/candidate.schema.js";
import login_credentials_model from "./user_login.schema.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrpyt from "bcryptjs";
import mailer from "../config/mailer.js";
// Helper Functions
const createTokens = (payload) => {
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: "3d",
  });
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  return { refreshToken, accessToken };
};
//End-Point Functions
const verifyUser = async (req, res, verifyInfo, token) => {
  //Verify The Token
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SIGNUP_SECRET);
  } catch (_) {
    return res
      .status(401)
      .send({ message: "Invalid Token Received!", success: false });
  }
  //Retrieve Info From Redis
  const userInfo = await redis.get(payload.email);
  if (!userInfo) {
    return res.status(404).send({
      message:
        "Either invalid email received, or the 5 mins has expired! Try Again!",
      success: false,
    });
  }
  //Check Otp
  if (userInfo.rate <= 0) {
    await redis.del(payload.email);
    return res.status(401).send({
      message: "All the attempts have been excercised! Try Signing Up Again!",
      success: false,
    });
  }
  //Rate-Limiting
  if (userInfo.otp !== verifyInfo.otp) {
    userInfo.rate -= 1;
    if (userInfo.rate <= 0) {
      await redis.del(payload.email);
      return res.status(401).send({
        message: "All the attempts have been exercised! Try Signing Up Again!",
        success: false,
      });
    }
    await redis.set(payload.email, JSON.stringify(userInfo), { ex: 300 });
    return res.status(400).send({
      message: `Invalid Otp, Attempts Remaining: ${userInfo.rate}`,
      success: false,
    });
  }
  //Successfully Verified
  if (payload.role === "candidate") {
    const {
      otp,
      rate,
      role,
      email,
      password: encryptedPassword,
      ...candidateData
    } = userInfo;
    //Decrypt The Password
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
    const iv = Buffer.from(process.env.ENCRYPTION_IV, "hex");
    const decipher = crypto.createDecipheriv(
      process.env.ENCRYPTION_ALGORITHM,
      key,
      iv,
    );
    let decrypted = decipher.update(encryptedPassword, "hex", "utf8");
    decrypted += decipher.final("utf8");
    //Blowfish Hashing
    const salt = await bcrpyt.genSalt(Number(process.env.BCRYPT_ROUND) || 10);
    const hashedPassword = await bcrpyt.hash(decrypted, salt);
    //Create Candidate
    let newCandidate;
    try {
      newCandidate = await candidateModel.create(candidateData);
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const label = field === "phone" ? "Phone number" : "Email";
        return res
          .status(409)
          .send({ message: `${label} is already registered!`, success: false });
      }
      throw err;
    }
    //Create Login Credentials
    try {
      await login_credentials_model.create({
        email,
        password: hashedPassword,
        candidateId: newCandidate._id,
      });
    } catch (err) {
      await candidateModel.findByIdAndDelete(newCandidate._id);
      if (err.code === 11000) {
        return res
          .status(409)
          .send({ message: "Email is already registered!", success: false });
      }
      throw err;
    }
    await redis.del(payload.email);
    //Send The Mail
    const mailingInfo = {
      receiver: payload.email,
      type: "welcomeUser",
    };
    await mailer(mailingInfo);
    //Issue Tokens & Auto Login
    const { refreshToken, accessToken } = createTokens({
      email,
      role: "candidate",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      secure: process.env.ENVIRONMENT === "production",
      sameSite: "strict",
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 mins
      secure: process.env.ENVIRONMENT === "production",
      sameSite: "strict",
    });
    return res.status(201).send({
      message: "Account verified! You are now logged in.",
      success: true,
    });
  } else {
    const {
      otp,
      rate,
      role,
      email,
      password: encryptedPassword,
      ...hrData
    } = userInfo;
    //Decrypt The Password
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
    const iv = Buffer.from(process.env.ENCRYPTION_IV, "hex");
    const decipher = crypto.createDecipheriv(
      process.env.ENCRYPTION_ALGORITHM,
      key,
      iv,
    );
    let decrypted = decipher.update(encryptedPassword, "hex", "utf8");
    decrypted += decipher.final("utf8");
    //Blowfish Hashing
    const salt = await bcrpyt.genSalt(Number(process.env.BCRYPT_ROUND) || 10);
    const hashedPassword = await bcrpyt.hash(decrypted, salt);
    //Create HR Professional
    let newHrProfessional;
    try {
      newHrProfessional = await hrModel.create(hrData);
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const label = field === "phone" ? "Phone number" : "Email";
        return res
          .status(409)
          .send({ message: `${label} is already registered!`, success: false });
      }
      throw err;
    }
    //Create Login Credentials
    try {
      await login_credentials_model.create({
        email,
        password: hashedPassword,
        hrProfessionalId: newHrProfessional._id,
      });
    } catch (err) {
      await hrModel.findByIdAndDelete(newHrProfessional._id);
      if (err.code === 11000) {
        return res
          .status(409)
          .send({ message: "Email is already registered!", success: false });
      }
      throw err;
    }
    await redis.del(payload.email);
    //Send The Mail
    const mailingInfo = {
      receiver: payload.email,
      type: "welcomeUser",
    };
    await mailer(mailingInfo);
    //Issue Tokens & Auto Login
    const { refreshToken, accessToken } = createTokens({
      email,
      role: "hr_professional",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      secure: process.env.ENVIRONMENT === "production",
      sameSite: "strict",
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 mins
      secure: process.env.ENVIRONMENT === "production",
      sameSite: "strict",
    });
    return res.status(201).send({
      message: "Account verified! You are now logged in.",
      success: true,
    });
  }
};
const loginUser = async (req, res, loginInfo) => {
  //Find The User
  let userExists = await login_credentials_model.findOne({
    email: loginInfo.email,
  });
  if (!userExists) {
    return res
      .status(404)
      .send({ message: "The provided user wasn't found!", success: false });
  }
  //Compare The Password
  const isPasswordValid = await bcrpyt.compare(
    loginInfo.password,
    userExists.password,
  );
  if (!isPasswordValid) {
    return res
      .status(401)
      .send({ message: "Invalid Password Provided!", success: false });
  }
  //Prepare an object as payload for the token
  const role = userExists.candidateId ? "candidate" : "hr_professional";
  const payload = {
    email: userExists.email,
    role,
  };
  const { refreshToken, accessToken } = createTokens(payload);
  //Setting Up HttpOnly Cookies
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    secure: process.env.ENVIRONMENT === "production",
    sameSite: "strict",
  });
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000, // 15 mins
    secure: process.env.ENVIRONMENT === "production",
    sameSite: "strict",
  });
  //Success
  return res.status(200).send({
    message: "Successfully Logged In!",
    success: true,
  });
};
const logoutUser = async (req, res) => {
  try {
    //Setup Cookies
    res.cookie(
      "accessToken",
      {},
      {
        httpOnly: true,
        maxAge: 0,
        secure: process.env.ENVIRONMENT === "production",
        sameSite: "strict",
      },
    );
    res.cookie(
      "refreshToken",
      {},
      {
        httpOnly: true,
        maxAge: 0,
        secure: process.env.ENVIRONMENT === "production",
        sameSite: "strict",
      },
    );
    //Return Response
    return res
      .status(200)
      .send({ message: "Successfully LoggedOut!", success: true });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error!", success: false });
    console.error("Internal Server Error!", error.message);
  }
};
const resetRequest = async (req, res, resetInfo) => {
  try {
    //1. Find Whether The User Exists
    const emailExists = await login_credentials_model.findOne({
      email: resetInfo.email,
    });
    if (!emailExists) {
      return res
        .status(401)
        .send({ message: "The provided user wasn't found!", success: false });
    }
    //2. Check For The Role
    const userExists =
      resetInfo.role === "candidate"
        ? await candidateModel.findOne({ _id: emailExists.candidateId })
        : await hrModel.findOne({ _id: emailExists.hrProfessionalId });
    if (!userExists) {
      return res.status(401).send({
        message: "The user doesn't belong to the provided role.",
        success: false,
      });
    }
    //3. Create New OTP Code
    const otp = crypto.randomInt(100000, 999999).toString();
    //4. Use Redis To Store The Information
    await redis.set(
      `reset-${resetInfo.email}`,
      {
        ...resetInfo,
        otp,
        id: userExists._id,
      },
      {
        ex: 300, //5 mins
      },
    );
    //5. Generate JWT Token
    const resetToken = jwt.sign(
      resetInfo,
      process.env.JWT_RESET_PASSWORD_SECRET,
      {
        expiresIn: "5m", //5 mins
      },
    );
    if (!resetToken) {
      return res.status(500).send({
        message: "Unable To Create The Token; Internal Server Error!",
        success: false,
      });
    }
    //6. Send The Email
    await mailer({
      type: "resetOtp",
      receiver: resetInfo.email,
      otp,
    });
    //7. Return The Success Response
    return res.status(200).send({
      message: "Check your email for the otp to reset the password",
      success: true,
      token: resetToken,
    });
  } catch (error) {
    res.status(500).send({
      message: `Internal Server Error: ${error.message}`,
      success: false,
    });
    console.error("Internal Server Error!", error.message);
  }
};
const verifyResetOtp = async (req, res, verifyInfo, token) => {
  try {
    //1. Check The Token First
    const payload = jwt.verify(token, process.env.JWT_RESET_PASSWORD_SECRET);
    if (!payload) {
      return res.status(401).send({
        message: "Must be a valid token to continue.",
        success: false,
      });
    }
    const { email, role } = payload;
    //2. Check The Redis
    const userInfo = await redis.get(`reset-${email}`);
    if (!userInfo) {
      return res.status(404).send({
        message: "No reset info was found, maybe 5 mins have passed!",
        success: false,
      });
    }
    //3. Check OTP
    if (userInfo.rate <= 0) {
      await redis.del(`reset-${email}`);
      return res.status(401).send({
        message:
          "All the attempts have been excercised! Try Resetting Password Again!",
        success: false,
      });
    }
    //4. Rate-Limiting
    if (userInfo.otp !== verifyInfo.otp) {
      userInfo.rate -= 1;
      if (userInfo.rate <= 0) {
        await redis.del(`reset-${email}`);
        return res.status(401).send({
          message:
            "All the attempts have been exercised! Try Signing Up Again!",
          success: false,
        });
      }
      await redis.set(`reset-${email}`, JSON.stringify(userInfo), { ex: 300 });
      return res.status(400).send({
        message: `Invalid Otp, Attempts Remaining: ${userInfo.rate}`,
        success: false,
      });
    }
    //5. After Success Another Token To Reset Password
    const final_reset_token = jwt.sign(
      {
        email,
        role,
        userId: userInfo.id,
      },
      process.env.JWT_NEW_PASSWORD_SECRET,
      { expiresIn: "5m" },
    ); //5 mins reset
    if (!final_reset_token) {
      return res.status(500).send({
        message: "Unable To Create The Token; Internal Server Error!",
        success: false,
      });
    }
    //6. Delete The Redis Value If Success
    await redis.del(`reset-${email}`);
    //7. Return
    return res.status(200).send({
      message: "Successfully Verified Identity!",
      success: true,
      token: final_reset_token,
    });
  } catch (error) {
    res.status(500).send({
      message: `Internal Server Error: ${error.message}`,
      success: false,
    });
    console.error("Internal Server Error!", error.message);
  }
};
const resetPassowrd = async (req, res, passwordInfo, token) => {
  try {
    //1. Check The Token First
    const payload = jwt.verify(token, process.env.JWT_NEW_PASSWORD_SECRET);
    if (!payload) {
      return res.status(401).send({
        message: "Must be a valid token to continue.",
        success: false,
      });
    }
    const { email, role, userId } = payload;
    //2. Reset The Password
    const userExists =
      role === "candidate"
        ? await login_credentials_model.findOne({ email, candidateId: userId })
        : await login_credentials_model.findOne({
            email,
            hrProfessionalId: userId,
          });
    if (!userExists) {
      return res.status(404).send({
        message: "The provided user was not found in the system!",
        success: false,
      });
    }
    const salt = await bcrpyt.genSalt(process.env.BCRYPT_ROUND || 10);
    const hashedPassword = await bcrpyt.hash(passwordInfo.password, salt);
    const updatePassword = await login_credentials_model.findByIdAndUpdate(
      userExists._id,
      {
        password: hashedPassword,
      },
      { returnDocument: "after" },
    );
    if (!updatePassword) {
      return res
        .status(500)
        .send({ message: "Password Update Failed!", success: false });
    }
    //3. Send Mail
    await mailer({ type: "passwordResetMail", receiver: email });
    //4. Return Response
    return res
      .status(200)
      .send({ message: "Successfully Updated!", success: true });
  } catch (error) {
    res.status(500).send({
      message: `Internal Server Error: ${error.message}`,
      success: false,
    });
    console.error("Internal Server Error!", error.message);
  }
};
const currentUser = async (req, res) => {
  try {
    //Access The Info:
    const userInfo = req.user;
    let currentUser;
    if (userInfo.role === "candidate") {
      currentUser = await login_credentials_model
        .findOne({ email: userInfo.email })
        .populate("candidateId")
        .select("-password");
    } else {
      currentUser = await login_credentials_model
        .findOne({ email: userInfo.email })
        .populate("hrProfessionalId")
        .select("-password");
    }
    if (!currentUser) {
      return res.status(404).send({
        message: "Unable to find the specific user!",
        success: false,
      });
    }
    const user = currentUser.toObject();

    currentUser = {
      ...user,
      role: userInfo.role,
    };
    //Return Response:
    return res
      .status(200)
      .send({ message: "Successfully Retrieved!", success: true, currentUser });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error!", success: false });
    console.error("Internal Server Error!", error.message);
  }
};
//Export
export {
  verifyUser,
  loginUser,
  logoutUser,
  currentUser,
  resetRequest,
  verifyResetOtp,
  resetPassowrd,
};

//Imports
import redis from "../config/redis.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mailer from "../config/mailer.js";
import candidateModel from "./candidate.schema.js";
import login_credentials_model from "../user_login/user_login.schema.js";
//Service Methods
const register = async (req, res, candidateInfo) => {
  //Check Unique Constraints Before Generating OTP
  const [existingEmail, existingPhone] = await Promise.all([
    login_credentials_model.findOne({
      email: candidateInfo.email.toLowerCase().trim(),
    }),
    candidateModel.findOne({ phone: candidateInfo.phone.trim() }),
  ]);
  if (existingEmail) {
    return res
      .status(409)
      .send({ message: "Email is already registered!", success: false });
  }
  if (existingPhone) {
    return res
      .status(409)
      .send({ message: "Phone number is already registered!", success: false });
  }
  //Encrypt Password
  const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
  const iv = Buffer.from(process.env.ENCRYPTION_IV, "hex");
  const cipher = crypto.createCipheriv(
    process.env.ENCRYPTION_ALGORITHM,
    key,
    iv,
  );
  let encrypted = cipher.update(candidateInfo.password, "utf8", "hex");
  encrypted += cipher.final("hex");
  candidateInfo.password = encrypted; //Encrypt The Password
  //Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString(); //6-digit otp in string
  //Store The Values In Redis
  await redis.set(
    candidateInfo.email,
    JSON.stringify({
      ...candidateInfo,
      otp,
      rate: 5,
      role: "candidate",
    }),
    { ex: 300 },
  ); //Expires After 5 mins
  //JWT Token
  const token = jwt.sign(
    { email: candidateInfo.email, role: "candidate" },
    process.env.JWT_SIGNUP_SECRET,
    { expiresIn: "5m" }, // 5 mins expiration
  );
  //Send The Email
  const mailingInfo = {
    type: "verifyAccount",
    receiver: candidateInfo.email,
    otp: otp,
  };
  await mailer(mailingInfo);
  //Return Response
  res.status(201).send({
    message: "Successfully initialized, must validate otp to continue!",
    token,
    success: true,
  });
};
//Export
export { register };

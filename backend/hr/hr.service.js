//Imports
import redis from "../config/redis.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mailer from "../config/mailer.js";
import hrModel from "./hr.schema.js";
import login_credentials_model from "../user_login/user_login.schema.js";
//Service Methods
const register = async (req, res, hrProfessionalInfo) => {
  //Check Unique Constraints Before Generating OTP
  const [existingEmail, existingPhone] = await Promise.all([
    login_credentials_model.findOne({
      email: hrProfessionalInfo.email.toLowerCase().trim(),
    }),
    hrModel.findOne({ phone: hrProfessionalInfo.phone.trim() }),
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
  let encrypted = cipher.update(hrProfessionalInfo.password, "utf8", "hex");
  encrypted += cipher.final("hex");
  hrProfessionalInfo.password = encrypted; //Encrypt The Password
  //Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString(); //6-digit otp in string
  //Store The Values In Redis
  await redis.set(
    hrProfessionalInfo.email,
    JSON.stringify({
      ...hrProfessionalInfo,
      otp,
      rate: 5,
      role: "hr_professional",
    }),
    { ex: 300 },
  ); //Expires After 5 mins
  //JWT Token
  const token = jwt.sign(
    { email: hrProfessionalInfo.email, role: "hr_professional" },
    process.env.JWT_SIGNUP_SECRET,
    { expiresIn: "5m" }, // 5 mins expiration
  );
  //Send Mail
  const mailingInfo = {
    type: "verifyAccount",
    receiver: hrProfessionalInfo.email,
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

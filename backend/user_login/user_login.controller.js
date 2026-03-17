//Imports
import express from "express";
import {
  verifyDto,
  loginDto,
  resetRequestDto,
  resetPasswordDto,
} from "./user_login.dto.js";
import {
  verifyUser,
  loginUser,
  logoutUser,
  currentUser,
  resetRequest,
  verifyResetOtp,
  resetPassowrd,
} from "./user_login.service.js";
import protectLogin from "../guard/protectLoginGuard.js";
//Init
const userController = express.Router();
//Routes
//1. Get Requests
userController.get("/", protectLogin, async (req, res) => {
  await currentUser(req, res);
});
//2. Post Requests
userController.post("/", async (req, res) => {
  try {
    const { error, value } = loginDto.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).send({
        message: `Request Structure Invalid: ${error}`,
        success: false,
      });
    }
    await loginUser(req, res, value);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error!", success: false });
    return console.error("Internal Server Error!", error.message);
  }
});
userController.post("/logout", protectLogin, async (req, res) => {
  await logoutUser(req, res);
});
userController.post("/reset", async (req, res) => {
  try {
    const { error, value } = resetRequestDto.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).send({
        message: `Request Structure Invalid: ${error}`,
        success: false,
      });
    }
    await resetRequest(req, res, value);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error!", success: false });
    console.error("Internal Server Error!", error.message);
  }
});
userController.post("/reset-verify/:token", async (req, res) => {
  try {
    const token = req.params.token;
    if (!token || !token.trim()) {
      return res
        .status(400)
        .send({ message: "The token was missing!", success: false });
    }
    const { error, value } = verifyDto.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).send({
        message: `Request Structure Invalid: ${error.message}`,
        success: false,
      });
    }
    await verifyResetOtp(req, res, value, token);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error!", success: false });
    console.error("Internal Server Error!", error.message);
  }
});
userController.post("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;
    if (!token || !token.trim()) {
      return res
        .status(400)
        .send({ message: "The token was missing!", success: false });
    }
    const { error, value } = verifyDto.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res
        .status(400)
        .send({ message: "Request Structure Invalid!", success: false });
    }
    await verifyUser(req, res, value, token);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error!", success: false });
    return console.error("Internal Server Error!", error.message);
  }
});
//3. Patch Requests
userController.patch("/password/:token", async (req, res) => {
  try {
    const token = req.params.token;
    if (!token || !token.trim()) {
      return res
        .status(400)
        .send({ message: "The token was missing!", success: false });
    }
    const { error, value } = resetPasswordDto.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res
        .status(400)
        .send({ message: "Request Structure Invalid!", success: false });
    }
    await resetPassowrd(req, res, value, token);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error!", success: false });
    return console.error("Internal Server Error!", error.message);
  }
});
//Export
export default userController;

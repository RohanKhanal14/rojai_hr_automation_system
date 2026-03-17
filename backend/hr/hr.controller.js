//Imports
import express from "express";
import createHrDto from "./hr.dto.js";
import { register } from "./hr.service.js";
//Config
const hrController = express.Router();
//Routing
hrController.post("/", async (req, res) => {
  try {
    const { error, value } = createHrDto.validate(req.body, {
      abortEarly: false,
    });
    //Check For Errors
    if (error) {
      return res
        .status(400)
        .send({ message: "Request Structure Invalid!", success: false });
    }
    //Forward The Call To Service
    await register(req, res, value);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", success: false });
    return console.error("Internal Server Error!", error.message);
  }
});
//Export
export default hrController;

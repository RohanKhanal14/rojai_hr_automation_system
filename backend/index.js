//Imports
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./router/index.js";
import cookie from "cookie-parser";
import fileUpload from "express-fileupload";
//Config
dotenv.config();
//Middlewares
const app = express();
app.use(express.json());
app.use(cookie());

const allowedOrigins = ["http://localhost:3000"].filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl/postman) with no Origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(fileUpload());
app.use("/", router);

//Main App
app.listen(process.env.PORT || 3001, async () => {
  await mongoose.connect(process.env.MONGO_URI || "");
  console.log("App successfully initialized and connected to db!");
  console.log(`App is running in: http://localhost:${process.env.PORT}`);
});
//Export
export default app;

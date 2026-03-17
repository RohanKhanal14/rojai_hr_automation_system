//Imports
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

//Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Uploader Function
const uploadPdf = async (fileBuffer) => {
  try {
    //Convert it into base-64 URL
    const base64 = fileBuffer.toString("base64");
    const dataUri = `data:application/pdf;base64,${base64}`;
    //Upload to cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "Yukti.exe/cvs",
      resource_type: "raw",
      use_filename: true,
      unique_filename: true,
    });
    return {
      originalName: result.original_filename,
      cloudinaryPublicId: result.public_id,
      cloudinaryUrl: result.secure_url,
    };
  } catch (error) {
    console.log(`Cloudinary Error - ${error.message}`);
  }
};

//Export
export { uploadPdf };

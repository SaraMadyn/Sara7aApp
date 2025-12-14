import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileTypeFromBuffer } from "file-type";

export const fileValidation = {
  images: ["image/jpeg", "image/png", "image/jpg"],
  videos: ["video/mp4", "video/mpeg", "video/quicktime"],
  audios: ["audio/webm", "audio/mp3"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ]
};

export const localFileUpload = ({ customPath = "general", validation = [] }) => {
  const basePath = `uploads/${customPath}`;
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let userBasePath = basePath;

      if (req.user?._id)
        userBasePath += `/${req.user._id}`;

      const fullPath = path.resolve(`./src/${userBasePath}`);

      if (!fs.existsSync(fullPath))
        fs.mkdirSync(fullPath, { recursive: true });

      cb(null, fullPath);
    },

    filename: function (req, file, cb) {
      const uniqueSuffix =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        "-" +
        file.originalname;

      file.finalPath = `${basePath}/${req.user._id}/${uniqueSuffix}`;
      cb(null, uniqueSuffix);
    }
  });

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => cb(null, true) 
  });

  const validateMagicNumber = async (file) => {
    const buffer = fs.readFileSync(file.path);
    const type = await fileTypeFromBuffer(buffer);

    if (!type || !validation.includes(type.mime)) {
      fs.unlinkSync(file.path);
      throw new Error("Invalid file type (Magic Number failed)");
    }
  };

  return {
    single: (field) => [
      upload.single(field),

      async (req, res, next) => {
        try {
          if (!req.file) return next(new Error("No file uploaded"));

          await validateMagicNumber(req.file);
          next();
        } catch (err) {
          next(err);
        }
      }
    ],

    array: (field, max) => [
      upload.array(field, max),

      async (req, res, next) => {
        try {
          if (!req.files || req.files.length === 0)
            return next(new Error("No files uploaded"));

          for (const file of req.files) {
            await validateMagicNumber(file);
          }

          next();
        } catch (err) {
          next(err);
        }
      }
    ]
  };
};

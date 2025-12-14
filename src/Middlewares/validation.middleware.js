import joi from "joi";
import { GenderEnum } from "../DB/models/user.model.js";
import { Types } from "mongoose";

export const validation = (schema) => {
  return (req, res, next) => {
    

    let data = {};

    if (req.body) data = { ...req.body };

    if (req.file) data.file = req.file;

    if (req.files) data.files = req.files;

    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: "Validation Error",
        details: error.details.map((err) => ({
          message: err.message,
          path: err.path,
        })),
      });
    }

    return next();
  };
};


export const generalFields = {
  firstName: joi.string().min(2).max(20),
  lastName: joi.string().min(2).max(20),
  email: joi.string().email(),
  password: joi.string(),
  confirmPassword: joi.ref("password"),
  gender: joi.string().valid(...Object.values(GenderEnum)),
  phone: joi.string().pattern(new RegExp(/^01[0125][0-9]{8}$/)),
  otp: joi.string(),
  id: joi.string().custom((value, helpers) => {
    return (
      Types.ObjectId.isValid(value) ||
      helpers.message("Invalid objectId format")
    );
  }),


  file: {
    fieldname: joi.string(),
    originalname: joi.string(),
    encoding: joi.string(),
    mimetype: joi.string(),
    size: joi.number(),
    destination: joi.string(),
    filename: joi.string(),
    path: joi.string(),
    finalPath: joi.string(),
  }
};

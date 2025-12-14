import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middleware.js";
import { fileValidation } from "../../Utils/multer/local.multer.js";

export const profileImgSchema = joi.object({
  file: joi.object({
    fieldname: generalFields.file.fieldname.valid("profileImg").required(),
    originalname: generalFields.file.originalname.required(),
    encoding: generalFields.file.encoding.required(),
    mimetype: generalFields.file.mimetype.valid(...fileValidation.images).required(),
    size: generalFields.file.size.max(5 * 1024 * 1024).required(),
    destination: generalFields.file.destination.required(),
    filename: generalFields.file.filename.required(),
    path: generalFields.file.path.required(),
    finalPath: generalFields.file.finalPath.required(),
  }).required(),
});


export const coverImagesSchema = joi.object({
  files: joi.array().items(
    joi.object({
      fieldname: generalFields.file.fieldname.valid("coverImages").required(),
      originalname: generalFields.file.originalname.required(),
      encoding: generalFields.file.encoding.required(),
      mimetype: generalFields.file.mimetype.valid(...fileValidation.images).required(),
      size: generalFields.file.size.max(5 * 1024 * 1024).required(),
      destination: generalFields.file.destination.required(),
      filename: generalFields.file.filename.required(),
      path: generalFields.file.path.required(),
      finalPath: generalFields.file.finalPath.required(),
    })
  ).min(1).required()
});

export const freezeAccountSchema = joi.object({
  params: joi.object({
    userId: generalFields.id,
  })
});

export const restoreAccountSchema = joi.object({
  params: joi.object({
    userId: generalFields.id.required(),
  })
});
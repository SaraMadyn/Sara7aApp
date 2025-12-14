import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middleware.js";
import { roleEnum } from "../../DB/models/user.model.js";

export const signupSchema = joi.object({
  firstName: generalFields.firstName.required(),
  lastName: generalFields.lastName.required(),
  email: generalFields.email.required(),
  password: generalFields.password.required(),
  confirmPassword: generalFields.confirmPassword,
  gender: generalFields.gender,
  phone: generalFields.phone,
  role: joi.string().valid("USER","ADMIN").default(roleEnum.USER),
});

export const loginSchema = joi.object({
  email: generalFields.email.required(),
  password: generalFields.password.required(),
});

export const confirmEmailSchema = joi.object({
  email: generalFields.email.required(),
  otp: generalFields.otp.required(),
});

export const forgetPasswordSchema = joi.object({
  email: generalFields.email.required(),
});

export const resetPasswordSchema = joi.object({
  email: generalFields.email.required(),
  otp: generalFields.otp.required(),
  password: generalFields.password.required(),
  confirmPassword: generalFields.confirmPassword,
});

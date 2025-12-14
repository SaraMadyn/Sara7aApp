import { Router } from "express";
import * as authService from "./auth.service.js";
import { authorization, tokenTypeEnum } from "../../Middlewares/auth.middleware.js";

import { validation } from "../../Middlewares/validation.middleware.js";
import { signupSchema, loginSchema, confirmEmailSchema, forgetPasswordSchema, resetPasswordSchema } from "./auth.validation.js";
import { localFileUpload } from "../../Utils/multer/local.multer.js";

const router = Router();

const wrap = (fn) => (req, res, next) => fn(req, res, next);

router.post("/signup",validation(signupSchema), authService.signup);
router.post("/login",validation(loginSchema), authService.login);
router.patch("/confirm-email", validation(confirmEmailSchema), authService.confirmEmail);
router.post("/revoke-token", authorization({tokenType: tokenTypeEnum.ACCESS}), authService.logout);
router.post("/refresh-token",authorization({tokenType: tokenTypeEnum.REFRESH}) ,authService.refreshToken);
router.patch("/forget-password", validation(forgetPasswordSchema), authService.forgetPassword);
router.patch("/reset-password",validation(resetPasswordSchema), authService.resetPassword);

router.post("/social-login", authService.loginWithGmail);

export default router;

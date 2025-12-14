import { Router } from "express";

const router = Router();

import * as userServices from "./user.service.js";
import { authorization, tokenTypeEnum } from "../../Middlewares/auth.middleware.js";
import { fileValidation, localFileUpload } from "../../Utils/multer/local.multer.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import { profileImgSchema, coverImagesSchema, freezeAccountSchema , restoreAccountSchema} from "./user.validation.js";
import {cloudFileUploadMulter} from "../../Utils/multer/cloud.multer.js";
import { authorizationAdmin } from "../../Middlewares/auth.middleware.js";
import { roleEnum } from "../../DB/models/user.model.js";





router.patch("/update", authorization({tokenType:tokenTypeEnum.ACCESS}),authorizationAdmin({accessRoles:[roleEnum.USER]}), userServices.updateProfile);
router.get("/", userServices.listAllUsers);

router.patch(
  "/profile-img",authorization,authorizationAdmin({accessRoles:[roleEnum.ADMIN]}),
  cloudFileUploadMulter({validation:[...fileValidation.images]}).single("profileImg"),
  userServices.profileImg);   

router.patch(
  "/cover-images",authorization,
  cloudFileUploadMulter({validation:[...fileValidation.images]}).array("coverImages",5),
  userServices.coverImages);

router.delete(
  "/freeze-account",
  authorization({ tokenType: tokenTypeEnum.ACCESS }),
  authorizationAdmin({ accessRoles: [roleEnum.USER, roleEnum.ADMIN] }),
  validation(freezeAccountSchema),
  userServices.freezeAccount
);


router.patch(
  "/restore-account",
  authorization({ tokenType: tokenTypeEnum.ACCESS }),
  authorizationAdmin({ accessRoles: [roleEnum.USER, roleEnum.ADMIN] }),
  validation(restoreAccountSchema),
  userServices.restoreAccount
);

export default router;


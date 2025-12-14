import UserModel, { providerEnum } from "../../DB/models/user.model.js";
import { successResponse } from "../../Utils/successResponse.units.js";
import * as dbService from "../../DB/dbService.js";

import { asymmetricEncrypt, encrypt } from "../../Utils/encryption/encryption.units.js";
import { hash, compare } from "../../Utils/hashing/hashing.units.js";
import { emailSubject } from "../../Utils/emails/email.utils.js";
import { customAlphabet } from "nanoid";
import { eventEmitter } from "../../Utils/events/email.event.utils.js";
import {v4 as uuid} from "uuid";
import { generateToken } from "../../Utils/tokens/token.utils.js";
import { verifyToken } from "../../Utils/tokens/token.utils.js";
import TokenModel from "../../DB/models/token.model.js";
import {OAuth2Client} from 'google-auth-library';
import {getNewLoginCred} from "../../Utils/tokens/token.utils.js";




export const signup = async (req, res, next) => {
  console.log("REQ BODY:", req.body);

  const { firstName, lastName, email, password, gender, phone } = req.body;
  


  

  const checkUser = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (checkUser) {
    return next(new Error("User Already Exists", { cause: 409 }));
  }

  const otp = customAlphabet("0123456789qwertyuioplkjhgfdsa", 6)();

  console.log("DATA SENT TO DB:", {
    firstName,
    lastName,
    email,
    passwordHashed: await hash({ plainText: password }),
    phoneEncrypted: asymmetricEncrypt(phone),
    confirmEmailOTP_Hashed: await hash({ plainText: otp }),
    gender,
  });

  const user = await dbService.create({
    model: UserModel,
    data: {
      firstName,
      lastName,
      email,
      password: await hash({ plainText: password }),
      phone: asymmetricEncrypt(phone),
      confirmEmailOTP: await hash({ plainText: otp }),
      gender,
    },
  });

  eventEmitter.emit("confirmEmail", { to: email, otp, firstName });

  return successResponse(res, 201, "User Created successfully", { user });
};


export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const checkUser = await dbService.findOne({  
    model: UserModel,
    filter: { email},
  });

  if (!checkUser) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (!(await compare({ plainText: password, hash: checkUser.password }))) {
    return next(new Error("Invalid credentials", { cause: 400 }));
  }
  if(!checkUser.confirmEmail) {
    return next(new Error("Please confirm your email", { cause: 400 }));
  }

  const credentials= await getNewLoginCred(checkUser)
  return successResponse(res, 200, "User logged in successfully", { credentials });
};
export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  const checkUser = await dbService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOTP: { $exists: true }
    },
  });

  if (!checkUser) {
    return next(new Error("User not found or already confirmed", { cause: 404 }));
  }


  if (Date.now() > checkUser.confirmEmailOTPExpires) {
    return next(new Error("OTP expired, please request a new one", { cause: 400 }));
  }


  const validOTP = await compare({ plainText: otp, hash: checkUser.confirmEmailOTP });

  if (!validOTP) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  await dbService.updateOne({
    model: UserModel,
    filter: { email },
    data: {
      confirmEmail: Date.now(),
      $unset: { confirmEmailOTP: 1, confirmEmailOTPExpires: 1 },
      $inc: { __v: 1 }
    },
  });

  return successResponse(res, 200, "Email confirmed successfully");
};  

export const logout = async (req, res, next) => {

  await dbService.create({
    model: TokenModel,
    data: {
      jwtId: req.decoded.jti,
      expiresIn: new Date(req.decoded.exp * 1000),
      userId: req.user._id,
    },
  });

  return successResponse(res, 200, "Logged out successfully");
};

export const refreshToken = async (req, res, next) => {
  const user= req.user;
  const credentials= await getNewLoginCred(user)
  
  return successResponse(res, 200, "Token Refreshed successfully", { credentials });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const otp = await customAlphabet("0123456789qwertyuioplkjhgfdsa", 6)(); 
  const hashOTP = await hash({ plainText: otp });
  const user= await dbService.findOneAndUpdate({
    model: UserModel,
    filter: { email, confirmEmail: { $exists: true } },
    data: {
      forgetPasswordOTP: await hash({ plainText: otp }),
    },

  },);
  if(!user) return next(new Error("User not found or email not confirmed", { cause: 404 }));
  eventEmitter.emit("forgetPassword", { to: email, firstName:user.firstName, otp });
  

  return successResponse(res, 200, "Check your box");
};

export const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;
  const user = await dbService.findOne({
    model: UserModel,
    filter: { email, confirmEmail: { $exists: true } },
  });

  if (!user) return next(new Error("Invalid account", { cause: 404 }));
  if (!await compare({plainText: otp, hash: user.forgetPasswordOTP})) return next(new Error("Invalid OTP", { cause: 400 }));
  const hashPassword = await hash({plainText: password});
  await dbService.updateOne({
    model: UserModel,
    filter: { email },
    data: {
      password: await hash({plainText: password}),
      $unset: { forgetPasswordOTP: true },
      $inc: { __v: 1 }
    },
  });
   
  return successResponse(res, 200, "Password reset successfully");
};
async function verifyGoogleAccount({idToken}){
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
        idToken,
        audience:process.env.CLIENT_ID,
    });
  const payload = ticket.getPayload();
  return payload;
}
export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const ticket = await verifyGoogleAccount({ idToken });

  const { email, email_verified, given_name, family_name } = ticket;

  if (!email_verified) {
    return next(new Error("email not verified", { cause: 401 }));
  }

  const user = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (user && user.providers === providerEnum.GOOGLE) {
    const accessToken = await generateToken({
      payload: { id: user._id, email: user.email },
      secretKey: process.env.TOKEN_ACCESS_SECRET,
      options: {
        expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN),
        issuer: "http://localhost:3000",
        audience: "http://localhost:4000",
        jwtid: uuid(),
      },
    });

    const refreshToken = await generateToken({
      payload: { id: user._id, email: user.email },
      secretKey: process.env.TOKEN_REFRESH_SECRET,
      options: {
        expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN),
        issuer: "http://localhost:3000",
        audience: "http://localhost:4000",
        jwtid: uuid(),
      },
    });

    return successResponse(res, 200, "login successfully", {
      accessToken,
      refreshToken,
    });
  }

  const newUser = await dbService.create({
    model: UserModel,
    data: {
      firstName: given_name,
      lastName: family_name,
      email,
      confirmEmail: Date.now(),
      providers: providerEnum.GOOGLE,
    },
  });

  const accessToken = generateToken({
    payload: { id: newUser._id, email: newUser.email },
    secretKey: process.env.TOKEN_ACCESS_SECRET,
    options: {
      expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN),
      issuer: "http://localhost:3000",
      audience: "http://localhost:4000",
      jwtid: uuid(),
    },
  });

  const refreshToken = generateToken({
    payload: { id: newUser._id, email: newUser.email },
    secretKey: process.env.TOKEN_REFRESH_SECRET,
    options: {
      expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN),
      issuer: "http://localhost:3000",
      audience: "http://localhost:4000",
      jwtid: uuid(),
    },
  });

  return successResponse(res, 200, "login successfully", {
    accessToken,
    refreshToken,
  });
};

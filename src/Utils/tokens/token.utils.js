import jwt from "jsonwebtoken";
import { roleEnum } from "../../DB/models/user.model.js";
import { v4 as uuid } from "uuid";

export const signatureEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const generateToken = ({ payload, secretKey, options = {} }) => {
  if (!secretKey) throw new Error("Secret key is missing when generating token");
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = (token, secretKey) => {
  if (!secretKey) throw new Error("Secret key is missing when verifying token");
  return jwt.verify(token, secretKey);
};

export const getsignature = async ({ signatureLevel = signatureEnum.USER }) => {
  let signatures = {
    accessSignature: undefined,
    refreshSignature: undefined,
  };

  switch (signatureLevel) {
    case signatureEnum.ADMIN:
      signatures.accessSignature = process.env.TOKEN_ACCESS_ADMIN_SECRET;
      signatures.refreshSignature = process.env.TOKEN_REFRESH_ADMIN_SECRET;
      break;

    default:
      signatures.accessSignature = process.env.TOKEN_ACCESS_USER_SECRET;
      signatures.refreshSignature = process.env.TOKEN_REFRESH_USER_SECRET;
      break;
  }

  return signatures;
};

export const getNewLoginCred = async (user) => {
  const signatures = await getsignature({
    signatureLevel:
      user.role !== roleEnum.USER ? signatureEnum.ADMIN : signatureEnum.USER,
  });

  const jwtid = uuid();

  const payload = {
    id: user._id.toString(),
    email: user.email,
  };

  const accessToken = generateToken({
    payload,
    secretKey: signatures.accessSignature,
    options: {
      expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN),
      jwtid,
    },
  });

  const refreshToken = generateToken({
    payload,
    secretKey: signatures.refreshSignature,
    options: {
      expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN),
      jwtid,
    },
  });

  return { accessToken, refreshToken };
};



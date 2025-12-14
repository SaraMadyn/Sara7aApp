import * as dbService from "../DB/dbService.js";
import TokenModel from "../DB/models/token.model.js";
import UserModel from "../DB/models/user.model.js";
import { verifyToken, getsignature, signatureEnum } from "../Utils/tokens/token.utils.js";

export const tokenTypeEnum = {
  ACCESS: "ACCESS",
  REFRESH: "REFRESH",
};

const decodedToken = async ({
  authorization,
  tokenType = tokenTypeEnum.ACCESS,
  next,
} = {}) => {
  if (!authorization) {
    return next(new Error("Missing authorization header", { cause: 400 }));
  }

  authorization = authorization.trim();

  const parts = authorization.split(" ");

  if (parts.length < 2) {
    return next(new Error("Invalid authorization format", { cause: 400 }));
  }

  const bearerType = parts[0]; 
  const token = parts[1];

  if (!token || token === "" || token === "null" || token === "undefined") {
    return next(new Error("Token not provided", { cause: 400 }));
  }

  const level =
    bearerType.toUpperCase() === "ADMIN"
      ? signatureEnum.ADMIN
      : signatureEnum.USER;

  const signatures = await getsignature({ signatureLevel: level });

  const secretKey =
    tokenType === tokenTypeEnum.ACCESS
      ? signatures.accessSignature
      : signatures.refreshSignature;

  let decoded;
  try {
    decoded = verifyToken(token, secretKey);
  } catch (err) {
    return next(new Error("Invalid or expired token", { cause: 401 }));
  }

  if (!decoded?.id || decoded.id === "") {
    return next(new Error("Invalid token payload: missing id", { cause: 400 }));
  }

  if (!decoded?.jti) {
    return next(new Error("Invalid token payload: missing jwt id", { cause: 400 }));
  }

  const revokedToken = await dbService.findOne({
    model: TokenModel,
    filter: { jwtId: decoded.jti },
  });

  if (revokedToken) {
    return next(new Error("Token is revoked", { cause: 401 }));
  }

  const user = await dbService.findById({
    model: UserModel,
    id: decoded.id,
  });

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  return { user, decoded };
};

export const authorization =
  ({ tokenType = tokenTypeEnum.ACCESS } = {}) =>
  async (req, res, next) => {
    const data = await decodedToken({
      authorization: req.headers.authorization,
      tokenType,
      next,
    });

    if (!data) return;

    req.user = data.user;
    req.decoded = data.decoded;

    return next();
  };

export const authorizationAdmin = ({ accessRoles = [] } = {}) => {
  return (req, res, next) => {
    if (!req.user || !accessRoles.includes(req.user.role)) {
      return next(new Error("Unauthorized access", { cause: 403 }));
    }
    return next();
  };
};

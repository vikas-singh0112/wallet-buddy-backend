import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new ApiError(401, "Unauthorized -no token"));
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token!,
    process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
    (err, decoded) => {
      if (err) {
        return next(new ApiError(403, "Forbidden -invalid token"));
      }
      req.user = decoded;
      next();
    }
  );
};

export default authenticateJWT;

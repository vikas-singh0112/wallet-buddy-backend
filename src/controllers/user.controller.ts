import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../db/prismaInstance";
import { userIdSchema } from "../utils/schema";
import type { AuthenticatedRequest } from "../middleware/authenticateJWT";
import { ApiResponse } from "../utils/ApiResponse";

const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = userIdSchema.parse(req.user);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
      phone: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "user not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "successfully got current user"));
};

const logoutUser = async (req: AuthenticatedRequest, res: Response) => {
  const refreshToken = req.cookies.wallet_buddy_r;
  if (!refreshToken) {
    throw new ApiError(400, "No refresh token provided");
  }

  const removedRefreshTokenFromDb = await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
  if (!removedRefreshTokenFromDb) {
    throw new ApiError(500, "unable to remove refreshtoken from db");
  }

  res.clearCookie("wallet_buddy_r");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "user logged out successfully"));
};

export { getCurrentUser, logoutUser };

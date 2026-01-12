import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../db/prismaInstance";
import { loginSchema, signUpSchema } from "../utils/schema";
import { ApiResponse } from "../utils/ApiResponse";
import { generateAccessToken, generateRefreshToken } from "../utils/JWT";

interface ISignupUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface ILoginUser {
  email: string;
  password: string;
}

const signup = async (
  req: Request<{}, {}, ISignupUser>,
  res: Response
): Promise<Response> => {
  const data = signUpSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ApiError(409, "user already exist with this email");
  }
  const hashedPassword = await Bun.password.hash(data.password, {
    algorithm: "argon2id",
    memoryCost: 16384,
    timeCost: 2,
  });

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName.toLowerCase(),
      lastName: data.lastName.toLowerCase(),
      email: data.email.toLowerCase(),
      phone: data.phone,
      password: hashedPassword,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, user, "user registered successfully"));
};

const signin = async (
  req: Request<{}, {}, ILoginUser>,
  res: Response
): Promise<Response> => {
  const data = loginSchema.parse(req.body);
  let user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  //compare password
  const matchPassword = await Bun.password.verify(data.password, user.password);
  if (!matchPassword) {
    throw new ApiError(401, "invalid credentials");
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  const { password, updatedAt, ...userData } = user;

  res.cookie("wallet_buddy_r", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 10 * 24 * 60 * 60 * 1000,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { userData, accessToken },
        "user loggedin successfully"
      )
    );
};

export { signup, signin };

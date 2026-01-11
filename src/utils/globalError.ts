import type { ErrorRequestHandler } from "express";
import { ApiError } from "./ApiError";
import { ZodError } from "zod";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.issues.map((e) => ({
        path: e.path[0],
        message: e.message,
      })),
    });
  }

  // any error which we did not expected like db crash etc
  if (!(err instanceof ApiError)) {
    console.error("UNEXPECTED ERROR 💥:", err);
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    data: null,

    // Only show stack trace in development
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

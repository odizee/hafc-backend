import { NextFunction, Request, Response } from "express";
import { HttpException } from "../exceptions/root";
import { AppError } from "../types/error";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
    errors: error.errors,
  });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!err || !(err instanceof Error)) {
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    });
  }

  // Log error for debugging
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req?.path,
    method: req?.method,
  });

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    return handlePrismaError(err, res);
  }

  // Handle custom AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      code: err.code,
      message: err.message,
      ...(err.data && { data: err.data }),
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
};

const handlePrismaError = (
  err: PrismaClientKnownRequestError,
  res: Response
) => {
  switch (err.code) {
    case "P2002":
      return res.status(409).json({
        status: "error",
        code: "UNIQUE_CONSTRAINT_VIOLATION",
        message: "A record with this value already exists",
      });
    case "P2025":
      return res.status(404).json({
        status: "error",
        code: "NOT_FOUND",
        message: "Record not found",
      });
    default:
      return res.status(500).json({
        status: "error",
        code: "DATABASE_ERROR",
        message: "Database operation failed",
      });
  }
};

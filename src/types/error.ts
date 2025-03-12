export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, data?: any) {
    super(400, message, "VALIDATION_ERROR", data);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(401, message, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND_ERROR");
    this.name = "NotFoundError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(500, message, "DATABASE_ERROR");
    this.name = "DatabaseError";
  }
}

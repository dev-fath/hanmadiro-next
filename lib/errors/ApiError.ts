export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(400, message, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "리소스를 찾을 수 없습니다") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "인증이 필요합니다") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "권한이 없습니다") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = "서버 오류가 발생했습니다") {
    super(500, message);
    this.name = "InternalServerError";
  }
}


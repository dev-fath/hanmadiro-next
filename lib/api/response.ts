import { NextResponse } from "next/server";
import { ApiError } from "@/lib/errors/ApiError";
import logger from "@/lib/logger";

export interface ApiResponse<T = unknown> {
  code: number;
  data: T | null;
  message: string;
}

export function successResponse<T>(
  data: T,
  message: string = "Success",
  code: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      code,
      data,
      message,
    },
    { status: code }
  );
}

export function errorResponse(
  error: unknown,
  defaultMessage: string = "서버 오류가 발생했습니다"
): NextResponse<ApiResponse<null>> {
  if (error instanceof ApiError) {
    logger.error(`API Error [${error.code}]: ${error.message}`, {
      error: error.details,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        code: error.code,
        data: null,
        message: error.message,
      },
      { status: error.code }
    );
  }

  // 예상치 못한 에러
  logger.error("Unexpected error", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  const isDevelopment = process.env.NODE_ENV === "development";
  const message = isDevelopment && error instanceof Error ? error.message : defaultMessage;

  return NextResponse.json(
    {
      code: 500,
      data: null,
      message,
    },
    { status: 500 }
  );
}


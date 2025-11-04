import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { UnauthorizedError } from "@/lib/errors/ApiError";
import logger from "@/lib/logger";

// Rate limiting 설정
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: NextRequest): boolean => {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
    const key = `${ip}-${req.nextUrl.pathname}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  };
}

// 로그인 API: 분당 5회 제한
export const loginRateLimiter = createRateLimiter(5, 60 * 1000);

// 회원가입 API: 시간당 3회 제한
export const registerRateLimiter = createRateLimiter(3, 60 * 60 * 1000);

// 일반 API: 분당 100회 제한
export const generalRateLimiter = createRateLimiter(100, 60 * 1000);

// 인증 미들웨어
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new UnauthorizedError();
  }

  return session;
}

// API 요청 로깅 미들웨어
export function logRequest(req: NextRequest) {
  const startTime = Date.now();

  return () => {
    const duration = Date.now() - startTime;
    logger.info("API Request", {
      method: req.method,
      path: req.nextUrl.pathname,
      duration: `${duration}ms`,
      ip: req.ip || req.headers.get("x-forwarded-for") || "unknown",
    });
  };
}


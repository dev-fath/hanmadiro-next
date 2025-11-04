import { NextRequest } from "next/server";
import { getEnv } from "@/lib/validation/env";
import { cleanupInvalidTokens } from "@/lib/cron/cleanupTokens";
import { successResponse, errorResponse } from "@/lib/api/response";
import { UnauthorizedError } from "@/lib/errors/ApiError";
import logger from "@/lib/logger";

/**
 * @swagger
 * /api/cron/cleanup-tokens:
 *   get:
 *     summary: 유효하지 않은 토큰 정리 작업
 *     tags: [Cron]
 *     description: 30일 이상 사용되지 않은 유효하지 않은 푸시 토큰을 삭제합니다
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: 유효하지 않은 토큰 정리 작업이 완료되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *       401:
 *         description: 유효하지 않은 API 키
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(req: NextRequest) {
  try {
    // API 키 검증
    const apiKey = req.headers.get("x-api-key");
    const env = getEnv();

    if (apiKey !== env.CRON_API_KEY) {
      throw new UnauthorizedError("유효하지 않은 API 키입니다");
    }

    await cleanupInvalidTokens();

    return successResponse(null, "유효하지 않은 토큰 정리 작업이 완료되었습니다");
  } catch (error) {
    logger.error("Cleanup tokens cron failed", { error });
    return errorResponse(error);
  }
}


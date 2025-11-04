import { NextRequest } from "next/server";
import { getEnv } from "@/lib/validation/env";
import { assignDailyMessages } from "@/lib/cron/dailyAssignment";
import { successResponse, errorResponse } from "@/lib/api/response";
import { UnauthorizedError } from "@/lib/errors/ApiError";
import logger from "@/lib/logger";

/**
 * @swagger
 * /api/cron/daily-assignment:
 *   get:
 *     summary: 일일 메시지 할당 작업
 *     tags: [Cron]
 *     description: 모든 유효한 푸시 토큰에 대해 랜덤 메시지를 할당하고 발송합니다
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: 일일 메시지 할당 작업이 완료되었습니다
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

    await assignDailyMessages();

    return successResponse(null, "일일 메시지 할당 작업이 완료되었습니다");
  } catch (error) {
    logger.error("Daily assignment cron failed", { error });
    return errorResponse(error);
  }
}


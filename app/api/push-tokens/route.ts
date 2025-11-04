import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors/ApiError";
import { logRequest, generalRateLimiter } from "@/lib/api/middleware";

const createPushTokenSchema = z.object({
  token: z.string().min(1, "토큰은 필수입니다"),
});

/**
 * @swagger
 * /api/push-tokens:
 *   post:
 *     summary: 푸시 토큰 등록
 *     tags: [푸시 토큰]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM 푸시 토큰
 *                 example: "fcm-token-example-12345"
 *     responses:
 *       201:
 *         description: 푸시 토큰이 성공적으로 등록되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(req: NextRequest) {
  const logEnd = logRequest(req);

  try {
    if (!generalRateLimiter(req)) {
      return errorResponse(new Error("너무 많은 요청입니다"), "요청 제한을 초과했습니다");
    }

    const body = await req.json();
    const validated = createPushTokenSchema.safeParse(body);

    if (!validated.success) {
      throw new ValidationError(
        validated.error.errors[0]?.message || "입력값이 유효하지 않습니다",
        validated.error.errors
      );
    }

    const { token } = validated.data;

    // 기존 토큰이 있으면 업데이트, 없으면 생성
    const pushToken = await prisma.pushToken.upsert({
      where: { token },
      update: {
        isValid: true,
        lastUsedAt: new Date(),
      },
      create: {
        token,
        isValid: true,
        lastUsedAt: new Date(),
      },
    });

    logEnd();
    return successResponse(
      { id: pushToken.id, token: pushToken.token.substring(0, 20) + "..." },
      "푸시 토큰이 등록되었습니다",
      201
    );
  } catch (error) {
    logEnd();
    return errorResponse(error);
  }
}


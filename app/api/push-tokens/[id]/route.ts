import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { ValidationError, NotFoundError } from "@/lib/errors/ApiError";
import { requireAuth, logRequest, generalRateLimiter } from "@/lib/api/middleware";

const updatePushTokenSchema = z.object({
  token: z.string().min(1, "토큰은 필수입니다").optional(),
  isValid: z.boolean().optional(),
});

/**
 * @swagger
 * /api/push-tokens/{id}:
 *   put:
 *     summary: 푸시 토큰 갱신
 *     tags: [푸시 토큰]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 푸시 토큰 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: 새로운 FCM 토큰
 *               isValid:
 *                 type: boolean
 *                 description: 토큰 유효성
 *     responses:
 *       200:
 *         description: 푸시 토큰이 성공적으로 갱신되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/PushToken'
 *                 message:
 *                   type: string
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 푸시 토큰을 찾을 수 없습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logEnd = logRequest(req);
  const { id } = await params;

  try {
    await requireAuth();

    if (!generalRateLimiter(req)) {
      return errorResponse(new Error("너무 많은 요청입니다"), "요청 제한을 초과했습니다");
    }

    const body = await req.json();
    const validated = updatePushTokenSchema.safeParse(body);

    if (!validated.success) {
      throw new ValidationError(
        validated.error.errors[0]?.message || "입력값이 유효하지 않습니다",
        validated.error.errors
      );
    }

    const updateData: { token?: string; isValid?: boolean; lastUsedAt?: Date } = {};

    if (validated.data.token !== undefined) {
      updateData.token = validated.data.token;
    }

    if (validated.data.isValid !== undefined) {
      updateData.isValid = validated.data.isValid;
      if (validated.data.isValid) {
        updateData.lastUsedAt = new Date();
      }
    }

    const pushToken = await prisma.pushToken.update({
      where: { id },
      data: updateData,
    });

    logEnd();
    return successResponse(
      {
        id: pushToken.id,
        token: pushToken.token.substring(0, 20) + "...",
        isValid: pushToken.isValid,
      },
      "푸시 토큰이 갱신되었습니다"
    );
  } catch (error) {
    logEnd();
    if (error instanceof Error && error.message.includes("Record to update does not exist")) {
      return errorResponse(new NotFoundError("푸시 토큰을 찾을 수 없습니다"));
    }
    return errorResponse(error);
  }
}


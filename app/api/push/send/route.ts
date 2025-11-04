import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { sendPushNotification } from "@/lib/firebase/push";
import { successResponse, errorResponse } from "@/lib/api/response";
import { ValidationError, NotFoundError } from "@/lib/errors/ApiError";
import { requireAuth, logRequest, generalRateLimiter } from "@/lib/api/middleware";

const sendPushSchema = z.object({
  pushTokenId: z.string().uuid("유효하지 않은 푸시 토큰 ID입니다"),
  messageId: z.string().uuid("유효하지 않은 메시지 ID입니다"),
});

/**
 * @swagger
 * /api/push/send:
 *   post:
 *     summary: 수동 푸시 발송
 *     tags: [푸시 발송]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pushTokenId
 *               - messageId
 *             properties:
 *               pushTokenId:
 *                 type: string
 *                 format: uuid
 *                 description: 푸시 토큰 ID
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               messageId:
 *                 type: string
 *                 format: uuid
 *                 description: 메시지 ID
 *                 example: "123e4567-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: 푸시 메시지가 발송되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignmentId:
 *                       type: string
 *                       format: uuid
 *                     success:
 *                       type: boolean
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
 *         description: 리소스를 찾을 수 없습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(req: NextRequest) {
  const logEnd = logRequest(req);

  try {
    await requireAuth();

    if (!generalRateLimiter(req)) {
      return errorResponse(new Error("너무 많은 요청입니다"), "요청 제한을 초과했습니다");
    }

    const body = await req.json();
    const validated = sendPushSchema.safeParse(body);

    if (!validated.success) {
      throw new ValidationError(
        validated.error.errors[0]?.message || "입력값이 유효하지 않습니다",
        validated.error.errors
      );
    }

    const { pushTokenId, messageId } = validated.data;

    // 푸시 토큰과 메시지 조회
    const [pushToken, message] = await Promise.all([
      prisma.pushToken.findUnique({
        where: { id: pushTokenId },
      }),
      prisma.message.findUnique({
        where: { id: messageId },
      }),
    ]);

    if (!pushToken) {
      throw new NotFoundError("푸시 토큰을 찾을 수 없습니다");
    }

    if (!message) {
      throw new NotFoundError("메시지를 찾을 수 없습니다");
    }

    if (!pushToken.isValid) {
      throw new ValidationError("유효하지 않은 푸시 토큰입니다");
    }

    // 푸시 발송
    const success = await sendPushNotification({
      token: pushToken.token,
      title: message.title,
      body: message.body,
    });

    // 발송 기록 저장
    const assignment = await prisma.messageAssignment.create({
      data: {
        pushTokenId,
        messageId,
        sentAt: new Date(),
        status: success ? "SENT" : "FAILED",
      },
    });

    await prisma.pushLog.create({
      data: {
        pushTokenId,
        messageId,
        sentAt: new Date(),
        success,
        ...(success ? {} : { errorMessage: "푸시 발송 실패" }),
      },
    });

    // 실패 시 토큰을 무효화
    if (!success) {
      await prisma.pushToken.update({
        where: { id: pushTokenId },
        data: { isValid: false },
      });
    } else {
      await prisma.pushToken.update({
        where: { id: pushTokenId },
        data: { lastUsedAt: new Date() },
      });
    }

    logEnd();
    return successResponse(
      { assignmentId: assignment.id, success },
      success ? "푸시 메시지가 발송되었습니다" : "푸시 메시지 발송에 실패했습니다"
    );
  } catch (error) {
    logEnd();
    return errorResponse(error);
  }
}


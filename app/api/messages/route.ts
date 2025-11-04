import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createMessageSchema } from "@/lib/validation/message";
import { ValidationError } from "@/lib/errors/ApiError";
import { requireAuth, logRequest, generalRateLimiter } from "@/lib/api/middleware";

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: 메시지 목록 조회
 *     tags: [메시지]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 메시지 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 message:
 *                   type: string
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(req: NextRequest) {
  const logEnd = logRequest(req);

  try {
    await requireAuth();

    if (!generalRateLimiter(req)) {
      return errorResponse(new Error("너무 많은 요청입니다"), "요청 제한을 초과했습니다");
    }

    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });

    logEnd();
    return successResponse(messages, "메시지 목록을 조회했습니다");
  } catch (error) {
    logEnd();
    return errorResponse(error);
  }
}

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: 메시지 생성
 *     tags: [메시지]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 description: 메시지 제목
 *                 example: "오늘의 명언"
 *               body:
 *                 type: string
 *                 maxLength: 255
 *                 description: 메시지 내용
 *                 example: "성공은 준비된 자에게 찾아온다"
 *     responses:
 *       201:
 *         description: 메시지가 성공적으로 생성되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/Message'
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
 */
export async function POST(req: NextRequest) {
  const logEnd = logRequest(req);

  try {
    await requireAuth();

    if (!generalRateLimiter(req)) {
      return errorResponse(new Error("너무 많은 요청입니다"), "요청 제한을 초과했습니다");
    }

    const body = await req.json();
    const validated = createMessageSchema.safeParse(body);

    if (!validated.success) {
      throw new ValidationError(
        validated.error.errors[0]?.message || "입력값이 유효하지 않습니다",
        validated.error.errors
      );
    }

    const message = await prisma.message.create({
      data: validated.data,
    });

    logEnd();
    return successResponse(message, "메시지가 생성되었습니다", 201);
  } catch (error) {
    logEnd();
    return errorResponse(error);
  }
}


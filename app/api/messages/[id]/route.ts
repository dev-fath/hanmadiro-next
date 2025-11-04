import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { updateMessageSchema } from "@/lib/validation/message";
import { ValidationError, NotFoundError } from "@/lib/errors/ApiError";
import { requireAuth, logRequest, generalRateLimiter } from "@/lib/api/middleware";

/**
 * @swagger
 * /api/messages/{id}:
 *   put:
 *     summary: 메시지 수정
 *     tags: [메시지]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 메시지 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 description: 메시지 제목
 *               body:
 *                 type: string
 *                 maxLength: 255
 *                 description: 메시지 내용
 *     responses:
 *       200:
 *         description: 메시지가 성공적으로 수정되었습니다
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
 *       404:
 *         description: 메시지를 찾을 수 없습니다
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
    const validated = updateMessageSchema.safeParse(body);

    if (!validated.success) {
      throw new ValidationError(
        validated.error.errors[0]?.message || "입력값이 유효하지 않습니다",
        validated.error.errors
      );
    }

    const message = await prisma.message.update({
      where: { id },
      data: validated.data,
    });

    logEnd();
    return successResponse(message, "메시지가 수정되었습니다");
  } catch (error) {
    logEnd();
    if (error instanceof Error && error.message.includes("Record to update does not exist")) {
      return errorResponse(new NotFoundError("메시지를 찾을 수 없습니다"));
    }
    return errorResponse(error);
  }
}

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: 메시지 삭제
 *     tags: [메시지]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 메시지 ID
 *     responses:
 *       200:
 *         description: 메시지가 성공적으로 삭제되었습니다
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
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 메시지를 찾을 수 없습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function DELETE(
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

    await prisma.message.delete({
      where: { id },
    });

    logEnd();
    return successResponse(null, "메시지가 삭제되었습니다");
  } catch (error) {
    logEnd();
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return errorResponse(new NotFoundError("메시지를 찾을 수 없습니다"));
    }
    return errorResponse(error);
  }
}


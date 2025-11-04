import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAuth, logRequest, generalRateLimiter } from "@/lib/api/middleware";

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: 발송 기록 조회
 *     tags: [발송 기록]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 발송 기록 조회 성공
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
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PushLog'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.pushLog.findMany({
        skip,
        take: limit,
        orderBy: { sentAt: "desc" },
        include: {
          pushToken: {
            select: {
              id: true,
              token: true,
            },
          },
          message: {
            select: {
              id: true,
              title: true,
              body: true,
            },
          },
        },
      }),
      prisma.pushLog.count(),
    ]);

    logEnd();
    return successResponse(
      {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "발송 기록을 조회했습니다"
    );
  } catch (error) {
    logEnd();
    return errorResponse(error);
  }
}

